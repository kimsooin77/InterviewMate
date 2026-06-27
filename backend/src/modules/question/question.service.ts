import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QuestionSet } from './entities/question-set.entity';
import { Question } from './entities/question.entity';
import { GenerateQuestionsDto } from './dto/generate-questions.dto';
import { QuestionSetResponseDto } from './dto/question-set-response.dto';
import { QuestionResponseDto } from './dto/question-response.dto';
import { ResumeService } from '../resume/resume.service';
import { OpenAIService } from '../../infrastructure/openai/openai.service';
import { GeneratedQuestion, ResumeAnalysisResult } from '../../infrastructure/openai/openai.types';

@Injectable()
export class QuestionService {
  constructor(
    @InjectRepository(QuestionSet)
    private readonly questionSetRepository: Repository<QuestionSet>,
    @InjectRepository(Question)
    private readonly questionRepository: Repository<Question>,
    private readonly resumeService: ResumeService,
    private readonly openaiService: OpenAIService,
  ) {}

  async generate(
    userId: number,
    dto: GenerateQuestionsDto,
  ): Promise<QuestionSetResponseDto> {
    const resume = await this.resumeService.findById(userId, dto.resumeId);

    if (resume.status !== 'completed') {
      throw new ConflictException('이력서가 아직 분석되지 않았습니다.');
    }

    const difficulty = dto.difficulty || 'medium';
    const requestedCount = dto.count || 10;
    const jobPosting = dto.jobPosting?.trim() || null;

    const resumeAnalysis: ResumeAnalysisResult = {
      skills: resume.skills,
      careers: resume.careers as unknown as ResumeAnalysisResult['careers'],
      projects: resume.projects as unknown as ResumeAnalysisResult['projects'],
    };

    const generatedQuestions = this.openaiService.isMockMode()
      ? this.getMockQuestions(difficulty, requestedCount, jobPosting)
      : await this.openaiService.withMockFallback(
          'question.generate',
          () =>
            this.openaiService.generateQuestions(resumeAnalysis, {
              difficulty,
              count: requestedCount,
              jobPosting: jobPosting || undefined,
            }),
          () => this.getMockQuestions(difficulty, requestedCount, jobPosting),
        );
    const developerFocusedQuestions = this.ensureDeveloperFocusedQuestions(
      generatedQuestions,
      resumeAnalysis,
      jobPosting,
      difficulty,
    );

    const questionSet = this.questionSetRepository.create({
      resumeId: dto.resumeId,
      difficulty,
      questionCount: developerFocusedQuestions.length,
      jobPosting,
    });

    const savedSet = await this.questionSetRepository.save(questionSet);

    const questions = developerFocusedQuestions.map((q, index) =>
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
      jobPosting: set.jobPosting || null,
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

  private getMockQuestions(
    difficulty: string,
    count: number,
    jobPosting?: string | null,
  ): GeneratedQuestion[] {
    const mockPool: GeneratedQuestion[] = [
      { content: 'Vue3의 Composition API와 Options API의 차이점을 설명해주세요.', category: 'framework', difficulty, order: 1 },
      { content: 'TypeScript에서 제네릭을 사용한 경험이 있다면 설명해주세요.', category: 'language', difficulty, order: 2 },
      { content: 'Pinia와 Vuex의 차이점과 Pinia를 선택한 이유를 설명해주세요.', category: 'framework', difficulty, order: 3 },
      { content: '웹 성능 최적화를 위해 적용한 방법이 있다면 설명해주세요.', category: 'performance', difficulty, order: 4 },
      { content: 'SPA에서 라우팅을 구현할 때 고려해야 할 사항은 무엇인가요?', category: 'architecture', difficulty, order: 5 },
      { content: 'CSS-in-JS와 전통적인 CSS 방식의 장단점을 비교해주세요.', category: 'css', difficulty, order: 6 },
      { content: 'React와 Vue의 렌더링 방식 차이를 설명해주세요.', category: 'framework', difficulty, order: 7 },
      { content: 'JavaScript의 이벤트 루프와 비동기 처리 방식을 설명해주세요.', category: 'language', difficulty, order: 8 },
      { content: '프론트엔드 테스트 전략에 대해 설명해주세요.', category: 'testing', difficulty, order: 9 },
      { content: '대규모 프론트엔드 프로젝트에서 상태 관리 전략을 설명해주세요.', category: 'architecture', difficulty, order: 10 },
    ];

    if (!jobPosting) {
      return mockPool.slice(0, count);
    }

    return mockPool.slice(0, count).map((question, index) => ({
      ...question,
      content:
        index === 0
          ? '채용공고의 핵심 요구사항과 본인 이력서 경험을 연결해, 해당 역할에서 바로 기여할 수 있는 부분을 설명해주세요.'
          : question.content,
    }));
  }

  private ensureDeveloperFocusedQuestions(
    questions: GeneratedQuestion[],
    resumeAnalysis: ResumeAnalysisResult,
    jobPosting: string | null,
    difficulty: string,
  ): GeneratedQuestion[] {
    const resumeText = JSON.stringify(resumeAnalysis).toLowerCase();
    const designToolExplicitlyProvided =
      resumeText.includes('figma') ||
      resumeText.includes('피그마') ||
      resumeText.includes('design tool') ||
      resumeText.includes('디자인 툴');

    return questions.map((question, index) => {
      if (designToolExplicitlyProvided || !this.isDesignToolQuestion(question.content)) {
        return question;
      }

      return {
        ...question,
        content:
          '채용공고의 요구사항을 기준으로, 본인 이력서의 개발 경험 중 해당 역할에서 바로 기여할 수 있는 구현 사례를 설명해주세요.',
        category: 'career_fit',
        difficulty: question.difficulty || difficulty,
        order: question.order || index + 1,
      };
    });
  }

  private isDesignToolQuestion(content: string): boolean {
    return /figma|피그마|디자인\s*툴|ui\s*디자인|디자이너|visual\s*design/i.test(content);
  }
}
