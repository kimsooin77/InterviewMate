<template>
  <div class="question-setup-page">
    <el-page-header @back="router.back()">
      <template #content>면접 질문 생성</template>
    </el-page-header>

    <el-card style="margin-top: 20px">
      <QuestionGenerator
        :resume-id="resumeId"
        :loading="questionStore.isGenerating"
        @generate="handleGenerate"
      />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import QuestionGenerator from '@/features/question/ui/QuestionGenerator.vue';
import { useQuestionStore } from '@/features/question';
import type { GenerateQuestionsRequest } from '@/features/question';

const route = useRoute();
const router = useRouter();
const questionStore = useQuestionStore();

const resumeId = computed(() => Number(route.params.resumeId));

async function handleGenerate(data: GenerateQuestionsRequest) {
  try {
    const result = await questionStore.generate(data);
    ElMessage.success('질문이 생성되었습니다.');
    router.push(`/question-sets/${result.id}`);
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string } } };
    ElMessage.error(err.response?.data?.message || '질문 생성에 실패했습니다.');
  }
}
</script>

<style lang="scss" scoped>
.question-setup-page {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
}

@media (max-width: 640px) {
  .question-setup-page {
    padding: 12px 0;
  }
}
</style>
