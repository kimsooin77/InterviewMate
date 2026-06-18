<template>
  <el-card shadow="hover" class="question-card">
    <div class="question-card__header">
      <el-tag size="small" :type="categoryType">{{ question.category }}</el-tag>
      <el-tag size="small" effect="plain">{{ difficultyLabel }}</el-tag>
      <span class="question-card__order">Q{{ question.order }}</span>
    </div>
    <p class="question-card__content">{{ question.content }}</p>
  </el-card>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { Question } from '../model/question.types';

const props = defineProps<{
  question: Question;
}>();

const categoryType = computed(() => {
  const map: Record<string, string> = {
    framework: '',
    language: 'success',
    performance: 'warning',
    architecture: 'danger',
    css: 'info',
    testing: 'info',
  };
  return (map[props.question.category] || '') as '' | 'success' | 'warning' | 'danger' | 'info';
});

const difficultyLabel = computed(() => {
  const map: Record<string, string> = {
    easy: '쉬움',
    medium: '보통',
    hard: '어려움',
  };
  return map[props.question.difficulty] || props.question.difficulty;
});
</script>

<style lang="scss" scoped>
.question-card {
  &__header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 12px;
  }

  &__order {
    margin-left: auto;
    font-size: 13px;
    font-weight: 600;
    color: #909399;
  }

  &__content {
    margin: 0;
    font-size: 15px;
    line-height: 1.6;
  }
}
</style>
