<template>
  <div class="answer-input">
    <el-input
      v-model="answer"
      type="textarea"
      :rows="8"
      placeholder="답변을 입력해주세요..."
      :disabled="loading"
    />
    <el-button
      type="primary"
      size="large"
      style="width: 100%; margin-top: 16px"
      :loading="loading"
      :disabled="!answer.trim()"
      @click="handleSubmit"
    >
      {{ isLast ? '답변 제출 및 면접 완료' : '답변 제출' }}
    </el-button>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';

const props = defineProps<{
  questionId: number;
  loading?: boolean;
  isLast?: boolean;
}>();

const emit = defineEmits<{
  submit: [data: { questionId: number; content: string }];
}>();

const answer = ref('');

watch(
  () => props.questionId,
  () => {
    answer.value = '';
  },
);

function handleSubmit() {
  if (!answer.value.trim()) return;
  emit('submit', {
    questionId: props.questionId,
    content: answer.value.trim(),
  });
}
</script>

<style lang="scss" scoped>
.answer-input {
  margin-top: 20px;
}
</style>
