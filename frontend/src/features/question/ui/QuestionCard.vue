<template>
  <el-card shadow="hover" class="question-card">
    <div class="question-card__header">
      <div class="question-card__tags">
        <el-tag size="small" :type="categoryType">{{ question.category }}</el-tag>
        <el-tag size="small" effect="plain">{{ difficultyLabel }}</el-tag>
      </div>
      <span class="question-card__order">Q{{ question.order }}</span>
    </div>
    <p class="question-card__content">{{ question.content }}</p>
    <div class="question-card__actions">
      <el-button size="small" plain @click="saveQuestion">보관함 저장</el-button>
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { ElMessage } from 'element-plus';
import { useSavedQuestionStore } from '@/features/saved-question';
import type { Question } from '../model/question.types';

const props = defineProps<{
  question: Question;
}>();

const savedQuestionStore = useSavedQuestionStore();

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

function saveQuestion() {
  savedQuestionStore.addQuestion({
    question: props.question.content,
    category: 'technical',
    tags: [props.question.category, props.question.difficulty].filter(Boolean),
    source: 'generated',
  });

  ElMessage.success('질문을 보관함에 저장했습니다.');
}
</script>

<style lang="scss" scoped>
.question-card {
  &__header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 12px;
  }

  &__tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    min-width: 0;
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

  &__actions {
    display: flex;
    justify-content: flex-end;
    margin-top: 14px;
  }
}

@media (max-width: 640px) {
  .question-card {
    &__header {
      align-items: flex-start;
      flex-direction: column;
    }

    &__order {
      margin-left: 0;
    }

    &__actions {
      .el-button {
        width: 100%;
      }
    }
  }
}
</style>
