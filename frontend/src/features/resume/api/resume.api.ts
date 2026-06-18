import apiClient from '@/shared/api/client';
import type { Resume, UploadResponse, AnalyzeResponse } from '../model/resume.types';

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

  analyze(resumeId: number) {
    return apiClient.post<AnalyzeResponse>(`/resumes/${resumeId}/analyze`);
  },

  getById(resumeId: number) {
    return apiClient.get<Resume>(`/resumes/${resumeId}`);
  },
};
