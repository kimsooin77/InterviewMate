<template>
  <el-card class="question-display">
    <div class="question-display__header">
      <el-tag size="small" :type="categoryType">{{ question.category }}</el-tag>
      <el-tag v-if="question.isFollowUp" size="small" type="warning" effect="dark">
        꼬리 질문
      </el-tag>
      <el-tag size="small" effect="plain">{{ difficultyLabel }}</el-tag>
      <span class="question-display__order">
        {{ question.isFollowUp ? 'Follow-up' : `Q${question.order}` }}
      </span>
    </div>
    <p class="question-display__content">{{ question.content }}</p>
  </el-card>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { CurrentQuestion } from '../model/interview.types';

const props = defineProps<{
  question: CurrentQuestion;
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
.question-display {
  &__header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 16px;
  }

  &__order {
    margin-left: auto;
    font-size: 14px;
    font-weight: 600;
    color: #909399;
  }

  &__content {
    margin: 0;
    font-size: 18px;
    line-height: 1.8;
    font-weight: 500;
  }
}
</style>
