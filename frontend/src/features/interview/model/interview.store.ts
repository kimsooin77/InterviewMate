import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { interviewApi } from '../api/interview.api';
import type {
  InterviewSession,
  CurrentQuestion,
  Progress,
  AnswerFeedback,
  SubmitAnswerRequest,
} from './interview.types';

export const useInterviewStore = defineStore('interview', () => {
  const session = ref<InterviewSession | null>(null);
  const currentQuestion = ref<CurrentQuestion | null>(null);
  const progress = ref<Progress>({ current: 1, total: 0 });
  const isSubmitting = ref(false);
  const isCompleted = ref(false);
  const questionHistory = ref<CurrentQuestion[]>([]);
  const answersByQuestionId = ref<Record<number, string>>({});
  const latestFeedback = ref<AnswerFeedback | null>(null);
  const pendingNextQuestion = ref<CurrentQuestion | null>(null);
  const pendingProgress = ref<Progress | null>(null);
  const pendingCompletion = ref(false);

  const canGoPrevious = computed(() => progress.value.current > 1);
  const currentAnswer = computed(() => {
    if (!currentQuestion.value) return '';
    return answersByQuestionId.value[currentQuestion.value.id] || '';
  });

  async function startSession(questionSetId: number): Promise<InterviewSession> {
    const response = await interviewApi.createSession({ questionSetId });
    session.value = response.data;
    currentQuestion.value = response.data.currentQuestion;
    questionHistory.value = [response.data.currentQuestion];
    answersByQuestionId.value = {};
    latestFeedback.value = null;
    pendingNextQuestion.value = null;
    pendingProgress.value = null;
    pendingCompletion.value = false;
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

      answersByQuestionId.value = {
        ...answersByQuestionId.value,
        [data.questionId]: result.content,
      };

      latestFeedback.value = result.feedback;
      pendingNextQuestion.value = result.nextQuestion;
      pendingProgress.value = result.progress;
      pendingCompletion.value = !result.nextQuestion;

      return result;
    } finally {
      isSubmitting.value = false;
    }
  }

  function goToPreviousQuestion() {
    if (!canGoPrevious.value) return;

    const previousOrder = progress.value.current - 1;
    const previousQuestion = questionHistory.value.find(
      (question) => question.order === previousOrder,
    );

    if (!previousQuestion) return;

    currentQuestion.value = previousQuestion;
    clearPendingFeedback();
    progress.value = {
      ...progress.value,
      current: previousQuestion.order,
    };
    isCompleted.value = false;
  }

  function continueAfterFeedback() {
    if (!latestFeedback.value || !pendingProgress.value) return;

    progress.value = pendingProgress.value;

    if (pendingNextQuestion.value) {
      rememberQuestion(pendingNextQuestion.value);
      currentQuestion.value = pendingNextQuestion.value;
    } else if (pendingCompletion.value) {
      currentQuestion.value = null;
      isCompleted.value = true;
    }

    clearPendingFeedback();
  }

  function rememberQuestion(question: CurrentQuestion) {
    const existingIndex = questionHistory.value.findIndex(
      (item) => item.id === question.id,
    );

    if (existingIndex >= 0) {
      questionHistory.value[existingIndex] = question;
      return;
    }

    questionHistory.value.push(question);
    questionHistory.value.sort((a, b) => a.order - b.order);
  }

  function reset() {
    session.value = null;
    currentQuestion.value = null;
    questionHistory.value = [];
    answersByQuestionId.value = {};
    latestFeedback.value = null;
    pendingNextQuestion.value = null;
    pendingProgress.value = null;
    pendingCompletion.value = false;
    progress.value = { current: 1, total: 0 };
    isSubmitting.value = false;
    isCompleted.value = false;
  }

  function clearPendingFeedback() {
    latestFeedback.value = null;
    pendingNextQuestion.value = null;
    pendingProgress.value = null;
    pendingCompletion.value = false;
  }

  return {
    session,
    currentQuestion,
    progress,
    isSubmitting,
    isCompleted,
    canGoPrevious,
    currentAnswer,
    latestFeedback,
    startSession,
    submitAnswer,
    goToPreviousQuestion,
    continueAfterFeedback,
    reset,
  };
});
