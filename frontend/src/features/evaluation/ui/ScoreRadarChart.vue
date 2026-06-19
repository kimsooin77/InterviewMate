<template>
  <div class="score-radar">
    <div v-for="item in scoreItems" :key="item.key" class="score-radar__item">
      <div class="score-radar__header">
        <span class="score-radar__name">{{ item.label }}</span>
        <span class="score-radar__value">{{ item.value }}</span>
      </div>
      <el-progress
        :percentage="item.value"
        :stroke-width="10"
        :color="getColor(item.value)"
        :show-text="false"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { EvaluationScores } from '../model/evaluation.types';

const props = defineProps<{
  scores: EvaluationScores;
}>();

const scoreItems = computed(() => [
  { key: 'accuracy', label: '정확성', value: props.scores.accuracy },
  { key: 'depth', label: '깊이', value: props.scores.depth },
  { key: 'structure', label: '구조', value: props.scores.structure },
  { key: 'communication', label: '전달력', value: props.scores.communication },
]);

function getColor(value: number): string {
  if (value >= 80) return '#67C23A';
  if (value >= 60) return '#E6A23C';
  return '#F56C6C';
}
</script>

<style lang="scss" scoped>
.score-radar {
  display: flex;
  flex-direction: column;
  gap: 12px;

  &__item {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  &__header {
    display: flex;
    justify-content: space-between;
    font-size: 13px;
  }

  &__name {
    color: #606266;
  }

  &__value {
    font-weight: 600;
    color: #303133;
  }
}
</style>
