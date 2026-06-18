export interface Career {
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  description: string;
}

export interface Project {
  name: string;
  role: string;
  startDate: string;
  endDate: string;
  description: string;
  skills: string[];
}

export interface Resume {
  id: number;
  title: string;
  fileName: string;
  fileSize: number;
  status: string;
  skills: string[];
  careers: Career[];
  projects: Project[];
  analyzedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UploadResponse {
  id: number;
  title: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  status: string;
  createdAt: string;
}

export interface AnalyzeResponse {
  id: number;
  title: string;
  status: string;
  skills: string[];
  careers: Career[];
  projects: Project[];
  analyzedAt: string;
}
