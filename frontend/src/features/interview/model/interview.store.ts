import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { interviewApi } from '../api/interview.api';
import type {
  InterviewSession,
  InterviewHistoryItem,
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
  const history = ref<InterviewHistoryItem[]>([]);
  const isLoadingHistory = ref(false);
  const questionHistory = ref<CurrentQuestion[]>([]);
  const answersByQuestionId = ref<Record<number, string>>({});
  const draftAnswersByQuestionId = ref<Record<number, string>>({});
  const latestFeedback = ref<AnswerFeedback | null>(null);
  const pendingNextQuestion = ref<CurrentQuestion | null>(null);
  const pendingProgress = ref<Progress | null>(null);
  const pendingCompletion = ref(false);
  const pendingHasFollowUp = ref(false);

  const canGoPrevious = computed(() => {
    const previousOrder = progress.value.current - 1;
    return questionHistory.value.some((question) => question.order === previousOrder);
  });
  const currentAnswer = computed(() => {
    if (!currentQuestion.value) return '';
    return (
      draftAnswersByQuestionId.value[currentQuestion.value.id] ??
      answersByQuestionId.value[currentQuestion.value.id] ??
      ''
    );
  });

  async function startSession(questionSetId: number): Promise<InterviewSession> {
    const response = await interviewApi.createSession({ questionSetId });
    hydrateSession(response.data);
    return response.data;
  }

  async function loadSession(sessionId: number): Promise<InterviewSession> {
    const response = await interviewApi.getSession(sessionId);
    hydrateSession(response.data);
    return response.data;
  }

  function hydrateSession(data: InterviewSession) {
    session.value = data;
    currentQuestion.value = data.currentQuestion;
    questionHistory.value = data.currentQuestion ? [data.currentQuestion] : [];
    answersByQuestionId.value = {};
    draftAnswersByQuestionId.value = loadDraftAnswers(data.id);
    latestFeedback.value = null;
    pendingNextQuestion.value = null;
    pendingProgress.value = null;
    pendingCompletion.value = false;
    pendingHasFollowUp.value = false;
    progress.value = {
      current: data.currentOrder,
      total: data.totalQuestions,
    };
    isCompleted.value = data.status === 'completed' || !data.currentQuestion;
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
      removeDraftAnswer(data.questionId);

      latestFeedback.value = result.feedback;
      pendingNextQuestion.value = result.nextQuestion;
      pendingProgress.value = result.progress;
      pendingCompletion.value = !result.nextQuestion;
      pendingHasFollowUp.value = Boolean(result.hasFollowUp);

      if (result.sessionStatus && session.value) {
        session.value = {
          ...session.value,
          status: result.sessionStatus,
          completedAt:
            result.sessionStatus === 'completed'
              ? new Date().toISOString()
              : session.value.completedAt,
        };
      }

      return result;
    } finally {
      isSubmitting.value = false;
    }
  }

  function saveDraftAnswer(questionId: number, content: string) {
    if (!session.value) return;

    draftAnswersByQuestionId.value = {
      ...draftAnswersByQuestionId.value,
      [questionId]: content,
    };
    persistDraftAnswers(session.value.id);
  }

  function removeDraftAnswer(questionId: number) {
    if (!session.value) return;

    const nextDrafts = { ...draftAnswersByQuestionId.value };
    delete nextDrafts[questionId];
    draftAnswersByQuestionId.value = nextDrafts;
    persistDraftAnswers(session.value.id);
  }

  async function fetchHistory(): Promise<InterviewHistoryItem[]> {
    isLoadingHistory.value = true;
    try {
      const response = await interviewApi.getHistory();
      history.value = response.data;
      return response.data;
    } finally {
      isLoadingHistory.value = false;
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
    draftAnswersByQuestionId.value = {};
    latestFeedback.value = null;
    pendingNextQuestion.value = null;
    pendingProgress.value = null;
    pendingCompletion.value = false;
    pendingHasFollowUp.value = false;
    progress.value = { current: 1, total: 0 };
    isSubmitting.value = false;
    isCompleted.value = false;
  }

  function clearPendingFeedback() {
    latestFeedback.value = null;
    pendingNextQuestion.value = null;
    pendingProgress.value = null;
    pendingCompletion.value = false;
    pendingHasFollowUp.value = false;
  }

  function draftStorageKey(sessionId: number) {
    return `interview:drafts:${sessionId}`;
  }

  function loadDraftAnswers(sessionId: number): Record<number, string> {
    const rawDrafts = safeGetLocalStorage(draftStorageKey(sessionId));
    if (!rawDrafts) return {};

    try {
      const parsed = JSON.parse(rawDrafts) as Record<string, unknown>;

      return Object.fromEntries(
        Object.entries(parsed).filter(
          (entry): entry is [string, string] =>
            typeof entry[1] === 'string' && entry[1].trim().length > 0,
        ),
      );
    } catch {
      safeRemoveLocalStorage(draftStorageKey(sessionId));
      return {};
    }
  }

  function persistDraftAnswers(sessionId: number) {
    const drafts = Object.fromEntries(
      Object.entries(draftAnswersByQuestionId.value).filter(
        ([, value]) => typeof value === 'string' && value.trim().length > 0,
      ),
    );

    if (Object.keys(drafts).length === 0) {
      safeRemoveLocalStorage(draftStorageKey(sessionId));
      return;
    }

    safeSetLocalStorage(draftStorageKey(sessionId), JSON.stringify(drafts));
  }

  function safeGetLocalStorage(key: string) {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  }

  function safeSetLocalStorage(key: string, value: string) {
    try {
      localStorage.setItem(key, value);
    } catch {
      // Draft persistence is best-effort and should not block answer submission.
    }
  }

  function safeRemoveLocalStorage(key: string) {
    try {
      localStorage.removeItem(key);
    } catch {
      // Draft persistence is best-effort and should not block answer submission.
    }
  }

  return {
    session,
    currentQuestion,
    progress,
    isSubmitting,
    isCompleted,
    history,
    isLoadingHistory,
    canGoPrevious,
    currentAnswer,
    latestFeedback,
    pendingHasFollowUp,
    startSession,
    loadSession,
    submitAnswer,
    saveDraftAnswer,
    fetchHistory,
    goToPreviousQuestion,
    continueAfterFeedback,
    reset,
  };
});
