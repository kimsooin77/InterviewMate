import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import OpenAI from 'openai';
import { InterviewSession } from './entities/interview-session.entity';
import { InterviewAnswer } from './entities/interview-answer.entity';
import { Question } from '../question/entities/question.entity';
import { QuestionService } from '../question/question.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { SubmitAnswerDto } from './dto/submit-answer.dto';
import { SessionResponseDto, CurrentQuestionDto } from './dto/session-response.dto';
import { AnswerFeedbackDto, AnswerResponseDto } from './dto/answer-response.dto';
import { getOpenAIConfig } from '../../config/openai.config';

@Injectable()
export class InterviewService {
  private readonly openai: OpenAI;
  private readonly openaiModel: string;
  private readonly openaiTemperature: number;
  private readonly useMockAI: boolean;

  constructor(
    @InjectRepository(InterviewSession)
    private readonly sessionRepository: Repository<InterviewSession>,
    @InjectRepository(InterviewAnswer)
    private readonly answerRepository: Repository<InterviewAnswer>,
    @InjectRepository(Question)
    private readonly questionRepository: Repository<Question>,
    private readonly questionService: QuestionService,
    private readonly configService: ConfigService,
  ) {
    const openaiConfig = getOpenAIConfig(configService);
    this.openai = new OpenAI({ apiKey: openaiConfig.apiKey });
    this.openaiModel = openaiConfig.model;
    this.openaiTemperature = openaiConfig.temperature;
    this.useMockAI = configService.get<string>('USE_MOCK_AI', 'false') === 'true';
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
    const feedback = this.useMockAI
      ? this.getMockAnswerFeedback(savedAnswer.content)
      : await this.callOpenAIAnswerFeedback(question.content, savedAnswer.content);

    const answeredCount = await this.answerRepository.count({
      where: { sessionId },
    });

    const nextOrder = question.order + 1;
    let nextQuestion: CurrentQuestionDto | null = null;
    let sessionStatus: string | undefined;

    if (question.order >= session.totalQuestions && answeredCount >= session.totalQuestions) {
      session.status = 'completed';
      session.completedAt = new Date();
      await this.sessionRepository.save(session);
      sessionStatus = 'completed';
    } else {
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

  private async callOpenAIAnswerFeedback(
    question: string,
    answer: string,
  ): Promise<AnswerFeedbackDto> {
    const systemPrompt = `You are a technical interviewer.
Evaluate the candidate's answer immediately after one interview question.
Return JSON with:
- isCorrect: boolean
- explanation: Korean explanation with the correct concept and what to improve.

Rules:
- Be concise but useful.
- If the answer says they do not know, isCorrect must be false.
- Do not invent candidate experience.`;

    const userPrompt = `질문: ${question}

답변: ${answer}`;

    const response = await this.openai.chat.completions.create({
      model: this.openaiModel,
      temperature: this.openaiTemperature,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('OpenAI 응답이 비어있습니다.');
    }

    return JSON.parse(content);
  }

  private toCurrentQuestion(question: Question): CurrentQuestionDto {
    return {
      id: question.id,
      content: question.content,
      category: question.category,
      difficulty: question.difficulty,
      order: question.order,
    };
  }
}
