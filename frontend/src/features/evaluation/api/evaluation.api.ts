import apiClient from '@/shared/api/client';
import type { Evaluation, CreateEvaluationRequest } from '../model/evaluation.types';

export const evaluationApi = {
  create(data: CreateEvaluationRequest) {
    return apiClient.post<Evaluation>('/evaluations', data);
  },

  getBySessionId(sessionId: number) {
    return apiClient.get<Evaluation>(`/evaluations/${sessionId}`);
  },
};
