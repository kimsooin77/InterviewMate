import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Report } from './entities/report.entity';
import { InterviewSession } from '../interview/entities/interview-session.entity';
import { Evaluation } from '../evaluation/entities/evaluation.entity';
import { EvaluationItem } from '../evaluation/entities/evaluation-item.entity';
import { ReportResponseDto, QuestionResultDto } from './dto/report-response.dto';
import { OpenAIService } from '../../infrastructure/openai/openai.service';
import {
  ReportGenerationInput,
  ReportGenerationResult,
} from '../../infrastructure/openai/openai.types';

@Injectable()
export class ReportService {
  constructor(
    @InjectRepository(Report)
    private readonly reportRepository: Repository<Report>,
    @InjectRepository(InterviewSession)
    private readonly sessionRepository: Repository<InterviewSession>,
    @InjectRepository(Evaluation)
    private readonly evaluationRepository: Repository<Evaluation>,
    @InjectRepository(EvaluationItem)
    private readonly evaluationItemRepository: Repository<EvaluationItem>,
    private readonly openaiService: OpenAIService,
  ) {}

  async generateReport(sessionId: number): Promise<Report> {
    const session = await this.sessionRepository.findOne({
      where: { id: sessionId },
    });

    if (!session) {
      throw new NotFoundException('면접 세션을 찾을 수 없습니다.');
    }

    const evaluation = await this.evaluationRepository.findOne({
      where: { sessionId },
      relations: ['items', 'items.question'],
    });

    if (!evaluation) {
      throw new NotFoundException('평가 결과를 찾을 수 없습니다.');
    }

    const duration = session.completedAt
      ? Math.round(
          (session.completedAt.getTime() - session.startedAt.getTime()) / 1000,
        )
      : 0;

    const reportInput: ReportGenerationInput = {
      difficulty: session.difficulty,
      totalQuestions: session.totalQuestions,
      durationSeconds: duration,
      overallScore: evaluation.overallScore,
      evaluations: evaluation.items
        .sort((a, b) => a.questionId - b.questionId)
        .map((item) => ({
          questionId: item.questionId,
          category: item.question?.category || 'general',
          totalScore: item.totalScore,
          strengths: item.strengths,
          improvements: item.improvements,
        })),
    };

    const aiResult = this.openaiService.isMockMode()
      ? this.getMockReportResult(evaluation.items, evaluation.overallScore)
      : await this.openaiService.withMockFallback(
          'report.generate',
          () => this.openaiService.generateReport(reportInput),
          () => this.getMockReportResult(evaluation.items, evaluation.overallScore),
        );

    const report = this.reportRepository.create({
      sessionId,
      overallScore: aiResult.overallScore,
      grade: aiResult.grade,
      summary: aiResult.summary,
      strengths: aiResult.strengths,
      improvements: aiResult.improvements,
      categoryScores: aiResult.categoryScores,
      metadata: {
        totalQuestions: session.totalQuestions,
        duration,
        difficulty: session.difficulty,
        completedAt: session.completedAt?.toISOString() || '',
      },
    });

    return this.reportRepository.save(report);
  }

  async findBySessionId(
    userId: number,
    sessionId: number,
  ): Promise<ReportResponseDto> {
    const session = await this.sessionRepository.findOne({
      where: { id: sessionId },
    });

    if (!session) {
      throw new NotFoundException('면접 세션을 찾을 수 없습니다.');
    }

    if (session.userId !== userId) {
      throw new ForbiddenException('본인의 리포트만 접근할 수 있습니다.');
    }

    const report = await this.reportRepository.findOne({
      where: { sessionId },
    });

    if (!report) {
      throw new NotFoundException('리포트를 찾을 수 없습니다.');
    }

    const evaluationItems = await this.evaluationItemRepository.find({
      where: { evaluation: { sessionId } },
      relations: ['question', 'evaluation'],
    });

    const questionResults: QuestionResultDto[] = evaluationItems
      .sort((a, b) => a.questionId - b.questionId)
      .map((item) => ({
        questionId: item.questionId,
        content: item.question.content,
        category: item.question.category,
        score: item.totalScore,
        grade: this.calculateGrade(item.totalScore),
      }));

    return {
      id: report.id,
      sessionId: report.sessionId,
      overallScore: report.overallScore,
      grade: report.grade,
      summary: report.summary,
      categoryScores: report.categoryScores,
      strengths: report.strengths,
      improvements: report.improvements,
      questionResults,
      metadata: report.metadata,
      createdAt: report.createdAt,
    };
  }

  private getMockReportResult(
    items: EvaluationItem[],
    overallScore: number,
  ): ReportGenerationResult {
    const categoryMap = new Map<string, { total: number; count: number }>();
    for (const item of items) {
      const category = item.question?.category || 'general';
      const existing = categoryMap.get(category) || { total: 0, count: 0 };
      existing.total += item.totalScore;
      existing.count += 1;
      categoryMap.set(category, existing);
    }

    const categoryScores = Array.from(categoryMap.entries()).map(([category, data]) => ({
      category,
      score: Math.round(data.total / data.count),
      questionCount: data.count,
    }));

    return {
      overallScore,
      grade: this.calculateGrade(overallScore),
      summary: '전반적으로 프론트엔드 핵심 개념에 대한 이해가 있으며, 실무 사례와 성능 관점 보강이 필요합니다.',
      categoryScores,
      strengths: [
        '핵심 개념 이해',
        '명확한 답변 구조',
        '기술 선택 이유 설명 가능',
      ],
      improvements: [
        '실무 사례 구체화',
        '성능 최적화 전략 학습',
        '아키텍처 관점 답변 보강',
      ],
    };
  }

  private calculateGrade(score: number): string {
    if (score >= 90) return 'A+';
    if (score >= 85) return 'A';
    if (score >= 80) return 'B+';
    if (score >= 75) return 'B';
    if (score >= 70) return 'C+';
    if (score >= 65) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  }
}
