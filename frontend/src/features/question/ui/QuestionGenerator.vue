<template>
  <el-form label-position="top">
    <el-form-item label="난이도">
      <el-radio-group v-model="form.difficulty">
        <el-radio-button value="easy">쉬움</el-radio-button>
        <el-radio-button value="medium">보통</el-radio-button>
        <el-radio-button value="hard">어려움</el-radio-button>
      </el-radio-group>
    </el-form-item>

    <el-form-item label="질문 개수">
      <el-slider
        v-model="form.count"
        :min="3"
        :max="20"
        :step="1"
        show-input
        :show-input-controls="false"
      />
    </el-form-item>

    <el-form-item label="채용공고">
      <el-input
        v-model="form.jobPosting"
        type="textarea"
        :rows="10"
        maxlength="12000"
        show-word-limit
        placeholder="기업 채용공고의 주요 업무, 자격요건, 우대사항, 기술스택을 붙여넣어 주세요."
      />
    </el-form-item>

    <el-form-item>
      <el-button
        type="primary"
        size="large"
        :loading="loading"
        style="width: 100%"
        @click="handleGenerate"
      >
        질문 생성하기
      </el-button>
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
import { reactive } from 'vue';
import type { GenerateQuestionsRequest } from '../model/question.types';

const props = defineProps<{
  resumeId: number;
  loading?: boolean;
}>();

const emit = defineEmits<{
  generate: [data: GenerateQuestionsRequest];
}>();

const form = reactive({
  difficulty: 'medium',
  count: 10,
  jobPosting: '',
});

function handleGenerate() {
  const jobPosting = form.jobPosting.trim();

  emit('generate', {
    resumeId: props.resumeId,
    difficulty: form.difficulty,
    count: form.count,
    ...(jobPosting ? { jobPosting } : {}),
  });
}
</script>
