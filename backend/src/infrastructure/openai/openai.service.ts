import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { getOpenAIConfig } from '../../config/openai.config';
import {
  AiMode,
  AnswerEvaluationResult,
  AnswerFeedbackResult,
  GeneratedFollowUpQuestion,
  GeneratedQuestion,
  GenerateQuestionsConfig,
  ReportGenerationInput,
  ReportGenerationResult,
  ResumeAnalysisResult,
} from './openai.types';

@Injectable()
export class OpenAIService {
  private readonly logger = new Logger(OpenAIService.name);
  private readonly client: OpenAI;
  private readonly model: string;
  private readonly temperature: number;
  private readonly maxTokens: number;
  private readonly mode: AiMode;
  private readonly allowMockFallback: boolean;

  constructor(private readonly configService: ConfigService) {
    const openaiConfig = getOpenAIConfig(configService);
    this.client = new OpenAI({ apiKey: openaiConfig.apiKey });
    this.model = openaiConfig.model;
    this.temperature = openaiConfig.temperature;
    this.maxTokens = openaiConfig.maxTokens;
    this.mode = this.resolveAiMode();
    this.allowMockFallback =
      configService.get<string>('NODE_ENV', 'development') === 'development';
  }

  isMockMode(): boolean {
    return this.mode === 'mock';
  }

  isOpenAIMode(): boolean {
    return this.mode === 'openai';
  }

  canFallbackToMock(): boolean {
    return this.allowMockFallback;
  }

  async withMockFallback<T>(
    operationName: string,
    operation: () => Promise<T>,
    fallback: () => T,
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      this.logger.error(
        `${operationName} failed`,
        error instanceof Error ? error.stack : String(error),
      );

      if (this.allowMockFallback) {
        this.logger.warn(
          `${operationName} failed. Returning mock fallback in development.`,
        );
        return fallback();
      }

      throw error;
    }
  }

  async analyzeResume(rawText: string): Promise<ResumeAnalysisResult> {
    return this.createJsonCompletion<ResumeAnalysisResult>(
      'analyzeResume',
      [
        'You extract structured data from a software engineer resume.',
        'Return JSON only. Do not return markdown, explanations, or code fences.',
        'Use only facts explicitly present in the resume.',
        'Use empty arrays or empty strings for missing values.',
        'Write all text fields in Korean.',
        'For careers, use company, position, startDate, endDate, and description.',
        'Treat employers, workplaces, and company names as careers, not projects.',
        'If company names such as "아이투엘" or "커넥트아이" appear as work history, include them in careers even when project details are nearby.',
        'For projects, use name, role, startDate, endDate, description, skills, and responsibilities.',
        'Only include projects when the resume explicitly names a project, service, product, or assignment separate from an employer.',
        'Do not use period, duration, environment, or techStack as replacement keys.',
        'If a period is written like "2024.04 ~ 재직중", set startDate to "2024.04" and endDate to "재직중".',
        'Return exactly this shape: {"skills":[],"careers":[{"company":"","position":"","startDate":"","endDate":"","description":""}],"projects":[{"name":"","role":"","startDate":"","endDate":"","description":"","skills":[],"responsibilities":[]}]}',
      ].join('\n'),
      JSON.stringify({ resumeText: rawText }),
    );
  }

  async generateQuestions(
    resumeAnalysis: ResumeAnalysisResult,
    config: GenerateQuestionsConfig,
  ): Promise<GeneratedQuestion[]> {
    const questionCount = config.count || 3;
    const input = {
      difficulty: config.difficulty,
      questionCount,
      resumeAnalysis,
      jobPosting: config.jobPosting || '',
    };

    const result = await this.createJsonCompletion<{ questions: GeneratedQuestion[] }>(
      'generateQuestions',
      [
        'You generate software engineer interview questions.',
        'Return JSON only. Do not return markdown, explanations, or code fences.',
        `Generate exactly ${questionCount} questions.`,
        'Write questions in Korean.',
        'Prefer practical questions directly related to the provided skills, careers, and projects.',
        'If a job posting is provided, tailor the questions to the posting requirements, responsibilities, seniority, domain, and tech stack.',
        'Cover both resume-based evidence and job-posting fit. Ask questions that help verify whether the candidate can perform the posted role.',
        'Focus on software developer responsibilities: implementation, architecture, debugging, performance, testing, APIs, data flow, deployment, and collaboration as an engineer.',
        'Do not assume the candidate has implemented a domain feature only because the job posting mentions it.',
        'If a domain or product feature appears only in the job posting and not in the resume, ask readiness or approach questions, not past-experience questions.',
        'Avoid phrases that claim unverified experience, such as "the payment widget you implemented" or "in your project". Prefer "if you were to implement" or "how would you approach".',
        'Do not ask about designer-only work, UI design creation, visual design decisions, or using design tools such as Figma unless the resume explicitly says the candidate used that tool as a developer.',
        'If the posting mentions design collaboration, ask how the developer translated requirements into components or code without assuming design-tool experience.',
        'Return exactly this shape: {"questions":[{"content":"","category":"","difficulty":"","order":1}]}.',
      ].join('\n'),
      JSON.stringify(input),
    );

    return result.questions || [];
  }

  async evaluateAnswer(input: {
    question: string;
    answer: string;
    category?: string;
    difficulty?: string;
  }): Promise<AnswerEvaluationResult> {
    return this.createJsonCompletion<AnswerEvaluationResult>(
      'evaluateAnswer',
      [
        'You evaluate one interview answer.',
        'Return JSON only. Do not return markdown, explanations, or code fences.',
        'Score accuracy, depth, structure, and communication from 0 to 100.',
        'Set totalScore to the average of the four scores, rounded to an integer.',
        'Write feedback, strengths, and improvements in Korean.',
        'Write idealAnswer in Korean as a natural 40-90 second sample answer the candidate could say in an interview.',
        'For technical questions, structure the result so feedback evaluates the user answer, while idealAnswer is the canonical interview answer direction.',
        'The idealAnswer must mention the role of the relevant tech stack, the challenge, how to handle or solve it, and what was learned.',
        'Base idealAnswer on the question and the user answer; do not invent unrelated facts.',
        'If the answer says the user does not know, give a low score, explain the missing concept, and still write a complete idealAnswer that teaches the canonical answer to the original question.',
        'Never leave idealAnswer empty.',
        'Return exactly this shape: {"scores":{"accuracy":0,"depth":0,"structure":0,"communication":0},"totalScore":0,"feedback":"","strengths":[],"improvements":[],"idealAnswer":""}.',
      ].join('\n'),
      JSON.stringify(input),
    );
  }

  async evaluateAnswers(
    _session: unknown,
    answers: {
      question: { content: string; category?: string; difficulty?: string };
      content: string;
    }[],
  ): Promise<AnswerEvaluationResult[]> {
    return Promise.all(
      answers.map((answer) =>
        this.evaluateAnswer({
          question: answer.question.content,
          answer: answer.content,
          category: answer.question.category,
          difficulty: answer.question.difficulty,
        }),
      ),
    );
  }

  async generateAnswerFeedback(
    question: string,
    answer: string,
  ): Promise<AnswerFeedbackResult> {
    return this.createJsonCompletion<AnswerFeedbackResult>(
      'generateAnswerFeedback',
      [
        'You provide immediate feedback for one interview answer.',
        'Return JSON only. Do not return markdown, explanations, or code fences.',
        'Set isCorrect to true if the answer is directionally correct, otherwise false.',
        'Write explanation in Korean and keep it concise.',
        'If the answer says the user does not know, set isCorrect to false.',
        'Return exactly this shape: {"isCorrect":false,"explanation":""}.',
      ].join('\n'),
      JSON.stringify({ question, answer }),
    );
  }

  async generateFollowUpQuestion(input: {
    question: string;
    answer: string;
    category?: string;
    difficulty?: string;
  }): Promise<GeneratedFollowUpQuestion> {
    return this.createJsonCompletion<GeneratedFollowUpQuestion>(
      'generateFollowUpQuestion',
      [
        'You generate one follow-up interview question for a software developer interview.',
        'Return JSON only. Do not return markdown, explanations, or code fences.',
        'Write the question in Korean.',
        'The follow-up must be based on the original question and the user answer.',
        'Ask about implementation details, trade-offs, debugging, performance, testing, architecture, or real project decisions.',
        'Do not ask designer-only questions or visual design tool questions unless the original question and answer clearly mention developer usage of that tool.',
        'If the user answer says they do not know, ask a simpler concept-checking follow-up.',
        'Return exactly this shape: {"content":"","category":"","difficulty":""}.',
      ].join('\n'),
      JSON.stringify(input),
    );
  }

  async generateReport(
    evaluation: ReportGenerationInput,
  ): Promise<ReportGenerationResult> {
    return this.createJsonCompletion<ReportGenerationResult>(
      'generateReport',
      [
        'You summarize interview evaluation results.',
        'Return JSON only. Do not return markdown, explanations, or code fences.',
        'Use only the provided evaluation summary data.',
        'Write summary, strengths, and improvements in Korean and keep them concise.',
        'Return exactly this shape: {"overallScore":0,"grade":"","summary":"","categoryScores":[],"strengths":[],"improvements":[]}.',
      ].join('\n'),
      JSON.stringify(evaluation),
    );
  }

  private resolveAiMode(): AiMode {
    const aiMode = this.configService.get<string>('AI_MODE');
    if (aiMode === 'mock' || aiMode === 'openai') {
      return aiMode;
    }

    return this.configService.get<string>('USE_MOCK_AI', 'false') === 'true'
      ? 'mock'
      : 'openai';
  }

  private async createJsonCompletion<T>(
    operationName: string,
    systemPrompt: string,
    userPrompt: string,
  ): Promise<T> {
    try {
      const response = await this.client.chat.completions.create({
        model: this.model,
        temperature: this.temperature,
        max_tokens: this.maxTokens,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        response_format: { type: 'json_object' },
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('OpenAI response was empty.');
      }

      try {
        return JSON.parse(content) as T;
      } catch (error) {
        this.logger.error(`OpenAI ${operationName} returned invalid JSON: ${content}`);
        throw error;
      }
    } catch (error) {
      this.logger.error(
        `OpenAI ${operationName} request failed`,
        error instanceof Error ? error.stack : String(error),
      );
      throw error;
    }
  }
}
