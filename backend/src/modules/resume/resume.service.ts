import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
  UnprocessableEntityException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { join } from 'path';
import { mkdirSync, writeFileSync, readFileSync } from 'fs';
import pdfParse from 'pdf-parse';
import { Resume } from './entities/resume.entity';
import { UploadResumeDto } from './dto/upload-resume.dto';
import {
  ResumeResponseDto,
  UploadResponseDto,
  AnalyzeResponseDto,
} from './dto/resume-response.dto';
import { getUploadConfig } from '../../config/upload.config';
import { OpenAIService } from '../../infrastructure/openai/openai.service';
import {
  ResumeAnalysisResult as OpenAIResumeAnalysisResult,
  ResumeCareer,
  ResumeProject,
} from '../../infrastructure/openai/openai.types';

type ResumeAnalysisResult = OpenAIResumeAnalysisResult;
type JsonRecord = Record<string, unknown>;

type ResumeAnalysisResponseData = {
  skills: string[];
  careers: ResumeCareer[];
  projects: ResumeProject[];
};

@Injectable()
export class ResumeService {
  private readonly logger = new Logger(ResumeService.name);
  private readonly uploadPath: string;

  constructor(
    @InjectRepository(Resume)
    private readonly resumeRepository: Repository<Resume>,
    private readonly configService: ConfigService,
    private readonly openaiService: OpenAIService,
  ) {
    const uploadConfig = getUploadConfig(configService);
    this.uploadPath = uploadConfig.resumePath;
    mkdirSync(this.uploadPath, { recursive: true });
  }

  async upload(
    userId: number,
    file: Express.Multer.File,
    dto: UploadResumeDto,
  ): Promise<UploadResponseDto> {
    const originalName = this.decodeOriginalName(file.originalname);
    const fileName = `${Date.now()}-${originalName}`;
    const filePath = join(this.uploadPath, fileName);

    writeFileSync(filePath, file.buffer);

    const resume = this.resumeRepository.create({
      userId,
      title: dto.title || originalName.replace(/\.pdf$/i, ''),
      fileName: originalName,
      filePath,
      fileSize: file.size,
      analysisStatus: 'pending',
    });

    const saved = await this.resumeRepository.save(resume);

    return {
      id: saved.id,
      title: resume.title,
      fileName: originalName,
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
      const rawText = this.openaiService.isMockMode()
        ? 'Mock resume text for testing'
        : await this.extractPdfText(resume.filePath);

      resume.rawText = rawText;

      const analysisResult = this.openaiService.isMockMode()
        ? this.getMockAnalysisResult()
        : await this.openaiService.withMockFallback(
            'resume.analyze',
            () => this.openaiService.analyzeResume(rawText),
            () => this.getMockAnalysisResult(),
          );

      const normalizedAnalysis = this.normalizeAnalysisResult(analysisResult);

      resume.skills = normalizedAnalysis.skills;
      resume.careers = normalizedAnalysis.careers;
      resume.projects = normalizedAnalysis.projects;
      resume.analysisStatus = 'completed';
      resume.analysisCompletedAt = new Date();

      await this.resumeRepository.save(resume);

      return {
        id: resume.id,
        title: this.decodeOriginalName(resume.title),
        status: resume.analysisStatus,
        skills: normalizedAnalysis.skills,
        careers: normalizedAnalysis.careers,
        projects: normalizedAnalysis.projects,
        analyzedAt: resume.analysisCompletedAt,
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

      this.logger.error('Resume analysis failed', error instanceof Error ? error.stack : String(error));
      throw new UnprocessableEntityException(this.getAnalysisErrorMessage(error));
    }
  }

  async findById(userId: number, resumeId: number): Promise<ResumeResponseDto> {
    const resume = await this.findOneOrFail(resumeId, userId);
    const normalizedAnalysis = this.normalizeAnalysisResult({
      skills: resume.skills,
      careers: resume.careers as ResumeCareer[],
      projects: resume.projects as ResumeProject[],
    });

    return {
      id: resume.id,
      title: this.decodeOriginalName(resume.title),
      fileName: this.decodeOriginalName(resume.fileName),
      fileSize: resume.fileSize,
      status: resume.analysisStatus,
      skills: normalizedAnalysis.skills,
      careers: normalizedAnalysis.careers,
      projects: normalizedAnalysis.projects,
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

  private async extractPdfText(filePath: string): Promise<string> {
    const pdfData = await pdfParse(readFileSync(filePath));
    const rawText = pdfData.text;

    if (!rawText || rawText.trim().length === 0) {
      throw new UnprocessableEntityException('PDF에서 텍스트를 추출할 수 없습니다. 텍스트 기반 PDF인지 확인해주세요.');
    }

    return rawText;
  }

  private decodeOriginalName(originalName: string): string {
    if (!this.looksLikeMojibake(originalName)) {
      return originalName;
    }

    return Buffer.from(originalName, 'latin1').toString('utf8');
  }

  private looksLikeMojibake(value: string): boolean {
    return /[ÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖ×ØÙÚÛÜÝÞßàáâãäåæçèéêëìíîïðñòóôõö÷øùúûüýþÿ]/.test(value);
  }

  private normalizeAnalysisResult(
    analysisResult: ResumeAnalysisResult,
  ): ResumeAnalysisResponseData {
    const careers = (analysisResult.careers || []).map((career) =>
      this.normalizeCareer(career as JsonRecord),
    );
    const projects = (analysisResult.projects || []).map((project) =>
      this.normalizeProject(project as JsonRecord),
    );

    const reclassified = this.reclassifyCompanyProjects(careers, projects);

    return {
      skills: this.asStringArray(analysisResult.skills),
      careers: reclassified.careers,
      projects: reclassified.projects,
    };
  }

  private reclassifyCompanyProjects(
    careers: ResumeCareer[],
    projects: ResumeProject[],
  ): { careers: ResumeCareer[]; projects: ResumeProject[] } {
    const normalizedCareerCompanies = new Set(
      careers.map((career) => this.normalizeCompanyName(career.company)),
    );
    const nextCareers = [...careers];
    const nextProjects: ResumeProject[] = [];

    for (const project of projects) {
      const projectName = project.name;
      const normalizedProjectName = this.normalizeCompanyName(projectName);

      if (
        normalizedProjectName &&
        this.looksLikeMisclassifiedCompanyProject(project)
      ) {
        if (normalizedCareerCompanies.has(normalizedProjectName)) {
          continue;
        }

        nextCareers.push(this.projectToCareer(project));
        normalizedCareerCompanies.add(normalizedProjectName);
        continue;
      }

      nextProjects.push(project);
    }

    return { careers: nextCareers, projects: nextProjects };
  }

  private looksLikeMisclassifiedCompanyProject(project: ResumeProject): boolean {
    const projectName = this.normalizeCompanyName(project.name);
    const hasProjectDetails =
      project.skills.length > 0 || (project.responsibilities?.length ?? 0) > 0;
    const knownCareerCompany =
      projectName === this.normalizeCompanyName('커넥트아이') ||
      projectName === this.normalizeCompanyName('커넥트 아이') ||
      projectName === this.normalizeCompanyName('아이투엘');

    if (knownCareerCompany) {
      return true;
    }

    return Boolean(projectName && project.role && !hasProjectDetails);
  }

  private projectToCareer(project: ResumeProject): ResumeCareer {
    return {
      ...project,
      company: project.name,
      position: project.role,
      startDate: project.startDate,
      endDate: project.endDate,
      description: project.description,
      duration: project.duration,
    };
  }

  private normalizeCareer(career: JsonRecord): ResumeCareer {
    const duration = this.asString(career.duration ?? career.period);
    const [periodStart, periodEnd] = this.splitPeriod(duration);

    return {
      ...career,
      company: this.asString(career.company),
      position: this.asString(career.position),
      startDate: this.asString(career.startDate) || periodStart,
      endDate: this.asString(career.endDate) || periodEnd,
      description: this.asString(career.description),
      duration,
    };
  }

  private normalizeProject(project: JsonRecord): ResumeProject {
    const duration = this.asString(project.duration ?? project.period);
    const [periodStart, periodEnd] = this.splitPeriod(duration);
    const responsibilities = this.asStringArray(project.responsibilities);
    const explicitSkills = this.asStringArray(project.skills);
    const skills =
      explicitSkills.length > 0
        ? explicitSkills
        : this.asStringArray(project.environment ?? project.techStack);

    return {
      ...project,
      name: this.asString(project.name),
      role: this.asString(project.role ?? project.position),
      startDate: this.asString(project.startDate) || periodStart,
      endDate: this.asString(project.endDate) || periodEnd,
      description:
        this.asString(project.description) || responsibilities.join(', '),
      skills,
      duration,
      responsibilities,
    };
  }

  private splitPeriod(period: string): [string, string] {
    if (!period) {
      return ['', ''];
    }

    const [startDate = '', endDate = ''] = period
      .split('~')
      .map((value) => value.trim());

    return [startDate, endDate];
  }

  private asString(value: unknown): string {
    return typeof value === 'string' ? value.trim() : '';
  }

  private asStringArray(value: unknown): string[] {
    if (!Array.isArray(value)) {
      return [];
    }

    return value.filter((item): item is string => typeof item === 'string');
  }

  private normalizeCompanyName(value: string): string {
    return value.replace(/\s+/g, '').toLowerCase();
  }

  private getMockAnalysisResult(): ResumeAnalysisResult {
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

  private getAnalysisErrorMessage(error: unknown): string {
    const maybeOpenAIError = error as { status?: number; message?: string };

    if (maybeOpenAIError.status === 401) {
      return 'OpenAI API 키가 올바르지 않습니다. backend/.env.development의 OPENAI_API_KEY를 확인해주세요.';
    }

    if (maybeOpenAIError.status === 404) {
      return 'OpenAI 모델을 찾을 수 없습니다. OPENAI_MODEL 값을 계정에서 사용 가능한 모델로 변경해주세요.';
    }

    if (maybeOpenAIError.status === 429) {
      return 'OpenAI 사용량 한도 또는 결제 상태를 확인해주세요.';
    }

    if (error instanceof SyntaxError) {
      return 'OpenAI 응답을 JSON으로 파싱하지 못했습니다. 프롬프트 또는 모델 응답을 확인해주세요.';
    }

    if (error instanceof Error && error.message) {
      return `이력서 분석에 실패했습니다: ${error.message}`;
    }

    return '이력서 분석에 실패했습니다.';
  }
}
