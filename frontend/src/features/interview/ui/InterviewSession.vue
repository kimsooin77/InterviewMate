<template>
  <div class="interview-session">
    <div class="interview-session__timer">
      <div>
        <span>전체 경과</span>
        <strong>{{ formattedElapsedTime }}</strong>
      </div>
      <div>
        <span>현재 질문</span>
        <strong>{{ formattedQuestionTime }}</strong>
      </div>
    </div>

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
          {{ continueLabel }}
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
      @update="$emit('draft', $event)"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
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
  hasFollowUp?: boolean;
  startedAt?: string;
  completedAt?: string | null;
  elapsedSeconds?: number;
}>();

defineEmits<{
  submit: [data: { questionId: number; content: string }];
  draft: [data: { questionId: number; content: string }];
  continue: [];
}>();

const now = ref(Date.now());
const questionStartedAt = ref(Date.now());
let timerId: number | undefined;

const isLastQuestion = computed(() => props.progress.current === props.progress.total);
const continueLabel = computed(() => {
  if (props.hasFollowUp) return '꼬리 질문 보기';
  return isLastQuestion.value ? '면접 완료' : '다음 질문';
});

const elapsedSeconds = computed(() => {
  if (!props.startedAt) return props.elapsedSeconds || 0;

  const endAt = props.completedAt ? new Date(props.completedAt).getTime() : now.value;
  const startedAt = new Date(props.startedAt).getTime();

  return Math.max(0, Math.floor((endAt - startedAt) / 1000));
});

const questionElapsedSeconds = computed(() =>
  Math.max(0, Math.floor((now.value - questionStartedAt.value) / 1000)),
);

const formattedElapsedTime = computed(() => formatSeconds(elapsedSeconds.value));
const formattedQuestionTime = computed(() => formatSeconds(questionElapsedSeconds.value));

watch(
  () => props.currentQuestion?.id,
  () => {
    questionStartedAt.value = Date.now();
  },
);

onMounted(() => {
  timerId = window.setInterval(() => {
    now.value = Date.now();
  }, 1000);
});

onUnmounted(() => {
  if (timerId) {
    window.clearInterval(timerId);
  }
});

function formatSeconds(totalSeconds: number) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const paddedMinutes = String(minutes).padStart(2, '0');
  const paddedSeconds = String(seconds).padStart(2, '0');

  if (hours > 0) {
    return `${hours}:${paddedMinutes}:${paddedSeconds}`;
  }

  return `${paddedMinutes}:${paddedSeconds}`;
}
</script>

<style lang="scss" scoped>
.interview-session {
  display: flex;
  flex-direction: column;
  gap: 4px;

  &__timer {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    margin-bottom: 12px;

    div {
      min-width: 108px;
      padding: 10px 12px;
      border: 1px solid #dbeafe;
      border-radius: 8px;
      background: #f8fbff;
      text-align: right;
    }

    span {
      display: block;
      font-size: 12px;
      color: #64748b;
    }

    strong {
      display: block;
      margin-top: 2px;
      color: #1d4ed8;
      font-size: 18px;
      font-variant-numeric: tabular-nums;
    }
  }

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

@media (max-width: 640px) {
  .interview-session__timer {
    justify-content: stretch;

    div {
      flex: 1;
      text-align: left;
    }
  }
}
</style>
