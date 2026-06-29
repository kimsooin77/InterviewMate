import apiClient from '@/shared/api/client';
import type {
  Resume,
  ResumeSummary,
  UploadResponse,
  AnalyzeResponse,
} from '../model/resume.types';

const RESUME_ANALYZE_TIMEOUT_MS = 180000;

export const resumeApi = {
  upload(file: File, title?: string) {
    const formData = new FormData();
    formData.append('file', file);
    if (title) {
      formData.append('title', title);
    }
    return apiClient.post<UploadResponse>('/resumes/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  getAll() {
    return apiClient.get<ResumeSummary[]>('/resumes');
  },

  analyze(resumeId: number) {
    return apiClient.post<AnalyzeResponse>(`/resumes/${resumeId}/analyze`, undefined, {
      timeout: RESUME_ANALYZE_TIMEOUT_MS,
    });
  },

  getById(resumeId: number) {
    return apiClient.get<Resume>(`/resumes/${resumeId}`);
  },

  remove(resumeId: number) {
    return apiClient.delete<{ success: boolean }>(`/resumes/${resumeId}`);
  },
};
