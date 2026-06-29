<template>
  <div class="question-preview-page">
    <el-page-header @back="router.back()">
      <template #content>질문 미리보기</template>
    </el-page-header>

    <div v-if="questionStore.currentQuestionSet" style="margin-top: 20px">
      <QuestionSetPreview :question-set="questionStore.currentQuestionSet">
        <template #actions>
          <el-button
            type="primary"
            size="large"
            @click="router.push(`/interviews/start/${questionStore.currentQuestionSet!.id}`)"
          >
            면접 시작하기
          </el-button>
        </template>
      </QuestionSetPreview>
    </div>

    <el-skeleton v-else :rows="10" animated style="margin-top: 20px" />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import QuestionSetPreview from '@/features/question/ui/QuestionSetPreview.vue';
import { useQuestionStore } from '@/features/question';

const route = useRoute();
const router = useRouter();
const questionStore = useQuestionStore();

onMounted(async () => {
  const id = Number(route.params.id);
  try {
    await questionStore.fetchQuestionSet(id);
  } catch {
    ElMessage.error('질문 세트를 불러올 수 없습니다.');
    router.back();
  }
});
</script>

<style lang="scss" scoped>
.question-preview-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

@media (max-width: 640px) {
  .question-preview-page {
    padding: 12px 0;
  }
}
</style>
