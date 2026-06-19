import apiClient from '@/shared/api/client';
import type { Report } from '../model/report.types';

export const reportApi = {
  getBySessionId(sessionId: number) {
    return apiClient.get<Report>(`/reports/${sessionId}`);
  },
};
