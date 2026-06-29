<template>
  <div class="question-set-preview">
    <div class="question-set-preview__info">
      <el-descriptions :column="3" class="question-set-preview__summary">
        <el-descriptions-item label="난이도">{{ difficultyLabel }}</el-descriptions-item>
        <el-descriptions-item label="질문 수">{{ questionSet.questionCount }}개</el-descriptions-item>
        <el-descriptions-item label="생성일">{{ formatDateTime(questionSet.createdAt) }}</el-descriptions-item>
      </el-descriptions>
    </div>

    <section
      class="question-set-preview__job-posting"
      :class="{ 'question-set-preview__job-posting--empty': !questionSet.jobPosting }"
    >
      <div class="question-set-preview__job-posting-header">
        <span>채용공고 반영</span>
        <el-tag size="small" :type="questionSet.jobPosting ? 'primary' : 'info'" effect="light">
          {{ questionSet.jobPosting ? '맞춤 질문' : '이력서 기반' }}
        </el-tag>
      </div>
      <p>
        {{
          questionSet.jobPosting ||
          '이번 질문 세트는 채용공고 없이 이력서 분석 결과만 기반으로 생성되었습니다.'
        }}
      </p>
    </section>

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

  &__summary {
    padding: 14px 18px;
    border: 1px solid #e6edf7;
    border-radius: 12px;
    background: #fff;
  }

  &__list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  &__job-posting {
    position: relative;
    margin-bottom: 20px;
    padding: 20px 24px;
    border: 1px solid #dbeafe;
    border-radius: 12px;
    background:
      linear-gradient(135deg, rgba(37, 99, 235, 0.08), rgba(255, 255, 255, 0) 45%),
      #ffffff;
    box-shadow: 0 12px 32px rgba(37, 99, 235, 0.08);

    &--empty {
      border-color: #e5e7eb;
      background: #fafafa;
      box-shadow: none;
    }

    &-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      margin-bottom: 10px;

      span {
        font-size: 15px;
        font-weight: 800;
        color: #1e3a8a;
      }
    }

    p {
      margin: 0;
      white-space: pre-wrap;
      line-height: 1.6;
      color: #445166;
    }
  }

  &__actions {
    margin-top: 24px;
    text-align: center;
  }
}

@media (max-width: 640px) {
  .question-set-preview {
    &__summary {
      padding: 12px;
    }

    &__job-posting {
      padding: 16px;

      &-header {
        align-items: flex-start;
        flex-direction: column;
        gap: 8px;
      }
    }

    &__actions {
      :deep(.el-button) {
        width: 100%;
        margin-left: 0;
      }
    }
  }
}
</style>
