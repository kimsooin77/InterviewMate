import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Evaluation } from './entities/evaluation.entity';
import { EvaluationItem } from './entities/evaluation-item.entity';
import { InterviewSession } from '../interview/entities/interview-session.entity';
import { InterviewAnswer } from '../interview/entities/interview-answer.entity';
import { CreateEvaluationDto } from './dto/create-evaluation.dto';
import { EvaluationResponseDto } from './dto/evaluation-response.dto';
import { EvaluationItemResponseDto } from './dto/evaluation-item-response.dto';
import { ReportService } from '../report/report.service';
import { OpenAIService } from '../../infrastructure/openai/openai.service';
import { AnswerEvaluationResult } from '../../infrastructure/openai/openai.types';

@Injectable()
export class EvaluationService {
  constructor(
    @InjectRepository(Evaluation)
    private readonly evaluationRepository: Repository<Evaluation>,
    @InjectRepository(EvaluationItem)
    private readonly evaluationItemRepository: Repository<EvaluationItem>,
    @InjectRepository(InterviewSession)
    private readonly sessionRepository: Repository<InterviewSession>,
    @InjectRepository(InterviewAnswer)
    private readonly answerRepository: Repository<InterviewAnswer>,
    private readonly reportService: ReportService,
    private readonly openaiService: OpenAIService,
  ) {}

  async create(
    userId: number,
    dto: CreateEvaluationDto,
  ): Promise<EvaluationResponseDto> {
    const session = await this.sessionRepository.findOne({
      where: { id: dto.sessionId },
    });

    if (!session) {
      throw new NotFoundException('면접 세션을 찾을 수 없습니다.');
    }

    if (session.userId !== userId) {
      throw new ForbiddenException('본인의 면접 세션만 접근할 수 있습니다.');
    }

    if (session.status !== 'completed') {
      throw new ConflictException('완료되지 않은 면접 세션입니다.');
    }

    const existingEvaluation = await this.evaluationRepository.findOne({
      where: { sessionId: dto.sessionId },
    });

    if (existingEvaluation) {
      throw new ConflictException('이미 평가가 존재합니다.');
    }

    const answers = await this.answerRepository.find({
      where: { sessionId: dto.sessionId },
      relations: ['question'],
      order: { questionId: 'ASC' },
    });

    const evaluationResults = this.openaiService.isMockMode()
      ? answers.map(() => this.getMockEvaluationResult())
      : await this.openaiService.withMockFallback(
          'evaluation.evaluateAnswers',
          () => this.openaiService.evaluateAnswers(session, answers),
          () => answers.map(() => this.getMockEvaluationResult()),
        );

    const overallScore = Math.round(
      evaluationResults.reduce((sum, result) => sum + result.totalScore, 0) /
        evaluationResults.length,
    );

    const evaluation = this.evaluationRepository.create({
      sessionId: dto.sessionId,
      overallScore,
    });

    const savedEvaluation = await this.evaluationRepository.save(evaluation);

    const items = answers.map((answer, index) => {
      const result = this.withIdealAnswerFallback(evaluationResults[index], answer);

      return this.evaluationItemRepository.create({
        evaluationId: savedEvaluation.id,
        questionId: answer.questionId,
        answerId: answer.id,
        scores: result.scores,
        totalScore: result.totalScore,
        feedback: result.feedback,
        strengths: result.strengths,
        improvements: result.improvements,
        idealAnswer: result.idealAnswer,
      });
    });

    const savedItems = await this.evaluationItemRepository.save(items);

    await this.reportService.generateReport(dto.sessionId);

    return this.toResponse(savedEvaluation, savedItems, answers);
  }

  async findBySessionId(
    userId: number,
    sessionId: number,
  ): Promise<EvaluationResponseDto> {
    const session = await this.sessionRepository.findOne({
      where: { id: sessionId },
    });

    if (!session) {
      throw new NotFoundException('면접 세션을 찾을 수 없습니다.');
    }

    if (session.userId !== userId) {
      throw new ForbiddenException('본인의 면접 세션만 접근할 수 있습니다.');
    }

    const evaluation = await this.evaluationRepository.findOne({
      where: { sessionId },
      relations: ['items', 'items.question', 'items.answer'],
    });

    if (!evaluation) {
      throw new NotFoundException('평가 결과를 찾을 수 없습니다.');
    }

    const itemResponses: EvaluationItemResponseDto[] = evaluation.items
      .sort((a, b) => a.questionId - b.questionId)
      .map((item) => ({
        questionId: item.questionId,
        question: item.question.content,
        answer: item.answer.content,
        scores: item.scores,
        totalScore: item.totalScore,
        feedback: item.feedback,
        strengths: item.strengths,
        improvements: item.improvements,
        idealAnswer: item.idealAnswer || this.buildIdealAnswerFallback(item.question.content),
      }));

    return {
      id: evaluation.id,
      sessionId: evaluation.sessionId,
      overallScore: evaluation.overallScore,
      evaluations: itemResponses,
      createdAt: evaluation.createdAt,
    };
  }

  private toResponse(
    evaluation: Evaluation,
    items: EvaluationItem[],
    answers: InterviewAnswer[],
  ): EvaluationResponseDto {
    const itemResponses: EvaluationItemResponseDto[] = items.map((item) => {
      const answer = answers.find((a) => a.questionId === item.questionId);

      return {
        questionId: item.questionId,
        question: answer!.question.content,
        answer: answer!.content,
        scores: item.scores,
        totalScore: item.totalScore,
        feedback: item.feedback,
        strengths: item.strengths,
        improvements: item.improvements,
        idealAnswer: item.idealAnswer || this.buildIdealAnswerFallback(answer!.question.content),
      };
    });

    return {
      id: evaluation.id,
      sessionId: evaluation.sessionId,
      overallScore: evaluation.overallScore,
      evaluations: itemResponses,
      createdAt: evaluation.createdAt,
    };
  }

  private getMockEvaluationResult(): AnswerEvaluationResult {
    const accuracy = 70 + Math.floor(Math.random() * 20);
    const depth = 65 + Math.floor(Math.random() * 25);
    const structure = 70 + Math.floor(Math.random() * 20);
    const communication = 75 + Math.floor(Math.random() * 15);
    const totalScore = Math.round((accuracy + depth + structure + communication) / 4);

    return {
      scores: { accuracy, depth, structure, communication },
      totalScore,
      idealAnswer:
        'SNS 간편 로그인 인증 시스템을 개발할 때 백엔드에서는 Passport Strategy로 각 SNS 제공자의 인증 흐름을 분리하고, Redis는 인증 과정에서 필요한 임시 상태값과 토큰 정보를 빠르게 저장하고 검증하는 용도로 사용했습니다. 특히 로컬 환경과 배포된 WAS 환경에서 콜백 경로와 파라미터 전달 방식이 달라지는 문제가 있었고, 원격 WAS와 기간계를 거쳐 다시 로컬 WAS로 돌아오는 과정에서 redirect URI와 state 값이 일관되게 유지되도록 처리하는 것이 어려웠습니다. 이를 해결하기 위해 환경별 callback URL과 파라미터 가공 로직을 분리하고, Redis에 저장한 상태값을 기준으로 요청의 출처와 흐름을 검증하도록 구성했습니다. 이 경험을 통해 외부 인증 연동에서는 단순히 로그인 성공 여부뿐 아니라 환경별 라우팅, 보안 상태값 관리, 장애 추적이 가능한 구조가 중요하다는 점을 배웠습니다.',
      feedback: '핵심 개념을 이해하고 있으며, 실무 경험을 바탕으로 조금 더 구체적인 예시를 보강하면 좋습니다.',
      strengths: ['핵심 개념 이해', '논리적인 답변 구조'],
      improvements: ['실무 사례 보강 필요', '성능 관점 분석 추가'],
    };
  }

  private withIdealAnswerFallback(
    result: AnswerEvaluationResult,
    answer: InterviewAnswer,
  ): AnswerEvaluationResult {
    const idealAnswer = result.idealAnswer?.trim();

    if (idealAnswer) {
      return result;
    }

    return {
      ...result,
      idealAnswer: this.buildIdealAnswerFallback(answer.question.content),
    };
  }

  private buildIdealAnswerFallback(question: string): string {
    const normalizedQuestion = question.toLowerCase();

    if (normalizedQuestion.includes('next') || question.includes('SSR')) {
      return [
        'Next.js의 SSR은 요청 시점에 서버에서 React 페이지를 렌더링해 HTML을 먼저 내려주는 방식입니다.',
        '초기 화면에 필요한 데이터와 마크업이 서버에서 준비되기 때문에 검색 엔진 노출, 초기 콘텐츠 표시, 공유 미리보기 같은 요구가 있는 페이지에 특히 유리합니다.',
        '다만 모든 페이지를 SSR로 처리하면 서버 부하와 응답 시간이 늘 수 있으므로, 사용자별 실시간 데이터가 필요한 영역은 SSR을 쓰고 정적 콘텐츠나 자주 바뀌지 않는 페이지는 SSG나 캐싱 전략을 함께 검토합니다.',
        '실무에서는 API 호출 위치, 인증 쿠키 전달, 캐시 정책, 로딩/에러 처리, 서버와 클라이언트 상태 불일치 문제를 함께 확인하며 적용하는 것이 중요합니다.',
      ].join(' ');
    }

    return [
      `이 질문은 "${question}"에 대해 핵심 개념, 적용 상황, 장단점, 실제 구현 관점을 함께 설명하는 답변이 좋습니다.`,
      '먼저 해당 기술이나 개념이 어떤 문제를 해결하는지 정의하고, 프로젝트에서 어떤 상황에 적용할 수 있는지 예를 들어 설명합니다.',
      '그다음 선택 이유와 대안 대비 장단점을 말하고, 성능, 유지보수성, 사용자 경험, 장애 대응처럼 실무에서 확인해야 할 기준을 함께 언급하면 답변의 깊이가 살아납니다.',
      '마지막으로 직접 경험한 사례가 있다면 문제 상황, 내가 맡은 역할, 해결 과정, 결과와 배운 점 순서로 정리하면 면접관이 개발 역량을 판단하기 쉽습니다.',
    ].join(' ');
  }
}
