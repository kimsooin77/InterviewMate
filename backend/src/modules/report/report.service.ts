import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import OpenAI from 'openai';
import { Report } from './entities/report.entity';
import { InterviewSession } from '../interview/entities/interview-session.entity';
import { Evaluation } from '../evaluation/entities/evaluation.entity';
import { EvaluationItem } from '../evaluation/entities/evaluation-item.entity';
import { ReportResponseDto, QuestionResultDto } from './dto/report-response.dto';
import { getOpenAIConfig } from '../../config/openai.config';

@Injectable()
export class ReportService {
  private readonly openai: OpenAI;
  private readonly openaiModel: string;
  private readonly openaiTemperature: number;
  private readonly useMockAI: boolean;

  constructor(
    @InjectRepository(Report)
    private readonly reportRepository: Repository<Report>,
    @InjectRepository(InterviewSession)
    private readonly sessionRepository: Repository<InterviewSession>,
    @InjectRepository(Evaluation)
    private readonly evaluationRepository: Repository<Evaluation>,
    @InjectRepository(EvaluationItem)
    private readonly evaluationItemRepository: Repository<EvaluationItem>,
    private readonly configService: ConfigService,
  ) {
    const openaiConfig = getOpenAIConfig(configService);
    this.openai = new OpenAI({ apiKey: openaiConfig.apiKey });
    this.openaiModel = openaiConfig.model;
    this.openaiTemperature = openaiConfig.temperature;
    this.useMockAI = configService.get<string>('USE_MOCK_AI', 'false') === 'true';
  }

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

    const evaluationsText = evaluation.items
      .sort((a, b) => a.questionId - b.questionId)
      .map(
        (item) =>
          `질문: ${item.question.content}\n카테고리: ${item.question.category}\n점수: ${item.totalScore}\n피드백: ${item.feedback}`,
      )
      .join('\n\n---\n\n');

    const aiResult = this.useMockAI
      ? this.getMockReportResult(evaluation.items, evaluation.overallScore)
      : await this.callOpenAIReportGeneration(
          session.difficulty,
          session.totalQuestions,
          duration,
          evaluationsText,
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
  ): {
    overallScore: number;
    grade: string;
    summary: string;
    categoryScores: { category: string; score: number; questionCount: number }[];
    strengths: string[];
    improvements: string[];
  } {
    const categoryMap = new Map<string, { total: number; count: number }>();
    for (const item of items) {
      const cat = item.question?.category || 'general';
      const existing = categoryMap.get(cat) || { total: 0, count: 0 };
      existing.total += item.totalScore;
      existing.count += 1;
      categoryMap.set(cat, existing);
    }

    const categoryScores = Array.from(categoryMap.entries()).map(([category, data]) => ({
      category,
      score: Math.round(data.total / data.count),
      questionCount: data.count,
    }));

    return {
      overallScore,
      grade: this.calculateGrade(overallScore),
      summary: '전반적으로 프론트엔드 핵심 개념에 대한 이해도가 높습니다. 프레임워크 관련 질문에서 강점을 보였으며, 성능 최적화 영역에서 보완이 필요합니다.',
      categoryScores,
      strengths: [
        'Vue3 Composition API에 대한 깊은 이해',
        'TypeScript 타입 시스템 활용 능력',
        '명확하고 구조적인 답변 전달력',
      ],
      improvements: [
        '웹 성능 최적화 전략에 대한 학습 필요',
        '대규모 애플리케이션 아키텍처 설계 경험 보강',
        '브라우저 렌더링 파이프라인 심화 학습',
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

  private async callOpenAIReportGeneration(
    difficulty: string,
    totalQuestions: number,
    duration: number,
    evaluationsText: string,
  ): Promise<{
    overallScore: number;
    grade: string;
    summary: string;
    categoryScores: { category: string; score: number; questionCount: number }[];
    strengths: string[];
    improvements: string[];
  }> {
    const systemPrompt = `You are a senior frontend technical interviewer writing a comprehensive interview report.
Your task is to summarize the candidate's overall performance based on individual question evaluations.

Rules:
- Calculate category-level scores by averaging individual question scores per category.
- Determine an overall grade based on the overall score:
  - 90+: A+, 85+: A, 80+: B+, 75+: B, 70+: C+, 65+: C, 60+: D, below 60: F
- Write a concise summary highlighting key observations.
- Identify top 3 strengths and top 3 areas for improvement.
- The summary and feedback should be in Korean.
- Return the result in the specified JSON format.`;

    const userPrompt = `다음 면접 평가 결과를 종합하여 리포트를 생성해주세요.

면접 정보:
- 난이도: ${difficulty}
- 총 질문 수: ${totalQuestions}
- 소요 시간: ${duration}초

개별 평가 결과:
${evaluationsText}`;

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
}
