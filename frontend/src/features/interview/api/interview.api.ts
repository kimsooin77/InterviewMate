import apiClient from '@/shared/api/client';
import type {
  InterviewSession,
  InterviewHistoryItem,
  AnswerResponse,
  CreateSessionRequest,
  SubmitAnswerRequest,
} from '../model/interview.types';

const INTERVIEW_SUBMIT_TIMEOUT_MS = 180000;

export const interviewApi = {
  createSession(data: CreateSessionRequest) {
    return apiClient.post<InterviewSession>('/interviews', data);
  },

  getSession(sessionId: number) {
    return apiClient.get<InterviewSession>(`/interviews/${sessionId}`);
  },

  getHistory() {
    return apiClient.get<InterviewHistoryItem[]>('/interviews/history');
  },

  submitAnswer(sessionId: number, data: SubmitAnswerRequest) {
    return apiClient.post<AnswerResponse>(
      `/interviews/${sessionId}/answers`,
      data,
      { timeout: INTERVIEW_SUBMIT_TIMEOUT_MS },
    );
  },
};
