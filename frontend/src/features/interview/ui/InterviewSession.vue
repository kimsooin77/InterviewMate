<template>
  <div class="interview-session">
    <ProgressBar :progress="progress" />

    <QuestionDisplay
      v-if="currentQuestion"
      :question="currentQuestion"
      style="margin-top: 20px"
    />

    <AnswerInput
      v-if="currentQuestion"
      :question-id="currentQuestion.id"
      :loading="isSubmitting"
      :is-last="progress.current === progress.total"
      @submit="$emit('submit', $event)"
    />
  </div>
</template>

<script setup lang="ts">
import ProgressBar from './ProgressBar.vue';
import QuestionDisplay from './QuestionDisplay.vue';
import AnswerInput from './AnswerInput.vue';
import type { CurrentQuestion, Progress } from '../model/interview.types';

defineProps<{
  currentQuestion: CurrentQuestion | null;
  progress: Progress;
  isSubmitting: boolean;
}>();

defineEmits<{
  submit: [data: { questionId: number; content: string }];
}>();
</script>

<style lang="scss" scoped>
.interview-session {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
</style>
