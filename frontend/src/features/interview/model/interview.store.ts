import { defineStore } from 'pinia';
import { ref } from 'vue';
import { interviewApi } from '../api/interview.api';
import type {
  InterviewSession,
  CurrentQuestion,
  Progress,
  SubmitAnswerRequest,
} from './interview.types';

export const useInterviewStore = defineStore('interview', () => {
  const session = ref<InterviewSession | null>(null);
  const currentQuestion = ref<CurrentQuestion | null>(null);
  const progress = ref<Progress>({ current: 1, total: 0 });
  const isSubmitting = ref(false);
  const isCompleted = ref(false);

  async function startSession(questionSetId: number): Promise<InterviewSession> {
    const response = await interviewApi.createSession({ questionSetId });
    session.value = response.data;
    currentQuestion.value = response.data.currentQuestion;
    progress.value = {
      current: response.data.currentOrder,
      total: response.data.totalQuestions,
    };
    isCompleted.value = false;
    return response.data;
  }

  async function submitAnswer(data: SubmitAnswerRequest) {
    if (!session.value) return;

    isSubmitting.value = true;
    try {
      const response = await interviewApi.submitAnswer(session.value.id, data);
      const result = response.data;

      progress.value = result.progress;

      if (result.nextQuestion) {
        currentQuestion.value = result.nextQuestion;
      } else {
        currentQuestion.value = null;
        isCompleted.value = true;
      }

      return result;
    } finally {
      isSubmitting.value = false;
    }
  }

  function reset() {
    session.value = null;
    currentQuestion.value = null;
    progress.value = { current: 1, total: 0 };
    isSubmitting.value = false;
    isCompleted.value = false;
  }

  return {
    session,
    currentQuestion,
    progress,
    isSubmitting,
    isCompleted,
    startSession,
    submitAnswer,
    reset,
  };
});
