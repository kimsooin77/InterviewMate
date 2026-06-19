<template>
  <div class="category-scores">
    <div
      v-for="item in categoryScores"
      :key="item.category"
      class="category-scores__item"
    >
      <div class="category-scores__header">
        <span class="category-scores__name">{{ item.category }}</span>
        <span class="category-scores__meta">
          {{ item.score }}점 ({{ item.questionCount }}문항)
        </span>
      </div>
      <el-progress
        :percentage="item.score"
        :stroke-width="10"
        :color="getColor(item.score)"
        :show-text="false"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { CategoryScore } from '../model/report.types';

defineProps<{
  categoryScores: CategoryScore[];
}>();

function getColor(value: number): string {
  if (value >= 80) return '#67C23A';
  if (value >= 60) return '#E6A23C';
  return '#F56C6C';
}
</script>

<style lang="scss" scoped>
.category-scores {
  display: flex;
  flex-direction: column;
  gap: 14px;

  &__item {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  &__header {
    display: flex;
    justify-content: space-between;
    font-size: 14px;
  }

  &__name {
    font-weight: 500;
    color: #303133;
  }

  &__meta {
    color: #909399;
  }
}
</style>
