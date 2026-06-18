<template>
  <div class="question-set-preview">
    <div class="question-set-preview__info">
      <el-descriptions :column="3" border>
        <el-descriptions-item label="난이도">{{ difficultyLabel }}</el-descriptions-item>
        <el-descriptions-item label="질문 수">{{ questionSet.questionCount }}개</el-descriptions-item>
        <el-descriptions-item label="생성일">{{ formatDateTime(questionSet.createdAt) }}</el-descriptions-item>
      </el-descriptions>
    </div>

    <div class="question-set-preview__list">
      <QuestionCard
        v-for="question in questionSet.questions"
        :key="question.id"
        :question="question"
      />
    </div>

    <div class="question-set-preview__actions">
      <slot name="actions" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import QuestionCard from './QuestionCard.vue';
import { formatDateTime } from '@/shared/utils/date';
import type { QuestionSet } from '../model/question.types';

const props = defineProps<{
  questionSet: QuestionSet;
}>();

const difficultyLabel = computed(() => {
  const map: Record<string, string> = {
    easy: '쉬움',
    medium: '보통',
    hard: '어려움',
  };
  return map[props.questionSet.difficulty] || props.questionSet.difficulty;
});
</script>

<style lang="scss" scoped>
.question-set-preview {
  &__info {
    margin-bottom: 20px;
  }

  &__list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  &__actions {
    margin-top: 24px;
    text-align: center;
  }
}
</style>
