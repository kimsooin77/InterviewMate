<template>
  <el-card class="evaluation-summary">
    <div class="evaluation-summary__main">
      <span class="evaluation-summary__number" :style="{ color: scoreColor }">
        {{ overallScore }}
      </span>
      <div class="evaluation-summary__text">
        <span class="evaluation-summary__label">종합 점수</span>
        <strong>{{ scoreGrade }}</strong>
      </div>
    </div>
    <div class="evaluation-summary__meta">
      <el-tag :type="scoreTagType" size="small">{{ scoreGrade }}</el-tag>
      <span class="evaluation-summary__count">
        보완 필요 문항 {{ questionCount }}개
      </span>
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  overallScore: number;
  questionCount: number;
}>();

const scoreColor = computed(() => {
  if (props.overallScore >= 80) return '#67C23A';
  if (props.overallScore >= 60) return '#E6A23C';
  return '#F56C6C';
});

const scoreTagType = computed(() => {
  if (props.overallScore >= 80) return 'success';
  if (props.overallScore >= 60) return 'warning';
  return 'danger';
});

const scoreGrade = computed(() => {
  const s = props.overallScore;
  if (s >= 90) return 'A+';
  if (s >= 85) return 'A';
  if (s >= 80) return 'B+';
  if (s >= 75) return 'B';
  if (s >= 70) return 'C+';
  if (s >= 65) return 'C';
  if (s >= 60) return 'D';
  return 'F';
});
</script>

<style lang="scss" scoped>
.evaluation-summary {
  :deep(.el-card__body) {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    padding: 14px 18px;
  }

  &__main {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  &__number {
    font-size: 34px;
    font-weight: 700;
    line-height: 1;
  }

  &__text {
    display: flex;
    flex-direction: column;
    gap: 2px;

    strong {
      font-size: 15px;
      color: #303133;
    }
  }

  &__label {
    font-size: 14px;
    color: #909399;
  }

  &__meta {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 10px;
  }

  &__count {
    font-size: 14px;
    color: #606266;
  }
}

@media (max-width: 560px) {
  .evaluation-summary {
    :deep(.el-card__body) {
      align-items: flex-start;
      flex-direction: column;
    }
  }
}
</style>
