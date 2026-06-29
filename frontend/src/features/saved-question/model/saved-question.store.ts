import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import type {
  SavedInterviewQuestion,
  SavedQuestionReviewStatus,
  SaveQuestionInput,
} from './saved-question.types';

const STORAGE_KEY = 'interview-mate:saved-questions';

export const useSavedQuestionStore = defineStore('saved-question', () => {
  const questions = ref<SavedInterviewQuestion[]>(loadQuestions());
  const selectedCategory = ref<string>('all');
  const selectedStatus = ref<string>('all');

  const filteredQuestions = computed(() =>
    questions.value.filter((question) => {
      const categoryMatches =
        selectedCategory.value === 'all' || question.category === selectedCategory.value;
      const statusMatches =
        selectedStatus.value === 'all' || question.reviewStatus === selectedStatus.value;
      return categoryMatches && statusMatches;
    }),
  );

  const savedCount = computed(() => questions.value.length);
  const reviewingCount = computed(
    () => questions.value.filter((question) => question.reviewStatus === 'reviewing').length,
  );
  const confidentCount = computed(
    () => questions.value.filter((question) => question.reviewStatus === 'confident').length,
  );

  function addQuestion(input: SaveQuestionInput) {
    const normalizedQuestion = input.question.trim();
    if (!normalizedQuestion) return null;

    const existing = questions.value.find(
      (question) => question.question.trim() === normalizedQuestion,
    );

    if (existing) return existing;

    const now = new Date().toISOString();
    const nextQuestion: SavedInterviewQuestion = {
      id: `saved-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      question: normalizedQuestion,
      answer: input.answer?.trim() || '',
      followUpQuestion: input.followUpQuestion?.trim() || '',
      followUpAnswer: input.followUpAnswer?.trim() || '',
      category: input.category || 'technical',
      tags: input.tags || [],
      source: input.source || 'manual',
      reviewStatus: 'new',
      lastReviewedAt: null,
      createdAt: now,
      updatedAt: now,
    };

    questions.value = [nextQuestion, ...questions.value];
    persist();
    return nextQuestion;
  }

  function updateQuestion(id: string, patch: Partial<SavedInterviewQuestion>) {
    questions.value = questions.value.map((question) =>
      question.id === id
        ? {
            ...question,
            ...patch,
            updatedAt: new Date().toISOString(),
          }
        : question,
    );
    persist();
  }

  function updateReviewStatus(id: string, reviewStatus: SavedQuestionReviewStatus) {
    updateQuestion(id, {
      reviewStatus,
      lastReviewedAt: new Date().toISOString(),
    });
  }

  function removeQuestion(id: string) {
    questions.value = questions.value.filter((question) => question.id !== id);
    persist();
  }

  function persist() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(questions.value));
  }

  return {
    questions,
    selectedCategory,
    selectedStatus,
    filteredQuestions,
    savedCount,
    reviewingCount,
    confidentCount,
    addQuestion,
    updateQuestion,
    updateReviewStatus,
    removeQuestion,
  };
});

function loadQuestions(): SavedInterviewQuestion[] {
  try {
    const rawQuestions = localStorage.getItem(STORAGE_KEY);
    if (!rawQuestions) return [];

    const parsed = JSON.parse(rawQuestions) as SavedInterviewQuestion[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
