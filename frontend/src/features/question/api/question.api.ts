import apiClient from '@/shared/api/client';
import type { QuestionSet, GenerateQuestionsRequest } from '../model/question.types';

export const questionApi = {
  generate(data: GenerateQuestionsRequest) {
    return apiClient.post<QuestionSet>('/questions/generate', data);
  },

  getQuestionSet(id: number) {
    return apiClient.get<QuestionSet>(`/question-sets/${id}`);
  },
};
