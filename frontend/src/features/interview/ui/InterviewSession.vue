<template>
  <div class="interview-session">
    <ProgressBar :progress="progress" />

    <QuestionDisplay
      v-if="currentQuestion"
      :question="currentQuestion"
      style="margin-top: 20px"
    />

    <el-card
      v-if="answerFeedback"
      class="interview-session__feedback"
      shadow="never"
    >
      <div class="interview-session__feedback-header">
        <el-tag :type="answerFeedback.isCorrect ? 'success' : 'danger'">
          {{ answerFeedback.isCorrect ? '정답 방향' : '보완 필요' }}
        </el-tag>
      </div>
      <p>{{ answerFeedback.explanation }}</p>
      <div class="interview-session__feedback-actions">
        <el-button type="primary" size="large" @click="$emit('continue')">
          {{ isLastQuestion ? '면접 완료' : '다음 문제' }}
        </el-button>
      </div>
    </el-card>

    <AnswerInput
      v-if="currentQuestion"
      v-show="!answerFeedback"
      :question-id="currentQuestion.id"
      :loading="isSubmitting"
      :is-last="isLastQuestion"
      :initial-content="currentAnswer"
      @submit="$emit('submit', $event)"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import ProgressBar from './ProgressBar.vue';
import QuestionDisplay from './QuestionDisplay.vue';
import AnswerInput from './AnswerInput.vue';
import type { AnswerFeedback, CurrentQuestion, Progress } from '../model/interview.types';

const props = defineProps<{
  currentQuestion: CurrentQuestion | null;
  progress: Progress;
  isSubmitting: boolean;
  currentAnswer?: string;
  answerFeedback?: AnswerFeedback | null;
}>();

defineEmits<{
  submit: [data: { questionId: number; content: string }];
  continue: [];
}>();

const isLastQuestion = computed(() => props.progress.current === props.progress.total);
</script>

<style lang="scss" scoped>
.interview-session {
  display: flex;
  flex-direction: column;
  gap: 4px;

  &__feedback {
    margin-top: 20px;

    p {
      margin: 12px 0 0;
      line-height: 1.7;
      color: #303133;
    }
  }

  &__feedback-header {
    display: flex;
    justify-content: flex-start;
  }

  &__feedback-actions {
    display: flex;
    justify-content: flex-end;
    padding-top: 20px;
  }
}
</style>
