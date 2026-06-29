<template>
  <div class="saved-questions-page">
    <section class="saved-questions-page__hero">
      <div>
        <span class="saved-questions-page__eyebrow">QUESTION BANK</span>
        <h1>면접 질문 보관함</h1>
        <p>AI가 생성했거나 면접 중 저장한 질문만 모아두고, 필요한 질문만 다시 복기하세요.</p>
      </div>
    </section>

    <section class="saved-questions-page__summary" aria-label="복기 현황">
      <article>
        <span>저장 질문</span>
        <strong>{{ savedQuestionStore.savedCount }}</strong>
      </article>
      <article>
        <span>복기 중</span>
        <strong>{{ savedQuestionStore.reviewingCount }}</strong>
      </article>
      <article>
        <span>외운 질문</span>
        <strong>{{ savedQuestionStore.confidentCount }}</strong>
      </article>
    </section>

    <section class="saved-questions-page__sticky-tools">
      <el-input
        v-model="searchQuery"
        clearable
        :prefix-icon="Search"
        placeholder="검색어 입력"
        aria-label="질문 검색"
      />

      <div class="saved-questions-page__chips" aria-label="카테고리 필터">
        <button
          v-for="category in categoryOptions"
          :key="category.value"
          type="button"
          :class="{ 'is-active': selectedCategory === category.value }"
          @click="selectedCategory = category.value"
        >
          {{ category.label }}
        </button>
      </div>
    </section>

    <div class="saved-questions-page__sort-bar">
      <el-select
        v-model="sortMode"
        class="saved-questions-page__sort-select"
        size="small"
        aria-label="정렬"
        placement="bottom-end"
        popper-class="saved-questions-page__sort-popper"
      >
        <el-option label="최신순" value="latest" />
        <el-option label="복기순" value="review" />
      </el-select>
    </div>

    <el-empty
      v-if="filteredQuestions.length === 0"
      description="조건에 맞는 저장 질문이 없습니다."
    />

    <template v-else>
      <div class="saved-questions-page__list">
        <button
          v-for="question in visibleQuestions"
          :key="question.id"
          type="button"
          class="saved-question-row"
          @click="openDetail(question)"
        >
          <div class="saved-question-row__main">
            <div class="saved-question-row__meta">
              <el-tag size="small" effect="light" :type="categoryType(question.category)">
                {{ categoryLabel(question.category) }}
              </el-tag>
              <el-tag size="small" effect="plain">{{ statusLabel(question.reviewStatus) }}</el-tag>
            </div>
            <strong>{{ question.question }}</strong>
            <p>{{ answerPreview(question.answer) }}</p>
          </div>
          <span class="saved-question-row__chevron">›</span>
        </button>
      </div>

      <div
        v-if="visibleQuestions.length < filteredQuestions.length"
        ref="loadMoreTriggerRef"
        class="saved-questions-page__load-trigger"
        aria-hidden="true"
      >
        <el-icon v-if="isLoadingMore" class="saved-questions-page__spinner"><Loading /></el-icon>
      </div>
    </template>

    <el-drawer
      v-model="isDetailSheetOpen"
      modal-class="saved-question-sheet"
      direction="btt"
      size="82%"
      :with-header="false"
      @opened="resetDetailScroll"
    >
      <section v-if="selectedQuestion" ref="detailSheetRef" class="saved-question-detail">
        <div class="saved-question-detail__handle" aria-hidden="true" />
        <div class="saved-question-detail__header">
          <div>
            <el-tag effect="light" :type="categoryType(selectedQuestion.category)">
              {{ categoryLabel(selectedQuestion.category) }}
            </el-tag>
            <el-tag effect="plain">{{ statusLabel(selectedQuestion.reviewStatus) }}</el-tag>
          </div>
          <button type="button" aria-label="닫기" @click="isDetailSheetOpen = false">×</button>
        </div>

        <h2>{{ selectedQuestion.question }}</h2>

        <section>
          <h3>좋은 답변</h3>
          <p>{{ selectedQuestion.answer || '아직 저장된 답변이 없습니다.' }}</p>
        </section>

        <section v-if="selectedQuestion.followUpQuestion || selectedQuestion.followUpAnswer">
          <h3>꼬리질문</h3>
          <strong>{{ selectedQuestion.followUpQuestion }}</strong>
          <p>{{ selectedQuestion.followUpAnswer }}</p>
        </section>

        <div class="saved-question-detail__actions">
          <el-button @click="markSelected('reviewing')">다시 보기</el-button>
          <el-button type="primary" @click="markSelected('confident')">외움</el-button>
          <el-button
            v-if="selectedQuestion.source !== 'default'"
            type="danger"
            plain
            @click="deleteSelected"
          >
            삭제
          </el-button>
        </div>
      </section>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { Loading, Search } from '@element-plus/icons-vue';
import { useSavedQuestionStore } from '@/features/saved-question';
import type {
  SavedInterviewQuestion,
  SavedQuestionCategory,
  SavedQuestionReviewStatus,
} from '@/features/saved-question';

const PAGE_SIZE = 10;
const LOAD_MORE_DELAY_MS = 350;

const savedQuestionStore = useSavedQuestionStore();
const searchQuery = ref('');
const selectedCategory = ref<'all' | SavedQuestionCategory>('all');
const sortMode = ref<'latest' | 'review'>('latest');
const visibleCount = ref(PAGE_SIZE);
const isLoadingMore = ref(false);
const loadMoreTriggerRef = ref<HTMLElement | null>(null);
const detailSheetRef = ref<HTMLElement | null>(null);
const isDetailSheetOpen = ref(false);
const selectedQuestion = ref<SavedInterviewQuestion | null>(null);
const allQuestions = computed<SavedInterviewQuestion[]>(() => savedQuestionStore.questions);

let loadMoreObserver: IntersectionObserver | null = null;
let loadMoreTimerId: number | undefined;

const categoryOptions: Array<{ label: string; value: 'all' | SavedQuestionCategory }> = [
  { label: '전체', value: 'all' },
  { label: '공통', value: 'common' },
  { label: '프로젝트', value: 'project' },
  { label: '기술', value: 'technical' },
  { label: '경험/태도', value: 'behavior' },
  { label: '회사', value: 'company' },
];

const filteredQuestions = computed(() => {
  const keyword = searchQuery.value.trim().toLowerCase();
  const statusWeight: Record<SavedQuestionReviewStatus, number> = {
    reviewing: 0,
    new: 1,
    confident: 2,
  };

  return allQuestions.value
    .filter((question: SavedInterviewQuestion) => {
      const categoryMatches =
        selectedCategory.value === 'all' || question.category === selectedCategory.value;
      const keywordMatches =
        !keyword ||
        question.question.toLowerCase().includes(keyword) ||
        question.answer.toLowerCase().includes(keyword) ||
        question.tags.some((tag: string) => tag.toLowerCase().includes(keyword));
      return categoryMatches && keywordMatches;
    })
    .sort((a: SavedInterviewQuestion, b: SavedInterviewQuestion) => {
      if (sortMode.value === 'review') {
        const statusDiff = statusWeight[a.reviewStatus] - statusWeight[b.reviewStatus];
        if (statusDiff !== 0) return statusDiff;
      }

      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
});

const visibleQuestions = computed(() => filteredQuestions.value.slice(0, visibleCount.value));

watch([searchQuery, selectedCategory, sortMode], () => {
  visibleCount.value = PAGE_SIZE;
  isLoadingMore.value = false;
  bindLoadMoreObserver();
});

watch(loadMoreTriggerRef, () => {
  bindLoadMoreObserver();
});

onMounted(() => {
  bindLoadMoreObserver();
});

onBeforeUnmount(() => {
  disconnectLoadMoreObserver();

  if (loadMoreTimerId) {
    window.clearTimeout(loadMoreTimerId);
  }
});

function bindLoadMoreObserver() {
  nextTick(() => {
    disconnectLoadMoreObserver();

    const trigger = loadMoreTriggerRef.value;
    if (!trigger) return;

    loadMoreObserver = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          loadNextPage();
        }
      },
      { rootMargin: '160px 0px' },
    );
    loadMoreObserver.observe(trigger);
  });
}

function disconnectLoadMoreObserver() {
  loadMoreObserver?.disconnect();
  loadMoreObserver = null;
}

function loadNextPage() {
  if (isLoadingMore.value || visibleCount.value >= filteredQuestions.value.length) return;

  isLoadingMore.value = true;
  loadMoreTimerId = window.setTimeout(() => {
    visibleCount.value = Math.min(visibleCount.value + PAGE_SIZE, filteredQuestions.value.length);
    isLoadingMore.value = false;
    bindLoadMoreObserver();
  }, LOAD_MORE_DELAY_MS);
}

function openDetail(question: SavedInterviewQuestion) {
  selectedQuestion.value = question;
  isDetailSheetOpen.value = true;
  resetDetailScroll();
}

function resetDetailScroll() {
  nextTick(() => {
    detailSheetRef.value?.scrollTo({ top: 0, left: 0 });
  });
}

function markSelected(status: SavedQuestionReviewStatus) {
  if (!selectedQuestion.value) return;
  savedQuestionStore.updateReviewStatus(selectedQuestion.value.id, status);
  selectedQuestion.value =
    allQuestions.value.find(
      (question: SavedInterviewQuestion) => question.id === selectedQuestion.value?.id,
    ) || null;
}

function deleteSelected() {
  if (!selectedQuestion.value) return;
  savedQuestionStore.removeQuestion(selectedQuestion.value.id);
  selectedQuestion.value = null;
  isDetailSheetOpen.value = false;
}

function answerPreview(answer: string) {
  if (!answer) return '저장된 답변을 상세에서 복기해보세요.';
  return answer.length > 96 ? `${answer.slice(0, 96)}...` : answer;
}

function categoryLabel(category: SavedQuestionCategory) {
  const map: Record<SavedQuestionCategory, string> = {
    common: '공통',
    project: '프로젝트',
    technical: '기술',
    behavior: '경험/태도',
    company: '회사',
  };
  return map[category];
}

function categoryType(category: SavedQuestionCategory) {
  const map: Record<SavedQuestionCategory, '' | 'success' | 'warning' | 'danger' | 'info'> = {
    common: '',
    project: 'success',
    technical: 'warning',
    behavior: 'info',
    company: 'danger',
  };
  return map[category];
}

function statusLabel(status: SavedQuestionReviewStatus) {
  const map: Record<SavedQuestionReviewStatus, string> = {
    new: '새 질문',
    reviewing: '복기 중',
    confident: '외움',
  };
  return map[status];
}
</script>

<style lang="scss" scoped>
.saved-questions-page {
  max-width: 980px;
  margin: 0 auto;
  padding: 20px;

  &__hero,
  &__summary article,
  .saved-question-row {
    border: 1px solid #e6edf7;
    border-radius: 10px;
    background: #fff;
  }

  &__hero {
    padding: 16px 18px;
    background: linear-gradient(135deg, #ecf5ff 0%, #ffffff 72%);

    h1 {
      margin: 5px 0 4px;
      color: #172554;
      font-size: 23px;
      line-height: 1.25;
    }

    p {
      margin: 0;
      color: #536276;
      font-size: 13px;
      line-height: 1.45;
    }
  }

  &__eyebrow {
    color: #409eff;
    font-size: 11px;
    font-weight: 800;
    letter-spacing: 0.04em;
  }

  &__summary {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 6px;
    margin-top: 8px;

    article {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 6px;
      min-width: 0;
      padding: 8px 10px;
    }

    span {
      color: #7a8699;
      font-size: 11px;
      font-weight: 700;
      white-space: nowrap;
    }

    strong {
      color: #1f2a44;
      font-size: 18px;
      line-height: 1;
    }
  }

  &__sticky-tools {
    position: sticky;
    top: 60px;
    z-index: 10;
    display: grid;
    grid-template-columns: minmax(220px, 1fr) minmax(0, auto);
    align-items: center;
    gap: 10px;
    margin: 16px 0 8px;
    padding: 12px 0;
    background: #f5f7fa;
  }

  &__sort-bar {
    display: flex;
    justify-content: flex-end;
    margin: 0 0 8px;
  }

  &__sort-select {
    width: 96px;

    :deep(.el-select__wrapper) {
      min-height: 28px;
      padding: 0 18px 0 0;
      border: 0;
      background: transparent;
      box-shadow: none;
    }

    :deep(.el-select__selection) {
      min-width: 48px;
      flex: 0 0 auto;
    }

    :deep(.el-select__selected-item),
    :deep(.el-select__placeholder) {
      flex: 0 0 auto;
      color: #606266;
      font-size: 13px;
      font-weight: 700;
      line-height: 28px;
      overflow: visible;
      white-space: nowrap;
    }

    :deep(.el-select__caret) {
      color: #909399;
      font-size: 14px;
    }
  }

  &__chips {
    display: flex;
    align-items: center;
    gap: 8px;
    overflow-x: auto;
    scrollbar-width: none;

    &::-webkit-scrollbar {
      display: none;
    }

    button {
      flex: 0 0 auto;
      border: 1px solid #dcdfe6;
      border-radius: 999px;
      background: #fff;
      padding: 8px 12px;
      color: #606266;
      font: inherit;
      font-size: 13px;
      cursor: pointer;

      &.is-active {
        border-color: #409eff;
        background: #ecf5ff;
        color: #409eff;
        font-weight: 700;
      }
    }
  }

  &__list {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  &__load-trigger {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 38px;
    margin-top: 10px;
  }

  &__spinner {
    color: #409eff;
    font-size: 22px;
    animation: saved-question-spin 0.9s linear infinite;
  }
}

.saved-question-row {
  appearance: none;
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  gap: 14px;
  padding: 16px 18px;
  text-align: left;
  cursor: pointer;

  &:hover,
  &:focus {
    border-color: #b3d8ff;
    outline: none;
  }

  &__main {
    min-width: 0;
  }

  &__meta {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-bottom: 8px;
  }

  strong {
    display: block;
    color: #1f2a44;
    font-size: 17px;
    line-height: 1.45;
  }

  p {
    display: -webkit-box;
    overflow: hidden;
    margin: 8px 0 0;
    color: #687386;
    font-size: 13px;
    line-height: 1.5;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
  }

  &__chevron {
    flex: 0 0 auto;
    color: #c0c4cc;
    font-size: 28px;
    line-height: 1;
  }
}

@keyframes saved-question-spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 760px) {
  .saved-questions-page {
    padding: 8px 0;

    &__hero {
      padding: 12px 14px;

      h1 {
        font-size: 20px;
      }

      p {
        font-size: 12px;
        line-height: 1.4;
      }
    }

    &__summary {
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 4px;
      margin-top: 6px;

      article {
        flex-direction: column;
        align-items: flex-start;
        padding: 7px 8px;
      }

      span {
        font-size: 10px;
      }

      strong {
        font-size: 17px;
      }
    }

    &__sticky-tools {
      top: 58px;
      grid-template-columns: 1fr;
      margin: 10px 0;
      padding: 8px 0;
    }

    &__sort-bar {
      margin: -2px 0 8px;
      padding: 0 2px;
    }

    &__chips {
      grid-column: 1 / -1;
    }

    &__sort-select {
      width: 96px;
    }
  }
}
</style>

<style lang="scss">
.saved-question-sheet {
  .el-drawer {
    max-width: 760px;
    margin: 0 auto;
    border-radius: 16px 16px 0 0;
  }

  .el-drawer__body {
    padding: 0;
  }
}

.saved-questions-page__sort-popper {
  width: 96px !important;
  min-width: 96px !important;

  .el-select-dropdown__item {
    padding: 0 14px;

    span {
      overflow: visible;
      text-overflow: clip;
    }
  }
}

.saved-question-detail {
  max-height: 100%;
  overflow: auto;
  padding: 12px 18px 22px;
  background: #fff;
}

.saved-question-detail__handle {
  width: 42px;
  height: 4px;
  margin: 0 auto 14px;
  border-radius: 999px;
  background: #dcdfe6;
}

.saved-question-detail__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;

  > div {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }

  button {
    border: 0;
    background: transparent;
    color: #909399;
    font-size: 28px;
    line-height: 1;
    cursor: pointer;
  }
}

.saved-question-detail {
  h2 {
    margin: 18px 0;
    color: #1f2a44;
    font-size: 22px;
    line-height: 1.45;
  }

  section {
    padding: 16px 0;
    border-top: 1px solid #eef2f7;
  }

  h3 {
    margin: 0 0 8px;
    color: #303133;
    font-size: 15px;
  }

  strong,
  p {
    color: #606266;
    line-height: 1.7;
    white-space: pre-wrap;
  }

  p {
    margin: 0;
  }
}

.saved-question-detail__actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding-top: 12px;
}

@media (max-width: 760px) {
  .saved-question-detail__actions {
    .el-button {
      flex: 1;
    }
  }
}
</style>
