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
import { QuestionSet } from './entities/question-set.entity';
import { Question } from './entities/question.entity';
import { GenerateQuestionsDto } from './dto/generate-questions.dto';
import { QuestionSetResponseDto } from './dto/question-set-response.dto';
import { QuestionResponseDto } from './dto/question-response.dto';
import { ResumeService } from '../resume/resume.service';
import { getOpenAIConfig } from '../../config/openai.config';

@Injectable()
export class QuestionService {
  private readonly openai: OpenAI;
  private readonly openaiModel: string;
  private readonly openaiTemperature: number;

  constructor(
    @InjectRepository(QuestionSet)
    private readonly questionSetRepository: Repository<QuestionSet>,
    @InjectRepository(Question)
    private readonly questionRepository: Repository<Question>,
    private readonly resumeService: ResumeService,
    private readonly configService: ConfigService,
  ) {
    const openaiConfig = getOpenAIConfig(configService);
    this.openai = new OpenAI({ apiKey: openaiConfig.apiKey });
    this.openaiModel = openaiConfig.model;
    this.openaiTemperature = openaiConfig.temperature;
  }

  async generate(
    userId: number,
    dto: GenerateQuestionsDto,
  ): Promise<QuestionSetResponseDto> {
    const resume = await this.resumeService.findById(userId, dto.resumeId);

    if (resume.status !== 'completed') {
      throw new ConflictException('이력서가 분석되지 않은 상태입니다.');
    }

    const difficulty = dto.difficulty || 'medium';
    const count = dto.count || 10;

    const generatedQuestions = await this.callOpenAIGeneration(
      resume.skills,
      resume.careers,
      resume.projects,
      difficulty,
      count,
    );

    const questionSet = this.questionSetRepository.create({
      resumeId: dto.resumeId,
      difficulty,
      questionCount: generatedQuestions.length,
    });

    const savedSet = await this.questionSetRepository.save(questionSet);

    const questions = generatedQuestions.map((q, index) =>
      this.questionRepository.create({
        questionSetId: savedSet.id,
        content: q.content,
        category: q.category,
        difficulty: q.difficulty || difficulty,
        order: q.order || index + 1,
        questionType: 'normal',
        parentQuestionId: null,
      }),
    );

    const savedQuestions = await this.questionRepository.save(questions);

    return this.toQuestionSetResponse(savedSet, savedQuestions);
  }

  async findById(
    userId: number,
    questionSetId: number,
  ): Promise<QuestionSetResponseDto> {
    const questionSet = await this.questionSetRepository.findOne({
      where: { id: questionSetId },
      relations: ['resume'],
    });

    if (!questionSet) {
      throw new NotFoundException('질문 세트를 찾을 수 없습니다.');
    }

    if (questionSet.resume.userId !== userId) {
      throw new ForbiddenException('본인의 질문 세트만 접근할 수 있습니다.');
    }

    const questions = await this.questionRepository.find({
      where: { questionSetId },
      order: { order: 'ASC' },
    });

    return this.toQuestionSetResponse(questionSet, questions);
  }

  private toQuestionSetResponse(
    set: QuestionSet,
    questions: Question[],
  ): QuestionSetResponseDto {
    return {
      id: set.id,
      resumeId: set.resumeId,
      difficulty: set.difficulty,
      questionCount: set.questionCount,
      questions: questions.map(this.toQuestionResponse),
      createdAt: set.createdAt,
    };
  }

  private toQuestionResponse(question: Question): QuestionResponseDto {
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

  private async callOpenAIGeneration(
    skills: string[],
    careers: Record<string, unknown>[],
    projects: Record<string, unknown>[],
    difficulty: string,
    count: number,
  ): Promise<{ content: string; category: string; difficulty: string; order: number }[]> {
    const systemPrompt = `You are a senior frontend technical interviewer.
Your task is to generate interview questions based on the candidate's resume.

Rules:
- Generate questions that are directly related to the candidate's skills and experience.
- Each question should test practical understanding, not just theoretical knowledge.
- Distribute questions across different skill areas from the resume.
- Assign a category to each question (framework, language, performance, architecture, css, testing, etc.).
- Adjust question depth based on the specified difficulty level.
- Questions should be in Korean.
- Return the result in the specified JSON format.

Difficulty levels:
- easy: Basic concept questions, definition-level
- medium: Application-level questions requiring practical experience
- hard: Deep dive questions requiring architectural thinking and trade-off analysis`;

    const careersText = careers
      .map((c) => `- ${c.company} / ${c.position} (${c.startDate}~${c.endDate}): ${c.description}`)
      .join('\n');

    const projectsText = projects
      .map((p) => `- ${p.name} / ${p.role} (${p.startDate}~${p.endDate}): ${p.description}`)
      .join('\n');

    const userPrompt = `다음 이력서 정보를 기반으로 ${difficulty} 난이도의 면접 질문을 ${count}개 생성해주세요.

기술 스택: ${skills.join(', ')}

경력:
${careersText || '없음'}

프로젝트:
${projectsText || '없음'}`;

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

    const parsed = JSON.parse(content);
    return parsed.questions || [];
  }
}
