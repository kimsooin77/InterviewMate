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

      <div v-if="weakEvaluations.length" class="evaluation-page__items">
        <EvaluationItemCard
          v-for="item in weakEvaluations"
          :key="item.questionId"
          :item="item"
        />
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
import { onMounted, computed } from 'vue';
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

  &__items {
    display: flex;
    flex-direction: column;
    gap: 16px;
    margin-top: 24px;
  }

  &__actions {
    margin-top: 32px;
    text-align: center;
  }
}
</style>
