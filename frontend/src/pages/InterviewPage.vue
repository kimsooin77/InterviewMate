<template>
  <div class="interview-page">
    <el-page-header @back="handleBack">
      <template #content>면접 진행</template>
      <template #extra>
        <el-button
          v-if="!isCompleted && interviewStore.session"
          type="danger"
          plain
          @click="handleExit"
        >
          면접 종료
        </el-button>
      </template>
    </el-page-header>

    <div v-if="isCompleted" class="interview-page__completed">
      <el-result
        icon="success"
        title="면접이 완료되었습니다"
        sub-title="모든 질문에 답변하셨습니다. 평가를 요청해보세요."
      >
        <template #extra>
          <el-button
            type="primary"
            size="large"
            @click="router.push(`/evaluations/${interviewStore.session?.id}`)"
          >
            평가 요청하기
          </el-button>
        </template>
      </el-result>
    </div>

    <InterviewSession
      v-else-if="interviewStore.currentQuestion"
      :current-question="interviewStore.currentQuestion"
      :progress="interviewStore.progress"
      :is-submitting="interviewStore.isSubmitting"
      :current-answer="interviewStore.currentAnswer"
      :answer-feedback="interviewStore.latestFeedback"
      class="interview-page__session"
      @submit="handleSubmit"
      @continue="interviewStore.continueAfterFeedback"
    />

    <el-skeleton v-else :rows="10" animated class="interview-page__session" />
  </div>
</template>

<script setup lang="ts">
import { onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import InterviewSession from '@/features/interview/ui/InterviewSession.vue';
import { useInterviewStore } from '@/features/interview';

const route = useRoute();
const router = useRouter();
const interviewStore = useInterviewStore();

const isCompleted = computed(() => interviewStore.isCompleted);

onMounted(async () => {
  const questionSetId = Number(route.params.questionSetId);

  try {
    await interviewStore.startSession(questionSetId);
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string } } };
    ElMessage.error(err.response?.data?.message || '면접 세션을 시작할 수 없습니다.');
    router.back();
  }
});

async function handleSubmit(data: { questionId: number; content: string }) {
  try {
    await interviewStore.submitAnswer(data);
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string } } };
    ElMessage.error(err.response?.data?.message || '답변 제출에 실패했습니다.');
  }
}

async function handleBack() {
  if (!isCompleted.value && interviewStore.canGoPrevious) {
    interviewStore.goToPreviousQuestion();
    return;
  }

  await handleExit();
}

async function handleExit() {
  if (!isCompleted.value && interviewStore.session) {
    try {
      await ElMessageBox.confirm(
        '면접을 종료하시겠습니까? 진행 상황은 저장되지 않습니다.',
        '면접 종료',
        { confirmButtonText: '종료', cancelButtonText: '취소', type: 'warning' },
      );
      interviewStore.reset();
      router.back();
    } catch {
      // cancelled
    }
  } else {
    router.back();
  }
}
</script>

<style lang="scss" scoped>
.interview-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;

  &__session {
    margin-top: 20px;
  }

  &__completed {
    margin-top: 40px;
  }
}
</style>
