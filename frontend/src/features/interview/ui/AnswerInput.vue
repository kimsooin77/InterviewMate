<template>
  <div class="answer-input">
    <el-input
      v-model="answer"
      type="textarea"
      :rows="8"
      placeholder="답변을 입력해주세요..."
      :disabled="loading"
    />

    <div class="answer-input__actions">
      <el-button
        size="large"
        :disabled="loading"
        @click="handleUnknown"
      >
        모르겠습니다
      </el-button>

      <el-button
        type="primary"
        size="large"
        :loading="loading"
        :disabled="!answer.trim()"
        @click="handleSubmit"
      >
        {{ isLast ? '답변 제출 및 면접 완료' : '답변 제출' }}
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';

const props = defineProps<{
  questionId: number;
  loading?: boolean;
  isLast?: boolean;
  initialContent?: string;
}>();

const emit = defineEmits<{
  submit: [data: { questionId: number; content: string }];
}>();

const answer = ref(props.initialContent || '');

watch(
  () => [props.questionId, props.initialContent] as const,
  () => {
    answer.value = props.initialContent || '';
  },
);

function handleSubmit() {
  if (!answer.value.trim()) return;

  emit('submit', {
    questionId: props.questionId,
    content: answer.value.trim(),
  });
}

function handleUnknown() {
  emit('submit', {
    questionId: props.questionId,
    content: '모르겠습니다.',
  });
}
</script>

<style lang="scss" scoped>
.answer-input {
  margin-top: 20px;

  &__actions {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    padding-top: 24px;

    .el-button {
      min-width: 150px;
      margin-left: 0;
    }
  }
}

@media (max-width: 640px) {
  .answer-input__actions {
    flex-direction: column;

    .el-button {
      width: 100%;
    }
  }
}
</style>
