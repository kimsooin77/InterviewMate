<template>
  <el-card class="evaluation-summary">
    <div class="evaluation-summary__score">
      <span class="evaluation-summary__number" :style="{ color: scoreColor }">
        {{ overallScore }}
      </span>
      <span class="evaluation-summary__label">종합 점수</span>
    </div>
    <div class="evaluation-summary__meta">
      <el-tag :type="scoreTagType" size="large">
        {{ scoreGrade }}
      </el-tag>
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
  text-align: center;

  &__score {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    margin-bottom: 16px;
  }

  &__number {
    font-size: 64px;
    font-weight: 700;
    line-height: 1;
  }

  &__label {
    font-size: 14px;
    color: #909399;
  }

  &__meta {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
  }

  &__count {
    font-size: 14px;
    color: #606266;
  }
}
</style>
