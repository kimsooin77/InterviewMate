import apiClient from '@/shared/api/client';
import type {
  InterviewSession,
  InterviewHistoryItem,
  AnswerResponse,
  CreateSessionRequest,
  SubmitAnswerRequest,
} from '../model/interview.types';

export const interviewApi = {
  createSession(data: CreateSessionRequest) {
    return apiClient.post<InterviewSession>('/interviews', data);
  },

  getHistory() {
    return apiClient.get<InterviewHistoryItem[]>('/interviews/history');
  },

  submitAnswer(sessionId: number, data: SubmitAnswerRequest) {
    return apiClient.post<AnswerResponse>(
      `/interviews/${sessionId}/answers`,
      data,
    );
  },
};
