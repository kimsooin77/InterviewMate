import { defineStore } from 'pinia';
import { ref } from 'vue';
import { evaluationApi } from '../api/evaluation.api';
import type { Evaluation } from './evaluation.types';

export const useEvaluationStore = defineStore('evaluation', () => {
  const currentEvaluation = ref<Evaluation | null>(null);
  const isEvaluating = ref(false);

  async function evaluate(sessionId: number): Promise<Evaluation> {
    isEvaluating.value = true;
    try {
      const response = await evaluationApi.create({ sessionId });
      currentEvaluation.value = response.data;
      return response.data;
    } finally {
      isEvaluating.value = false;
    }
  }

  async function fetchEvaluation(sessionId: number): Promise<Evaluation> {
    const response = await evaluationApi.getBySessionId(sessionId);
    currentEvaluation.value = response.data;
    return response.data;
  }

  function reset() {
    currentEvaluation.value = null;
    isEvaluating.value = false;
  }

  return {
    currentEvaluation,
    isEvaluating,
    evaluate,
    fetchEvaluation,
    reset,
  };
});
