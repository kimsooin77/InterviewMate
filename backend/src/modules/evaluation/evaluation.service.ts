import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import OpenAI from 'openai';
import { Evaluation } from './entities/evaluation.entity';
import { EvaluationItem } from './entities/evaluation-item.entity';
import { InterviewSession } from '../interview/entities/interview-session.entity';
import { InterviewAnswer } from '../interview/entities/interview-answer.entity';
import { CreateEvaluationDto } from './dto/create-evaluation.dto';
import { EvaluationResponseDto } from './dto/evaluation-response.dto';
import { EvaluationItemResponseDto } from './dto/evaluation-item-response.dto';
import { ReportService } from '../report/report.service';
import { getOpenAIConfig } from '../../config/openai.config';

@Injectable()
export class EvaluationService {
  private readonly openai: OpenAI;
  private readonly openaiModel: string;
  private readonly openaiTemperature: number;

  constructor(
    @InjectRepository(Evaluation)
    private readonly evaluationRepository: Repository<Evaluation>,
    @InjectRepository(EvaluationItem)
    private readonly evaluationItemRepository: Repository<EvaluationItem>,
    @InjectRepository(InterviewSession)
    private readonly sessionRepository: Repository<InterviewSession>,
    @InjectRepository(InterviewAnswer)
    private readonly answerRepository: Repository<InterviewAnswer>,
    private readonly configService: ConfigService,
    private readonly reportService: ReportService,
  ) {
    const openaiConfig = getOpenAIConfig(configService);
    this.openai = new OpenAI({ apiKey: openaiConfig.apiKey });
    this.openaiModel = openaiConfig.model;
    this.openaiTemperature = openaiConfig.temperature;
  }

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

    const evaluationResults = await Promise.all(
      answers.map((answer) =>
        this.callOpenAIEvaluation(answer.question.content, answer.content),
      ),
    );

    const overallScore = Math.round(
      evaluationResults.reduce((sum, r) => sum + r.totalScore, 0) /
        evaluationResults.length,
    );

    const evaluation = this.evaluationRepository.create({
      sessionId: dto.sessionId,
      overallScore,
    });

    const savedEvaluation = await this.evaluationRepository.save(evaluation);

    const items = answers.map((answer, index) =>
      this.evaluationItemRepository.create({
        evaluationId: savedEvaluation.id,
        questionId: answer.questionId,
        answerId: answer.id,
        scores: evaluationResults[index].scores,
        totalScore: evaluationResults[index].totalScore,
        feedback: evaluationResults[index].feedback,
        strengths: evaluationResults[index].strengths,
        improvements: evaluationResults[index].improvements,
      }),
    );

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
      relations: ['items', 'items.question'],
    });

    if (!evaluation) {
      throw new NotFoundException('평가 결과를 찾을 수 없습니다.');
    }

    const itemResponses: EvaluationItemResponseDto[] = evaluation.items
      .sort((a, b) => a.questionId - b.questionId)
      .map((item) => ({
        questionId: item.questionId,
        question: item.question.content,
        scores: item.scores,
        totalScore: item.totalScore,
        feedback: item.feedback,
        strengths: item.strengths,
        improvements: item.improvements,
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
        scores: item.scores,
        totalScore: item.totalScore,
        feedback: item.feedback,
        strengths: item.strengths,
        improvements: item.improvements,
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

  private async callOpenAIEvaluation(
    question: string,
    answer: string,
  ): Promise<{
    scores: { accuracy: number; depth: number; structure: number; communication: number };
    totalScore: number;
    feedback: string;
    strengths: string[];
    improvements: string[];
  }> {
    const systemPrompt = `You are a senior frontend technical interviewer evaluating a candidate's answer.
Your task is to evaluate the answer across multiple criteria and provide constructive feedback.

Evaluation criteria (each scored 0-100):
1. accuracy: Technical correctness of the answer
2. depth: Level of detail and specificity
3. structure: Logical organization and flow of the answer
4. communication: Clarity and effectiveness of explanation

Rules:
- Be objective and fair in scoring.
- Provide specific, actionable feedback.
- Identify concrete strengths and areas for improvement.
- Reference specific parts of the answer in your feedback.
- All feedback should be in Korean.
- Return the result in the specified JSON format.`;

    const userPrompt = `질문: ${question}

답변: ${answer}

위 답변을 평가해주세요.`;

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
