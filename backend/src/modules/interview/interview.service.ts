import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { InterviewSession } from './entities/interview-session.entity';
import { InterviewAnswer } from './entities/interview-answer.entity';
import { Question } from '../question/entities/question.entity';
import { Evaluation } from '../evaluation/entities/evaluation.entity';
import { QuestionService } from '../question/question.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { SubmitAnswerDto } from './dto/submit-answer.dto';
import { SessionResponseDto, CurrentQuestionDto } from './dto/session-response.dto';
import { AnswerFeedbackDto, AnswerResponseDto } from './dto/answer-response.dto';
import { InterviewHistoryItemDto } from './dto/interview-history-response.dto';
import { OpenAIService } from '../../infrastructure/openai/openai.service';

@Injectable()
export class InterviewService {
  constructor(
    @InjectRepository(InterviewSession)
    private readonly sessionRepository: Repository<InterviewSession>,
    @InjectRepository(InterviewAnswer)
    private readonly answerRepository: Repository<InterviewAnswer>,
    @InjectRepository(Question)
    private readonly questionRepository: Repository<Question>,
    @InjectRepository(Evaluation)
    private readonly evaluationRepository: Repository<Evaluation>,
    private readonly questionService: QuestionService,
    private readonly openaiService: OpenAIService,
  ) {}

  async findHistory(userId: number): Promise<InterviewHistoryItemDto[]> {
    const sessions = await this.sessionRepository.find({
      where: { userId },
      relations: ['resume', 'questionSet', 'answers'],
      order: { startedAt: 'DESC' },
      take: 50,
    });

    if (sessions.length === 0) {
      return [];
    }

    const evaluations = await this.evaluationRepository.find({
      where: { sessionId: In(sessions.map((session) => session.id)) },
    });
    const evaluationBySessionId = new Map(
      evaluations.map((evaluation) => [evaluation.sessionId, evaluation]),
    );

    return sessions.map((session) => {
      const evaluation = evaluationBySessionId.get(session.id);

      return {
        id: session.id,
        questionSetId: session.questionSetId,
        resumeId: session.resumeId,
        resumeTitle: this.decodeOriginalName(session.resume?.title || '이력서'),
        status: session.status,
        difficulty: session.difficulty,
        totalQuestions: session.totalQuestions,
        answeredCount: session.answers?.length || 0,
        jobPostingApplied: Boolean(session.questionSet?.jobPosting),
        hasEvaluation: Boolean(evaluation),
        overallScore: evaluation?.overallScore ?? null,
        startedAt: session.startedAt,
        completedAt: session.completedAt,
      };
    });
  }

  async createSession(
    userId: number,
    dto: CreateSessionDto,
  ): Promise<SessionResponseDto> {
    const questionSet = await this.questionService.findById(userId, dto.questionSetId);

    const firstQuestion = await this.questionRepository.findOne({
      where: { questionSetId: dto.questionSetId, order: 1 },
    });

    if (!firstQuestion) {
      throw new NotFoundException('질문을 찾을 수 없습니다.');
    }

    const session = this.sessionRepository.create({
      userId,
      resumeId: questionSet.resumeId,
      questionSetId: dto.questionSetId,
      status: 'in_progress',
      totalQuestions: questionSet.questionCount,
      difficulty: questionSet.difficulty,
    });

    const savedSession = await this.sessionRepository.save(session);

    return {
      id: savedSession.id,
      questionSetId: savedSession.questionSetId,
      status: savedSession.status,
      currentOrder: 1,
      totalQuestions: savedSession.totalQuestions,
      currentQuestion: this.toCurrentQuestion(firstQuestion),
      startedAt: savedSession.startedAt,
    };
  }

  async submitAnswer(
    userId: number,
    sessionId: number,
    dto: SubmitAnswerDto,
  ): Promise<AnswerResponseDto> {
    const session = await this.sessionRepository.findOne({
      where: { id: sessionId },
    });

    if (!session) {
      throw new NotFoundException('면접 세션을 찾을 수 없습니다.');
    }

    if (session.userId !== userId) {
      throw new ForbiddenException('본인의 면접 세션만 접근할 수 있습니다.');
    }

    if (session.status === 'completed') {
      throw new ConflictException('이미 완료된 면접 세션입니다.');
    }

    const question = await this.questionRepository.findOne({
      where: { id: dto.questionId, questionSetId: session.questionSetId },
    });

    if (!question) {
      throw new BadRequestException('해당 세션에 속하지 않는 질문입니다.');
    }

    let answer = await this.answerRepository.findOne({
      where: { sessionId, questionId: dto.questionId },
    });

    if (answer) {
      answer.content = dto.content;
    } else {
      answer = this.answerRepository.create({
        sessionId,
        questionId: dto.questionId,
        content: dto.content,
      });
    }

    const savedAnswer = await this.answerRepository.save(answer);
    const feedback = this.openaiService.isMockMode()
      ? this.getMockAnswerFeedback(savedAnswer.content)
      : await this.openaiService.withMockFallback(
          'interview.answerFeedback',
          () => this.openaiService.generateAnswerFeedback(question.content, savedAnswer.content),
          () => this.getMockAnswerFeedback(savedAnswer.content),
        );

    let nextQuestion: CurrentQuestionDto | null = null;
    let sessionStatus: string | undefined;
    let hasFollowUp = false;

    const followUpQuestion = await this.getOrCreateFollowUpQuestion(
      session,
      question,
      savedAnswer.content,
    );

    if (followUpQuestion) {
      nextQuestion = this.toCurrentQuestion(followUpQuestion);
      hasFollowUp = true;
    }

    const answeredCount = await this.answerRepository.count({
      where: { sessionId },
    });

    if (!nextQuestion && question.order >= session.totalQuestions && answeredCount >= session.totalQuestions) {
      session.status = 'completed';
      session.completedAt = new Date();
      await this.sessionRepository.save(session);
      sessionStatus = 'completed';
    } else if (!nextQuestion) {
      const nextOrder = question.order + 1;
      const next = await this.questionRepository.findOne({
        where: { questionSetId: session.questionSetId, order: nextOrder },
      });

      if (next) {
        nextQuestion = this.toCurrentQuestion(next);
      }
    }

    const response: AnswerResponseDto = {
      id: savedAnswer.id,
      sessionId: savedAnswer.sessionId,
      questionId: savedAnswer.questionId,
      content: savedAnswer.content,
      feedback,
      nextQuestion,
      progress: {
        current: nextQuestion ? nextQuestion.order : Math.min(question.order, session.totalQuestions),
        total: session.totalQuestions,
      },
      hasFollowUp,
      submittedAt: savedAnswer.submittedAt,
    };

    if (sessionStatus) {
      response.sessionStatus = sessionStatus;
    }

    return response;
  }

  private getMockAnswerFeedback(answer: string): AnswerFeedbackDto {
    const isUnknown = answer.replace(/\s/g, '').includes('모르겠습니다');

    if (isUnknown) {
      return {
        isCorrect: false,
        explanation: '모른다고 표시했습니다. 이 질문은 핵심 개념, 실제 사용 상황, 장단점 순서로 다시 정리해보면 좋습니다.',
      };
    }

    return {
      isCorrect: true,
      explanation: '핵심 방향은 적절합니다. 더 좋은 답변을 위해 실제 경험, 선택 이유, 대안과의 비교를 한두 문장 추가해보세요.',
    };
  }

  private async getOrCreateFollowUpQuestion(
    session: InterviewSession,
    question: Question,
    answer: string,
  ): Promise<Question | null> {
    if (!this.shouldGenerateFollowUp(question, answer)) {
      return null;
    }

    const existing = await this.questionRepository.findOne({
      where: {
        questionSetId: session.questionSetId,
        parentQuestionId: question.id,
        questionType: 'follow_up',
      },
    });

    if (existing) {
      return existing;
    }

    const followUp = this.openaiService.isMockMode()
      ? this.getMockFollowUpQuestion(question)
      : await this.openaiService.withMockFallback(
          'interview.followUpQuestion',
          () =>
            this.openaiService.generateFollowUpQuestion({
              question: question.content,
              answer,
              category: question.category,
              difficulty: question.difficulty,
            }),
          () => this.getMockFollowUpQuestion(question),
        );

    await this.questionRepository
      .createQueryBuilder()
      .update(Question)
      .set({ order: () => '"order" + 1' })
      .where('question_set_id = :questionSetId', { questionSetId: session.questionSetId })
      .andWhere('"order" > :order', { order: question.order })
      .execute();

    const savedFollowUp = await this.questionRepository.save(
      this.questionRepository.create({
        questionSetId: session.questionSetId,
        parentQuestionId: question.id,
        content: followUp.content,
        category: followUp.category || question.category,
        difficulty: followUp.difficulty || question.difficulty,
        order: question.order + 1,
        questionType: 'follow_up',
      }),
    );

    session.totalQuestions += 1;
    await this.sessionRepository.save(session);

    return savedFollowUp;
  }

  private shouldGenerateFollowUp(question: Question, answer: string): boolean {
    if (question.questionType === 'follow_up') {
      return false;
    }

    const compactAnswer = answer.replace(/\s/g, '');
    if (!compactAnswer || compactAnswer.includes('모르겠습니다')) {
      return false;
    }

    return true;
  }

  private getMockFollowUpQuestion(question: Question): {
    content: string;
    category: string;
    difficulty: string;
  } {
    return {
      content: `${question.content}에 대한 답변을 실제 프로젝트에 적용했던 상황으로 확장해서, 선택한 방식과 대안 대비 장단점을 설명해주세요.`,
      category: question.category,
      difficulty: question.difficulty,
    };
  }

  private toCurrentQuestion(question: Question): CurrentQuestionDto {
    return {
      id: question.id,
      content: question.content,
      category: question.category,
      difficulty: question.difficulty,
      order: question.order,
      isFollowUp: question.questionType === 'follow_up',
      parentQuestionId: question.parentQuestionId,
    };
  }

  private decodeOriginalName(value: string): string {
    if (!this.looksLikeMojibake(value)) {
      return value;
    }

    try {
      return Buffer.from(value, 'latin1').toString('utf8');
    } catch {
      return value;
    }
  }

  private looksLikeMojibake(value: string): boolean {
    return /[ÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖ×ØÙÚÛÜÝÞßàáâãäåæçèéêëìíîïðñòóôõö÷øùúûüýþÿ]/.test(value);
  }
}
