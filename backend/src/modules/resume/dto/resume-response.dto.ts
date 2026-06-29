export class ResumeResponseDto {
  id: number;
  title: string;
  fileName: string;
  fileSize: number;
  status: string;
  skills: string[];
  careers: Record<string, unknown>[];
  projects: Record<string, unknown>[];
  analyzedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export class ResumeSummaryResponseDto {
  id: number;
  title: string;
  fileName: string;
  fileSize: number;
  status: string;
  skillCount: number;
  projectCount: number;
  analyzedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export class UploadResponseDto {
  id: number;
  title: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  status: string;
  createdAt: Date;
}

export class AnalyzeResponseDto {
  id: number;
  title: string;
  status: string;
  skills: string[];
  careers: Record<string, unknown>[];
  projects: Record<string, unknown>[];
  analyzedAt: Date;
}
