import { defineStore } from 'pinia';
import { ref } from 'vue';
import { questionApi } from '../api/question.api';
import type { QuestionSet, GenerateQuestionsRequest } from './question.types';

export const useQuestionStore = defineStore('question', () => {
  const currentQuestionSet = ref<QuestionSet | null>(null);
  const isGenerating = ref(false);

  async function generate(data: GenerateQuestionsRequest): Promise<QuestionSet> {
    isGenerating.value = true;
    try {
      const response = await questionApi.generate(data);
      currentQuestionSet.value = response.data;
      return response.data;
    } finally {
      isGenerating.value = false;
    }
  }

  async function fetchQuestionSet(id: number): Promise<QuestionSet> {
    const response = await questionApi.getQuestionSet(id);
    currentQuestionSet.value = response.data;
    return response.data;
  }

  function reset() {
    currentQuestionSet.value = null;
  }

  return {
    currentQuestionSet,
    isGenerating,
    generate,
    fetchQuestionSet,
    reset,
  };
});
