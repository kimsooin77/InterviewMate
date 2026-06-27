<template>
  <div class="evaluation-page">
    <el-page-header @back="router.back()">
      <template #content>면접 평가</template>
    </el-page-header>

    <div v-if="evaluationStore.isEvaluating" class="evaluation-page__state">
      <el-result
        icon="info"
        title="평가 진행 중..."
        sub-title="AI가 답변을 분석하고 있습니다. 잠시만 기다려주세요."
      >
        <template #extra>
          <el-icon class="is-loading" :size="32"><Loading /></el-icon>
        </template>
      </el-result>
    </div>

    <div v-else-if="evaluationStore.currentEvaluation" class="evaluation-page__content">
      <EvaluationSummary
        :overall-score="evaluationStore.currentEvaluation.overallScore"
        :question-count="weakEvaluations.length"
      />

      <el-alert
        v-if="weakEvaluations.length"
        class="evaluation-page__notice"
        type="warning"
        :closable="false"
        show-icon
        title="보완이 필요한 문항만 추려서 보여드립니다."
      />

      <el-empty
        v-else
        description="보완이 필요한 문항이 없습니다."
      />

      <div v-if="weakEvaluations.length" class="evaluation-page__carousel">
        <div class="evaluation-page__carousel-header">
          <strong>보완 카드 {{ activeCardIndex + 1 }} / {{ weakEvaluations.length }}</strong>
          <div class="evaluation-page__carousel-actions">
            <el-button circle :disabled="activeCardIndex === 0" @click="scrollEvaluation(-1)">
              ‹
            </el-button>
            <el-button
              circle
              :disabled="activeCardIndex >= weakEvaluations.length - 1"
              @click="scrollEvaluation(1)"
            >
              ›
            </el-button>
          </div>
        </div>

        <div
          ref="evaluationTrackRef"
          class="evaluation-page__track"
          @scroll="handleEvaluationScroll"
        >
          <div
            v-for="item in weakEvaluations"
            :key="item.questionId"
            class="evaluation-page__slide"
          >
            <EvaluationItemCard :item="item" />
          </div>
        </div>

        <div class="evaluation-page__dots" aria-hidden="true">
          <button
            v-for="(_, index) in weakEvaluations"
            :key="index"
            type="button"
            :class="{ 'is-active': index === activeCardIndex }"
            @click="scrollToEvaluation(index)"
          />
        </div>
      </div>

      <div class="evaluation-page__actions">
        <el-button
          type="primary"
          size="large"
          @click="router.push(`/reports/${sessionId}`)"
        >
          리포트 보기
        </el-button>
      </div>
    </div>

    <el-skeleton v-else :rows="10" animated class="evaluation-page__content" />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage, ElIcon } from 'element-plus';
import { Loading } from '@element-plus/icons-vue';
import EvaluationSummary from '@/features/evaluation/ui/EvaluationSummary.vue';
import EvaluationItemCard from '@/features/evaluation/ui/EvaluationItemCard.vue';
import { useEvaluationStore } from '@/features/evaluation';
import type { EvaluationItem } from '@/features/evaluation';

const WEAK_SCORE_THRESHOLD = 80;

const route = useRoute();
const router = useRouter();
const evaluationStore = useEvaluationStore();
const evaluationTrackRef = ref<HTMLElement | null>(null);
const activeCardIndex = ref(0);

const sessionId = computed(() => Number(route.params.sessionId));
const weakEvaluations = computed(() =>
  (evaluationStore.currentEvaluation?.evaluations || []).filter(
    (item: EvaluationItem) => item.totalScore < WEAK_SCORE_THRESHOLD,
  ),
);

onMounted(async () => {
  try {
    await evaluationStore.fetchEvaluation(sessionId.value);
  } catch {
    try {
      await evaluationStore.evaluate(sessionId.value);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      ElMessage.error(err.response?.data?.message || '평가 생성에 실패했습니다.');
      router.back();
    }
  }
});

function scrollEvaluation(direction: number) {
  scrollToEvaluation(activeCardIndex.value + direction);
}

function scrollToEvaluation(index: number) {
  const track = evaluationTrackRef.value;
  if (!track) return;

  const safeIndex = Math.max(0, Math.min(index, weakEvaluations.value.length - 1));
  const slide = track.children.item(safeIndex) as HTMLElement | null;
  if (!slide) return;

  activeCardIndex.value = safeIndex;
  track.scrollTo({
    left: slide.offsetLeft - track.offsetLeft,
    behavior: 'smooth',
  });
}

function handleEvaluationScroll() {
  const track = evaluationTrackRef.value;
  if (!track) return;

  const slideWidth = track.clientWidth;
  if (slideWidth <= 0) return;

  const nextIndex = Math.round(track.scrollLeft / slideWidth);
  activeCardIndex.value = Math.max(
    0,
    Math.min(nextIndex, weakEvaluations.value.length - 1),
  );
}
</script>

<style lang="scss" scoped>
.evaluation-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;

  &__state {
    margin-top: 40px;
  }

  &__content {
    margin-top: 20px;
  }

  &__notice {
    margin-top: 20px;
  }

  &__carousel {
    margin-top: 24px;
  }

  &__carousel-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 12px;

    strong {
      color: #1f2a44;
    }
  }

  &__carousel-actions {
    display: flex;
    gap: 8px;
  }

  &__track {
    display: flex;
    gap: 16px;
    overflow-x: auto;
    scroll-snap-type: x mandatory;
    scroll-behavior: smooth;
    scrollbar-width: none;

    &::-webkit-scrollbar {
      display: none;
    }
  }

  &__slide {
    flex: 0 0 100%;
    scroll-snap-align: start;
  }

  &__dots {
    display: flex;
    justify-content: center;
    gap: 8px;
    margin-top: 14px;

    button {
      width: 8px;
      height: 8px;
      padding: 0;
      border: 0;
      border-radius: 999px;
      background: #cbd5e1;
      cursor: pointer;

      &.is-active {
        width: 22px;
        background: #2563eb;
      }
    }
  }

  &__actions {
    margin-top: 32px;
    text-align: center;
  }
}
</style>
