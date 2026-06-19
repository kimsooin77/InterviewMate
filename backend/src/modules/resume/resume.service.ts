import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { join } from 'path';
import { mkdirSync, writeFileSync, readFileSync } from 'fs';
import OpenAI from 'openai';
import pdfParse from 'pdf-parse';
import { Resume } from './entities/resume.entity';
import { UploadResumeDto } from './dto/upload-resume.dto';
import {
  ResumeResponseDto,
  UploadResponseDto,
  AnalyzeResponseDto,
} from './dto/resume-response.dto';
import { getOpenAIConfig } from '../../config/openai.config';
import { getUploadConfig } from '../../config/upload.config';

@Injectable()
export class ResumeService {
  private readonly openai: OpenAI;
  private readonly openaiModel: string;
  private readonly openaiTemperature: number;
  private readonly uploadPath: string;
  private readonly useMockAI: boolean;

  constructor(
    @InjectRepository(Resume)
    private readonly resumeRepository: Repository<Resume>,
    private readonly configService: ConfigService,
  ) {
    const openaiConfig = getOpenAIConfig(configService);
    this.openai = new OpenAI({ apiKey: openaiConfig.apiKey });
    this.openaiModel = openaiConfig.model;
    this.openaiTemperature = openaiConfig.temperature;
    this.useMockAI = configService.get<string>('USE_MOCK_AI', 'false') === 'true';

    const uploadConfig = getUploadConfig(configService);
    this.uploadPath = uploadConfig.resumePath;
    mkdirSync(this.uploadPath, { recursive: true });
  }

  async upload(
    userId: number,
    file: Express.Multer.File,
    dto: UploadResumeDto,
  ): Promise<UploadResponseDto> {
    const fileName = `${Date.now()}-${file.originalname}`;
    const filePath = join(this.uploadPath, fileName);

    writeFileSync(filePath, file.buffer);

    const resume = this.resumeRepository.create({
      userId,
      title: dto.title || file.originalname.replace('.pdf', ''),
      fileName: file.originalname,
      filePath,
      fileSize: file.size,
      analysisStatus: 'pending',
    });

    const saved = await this.resumeRepository.save(resume);

    return {
      id: saved.id,
      title: saved.title,
      fileName: saved.fileName,
      fileSize: saved.fileSize,
      mimeType: 'application/pdf',
      status: saved.analysisStatus,
      createdAt: saved.createdAt,
    };
  }

  async analyze(userId: number, resumeId: number): Promise<AnalyzeResponseDto> {
    const resume = await this.findOneOrFail(resumeId, userId);

    if (resume.analysisStatus === 'completed') {
      throw new ConflictException('이미 분석 완료된 이력서입니다.');
    }

    resume.analysisStatus = 'analyzing';
    await this.resumeRepository.save(resume);

    try {
      let rawText: string;

      if (this.useMockAI) {
        rawText = 'Mock resume text for testing';
      } else {
        const pdfData = await pdfParse(
          readFileSync(resume.filePath),
        );
        rawText = pdfData.text;

        if (!rawText || rawText.trim().length === 0) {
          throw new UnprocessableEntityException('PDF에서 텍스트를 추출할 수 없습니다.');
        }
      }

      resume.rawText = rawText;

      const analysisResult = this.useMockAI
        ? this.getMockAnalysisResult()
        : await this.callOpenAIAnalysis(rawText);

      resume.skills = analysisResult.skills || [];
      resume.careers = analysisResult.careers || [];
      resume.projects = analysisResult.projects || [];
      resume.analysisStatus = 'completed';
      resume.analysisCompletedAt = new Date();

      await this.resumeRepository.save(resume);

      return {
        id: resume.id,
        title: resume.title,
        status: resume.analysisStatus,
        skills: resume.skills,
        careers: resume.careers,
        projects: resume.projects,
        analyzedAt: resume.analysisCompletedAt!,
      };
    } catch (error) {
      resume.analysisStatus = 'failed';
      await this.resumeRepository.save(resume);

      if (
        error instanceof UnprocessableEntityException ||
        error instanceof ConflictException
      ) {
        throw error;
      }

      throw new UnprocessableEntityException('이력서 분석에 실패했습니다.');
    }
  }

  async findById(userId: number, resumeId: number): Promise<ResumeResponseDto> {
    const resume = await this.findOneOrFail(resumeId, userId);

    return {
      id: resume.id,
      title: resume.title,
      fileName: resume.fileName,
      fileSize: resume.fileSize,
      status: resume.analysisStatus,
      skills: resume.skills,
      careers: resume.careers,
      projects: resume.projects,
      analyzedAt: resume.analysisCompletedAt,
      createdAt: resume.createdAt,
      updatedAt: resume.updatedAt,
    };
  }

  private async findOneOrFail(resumeId: number, userId: number): Promise<Resume> {
    const resume = await this.resumeRepository.findOne({
      where: { id: resumeId },
    });

    if (!resume) {
      throw new NotFoundException('이력서를 찾을 수 없습니다.');
    }

    if (resume.userId !== userId) {
      throw new ForbiddenException('본인의 이력서만 접근할 수 있습니다.');
    }

    return resume;
  }

  private getMockAnalysisResult(): { skills: string[]; careers: Record<string, unknown>[]; projects: Record<string, unknown>[] } {
    return {
      skills: ['Vue3', 'TypeScript', 'React', 'JavaScript', 'HTML/CSS', 'Pinia', 'Vite'],
      careers: [
        {
          company: 'ABC Corp',
          position: 'Frontend Developer',
          startDate: '2023-01',
          endDate: '2025-12',
          description: 'Vue3 기반 SPA 개발 및 유지보수',
        },
        {
          company: 'XYZ Inc',
          position: 'Junior Developer',
          startDate: '2021-03',
          endDate: '2022-12',
          description: 'React 기반 관리자 대시보드 개발',
        },
      ],
      projects: [
        {
          name: 'E-Commerce Platform',
          role: 'Frontend Lead',
          startDate: '2024-03',
          endDate: '2025-06',
          description: 'Vue3 + TypeScript 기반 이커머스 플랫폼 개발',
          skills: ['Vue3', 'TypeScript', 'Pinia'],
        },
        {
          name: 'Admin Dashboard',
          role: 'Frontend Developer',
          startDate: '2021-06',
          endDate: '2022-10',
          description: 'React + Redux 기반 관리자 대시보드 개발',
          skills: ['React', 'Redux', 'TypeScript'],
        },
      ],
    };
  }

  private async callOpenAIAnalysis(
    resumeText: string,
  ): Promise<{ skills: string[]; careers: Record<string, unknown>[]; projects: Record<string, unknown>[] }> {
    const systemPrompt = `You are a resume analysis expert specializing in software engineering resumes.
Your task is to extract structured information from the provided resume text.

Extract the following:
1. Technical skills (programming languages, frameworks, libraries, tools)
2. Career history (company, position, period, description)
3. Project experience (name, role, period, description, skills used)

Rules:
- Only extract information explicitly stated in the resume.
- Do not infer or guess skills not mentioned.
- Normalize skill names (e.g., "vue.js" → "Vue3", "TS" → "TypeScript").
- Return dates in "YYYY-MM" format.
- Respond in Korean for descriptions.
- Return the result in the specified JSON format.`;

    const userPrompt = `다음 이력서 내용을 분석하여 정보를 추출해주세요.

---
${resumeText}
---`;

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
