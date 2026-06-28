<template>
  <div class="interview-page">
    <el-page-header @back="handleBack">
      <template #content>면접 진행</template>
      <template #extra>
        <el-button
          v-if="!isCompleted && interviewStore.session"
          type="warning"
          plain
          @click="handleExit"
        >
          나중에 이어하기
        </el-button>
      </template>
    </el-page-header>

    <el-alert
      v-if="isResumed && !isCompleted"
      class="interview-page__notice"
      type="success"
      show-icon
      :closable="false"
      title="진행 중이던 면접을 이어서 불러왔습니다."
    />

    <div v-if="isCompleted" class="interview-page__completed">
      <el-result
        icon="success"
        title="면접이 완료되었습니다"
        sub-title="모든 질문에 답변했습니다. 이제 평가를 요청해보세요."
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
      :has-follow-up="interviewStore.pendingHasFollowUp"
      :started-at="interviewStore.session?.startedAt"
      :completed-at="interviewStore.session?.completedAt"
      :elapsed-seconds="interviewStore.session?.elapsedSeconds"
      class="interview-page__session"
      @submit="handleSubmit"
      @draft="interviewStore.saveDraftAnswer"
      @continue="interviewStore.continueAfterFeedback"
    />

    <el-skeleton v-else :rows="10" animated class="interview-page__session" />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import InterviewSession from '@/features/interview/ui/InterviewSession.vue';
import { useInterviewStore } from '@/features/interview';

const route = useRoute();
const router = useRouter();
const interviewStore = useInterviewStore();
const isResumed = ref(false);

const isCompleted = computed(() => interviewStore.isCompleted);

onMounted(async () => {
  try {
    if (route.params.sessionId) {
      await interviewStore.loadSession(Number(route.params.sessionId));
      isResumed.value = true;
      return;
    }

    const questionSetId = Number(route.params.questionSetId);
    const session = await interviewStore.startSession(questionSetId);
    isResumed.value = session.answeredCount > 0;
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string } } };
    ElMessage.error(err.response?.data?.message || '면접 세션을 불러오지 못했습니다.');
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
        '면접을 나가도 진행 상태와 작성 중인 답변은 저장됩니다. 나중에 이력 페이지에서 이어서 진행할 수 있습니다.',
        '나중에 이어하기',
        { confirmButtonText: '나가기', cancelButtonText: '계속 진행', type: 'info' },
      );
      interviewStore.reset();
      router.push('/interviews/history');
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

  &__notice {
    margin-top: 18px;
  }

  &__session {
    margin-top: 20px;
  }

  &__completed {
    margin-top: 40px;
  }
}
</style>
