import apiClient from '@/shared/api/client';
import type {
  InterviewSession,
  AnswerResponse,
  CreateSessionRequest,
  SubmitAnswerRequest,
} from '../model/interview.types';

export const interviewApi = {
  createSession(data: CreateSessionRequest) {
    return apiClient.post<InterviewSession>('/interviews', data);
  },

  submitAnswer(sessionId: number, data: SubmitAnswerRequest) {
    return apiClient.post<AnswerResponse>(
      `/interviews/${sessionId}/answers`,
      data,
    );
  },
};
