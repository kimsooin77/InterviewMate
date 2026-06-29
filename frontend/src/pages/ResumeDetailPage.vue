<template>
  <div class="resume-detail-page">
    <el-page-header @back="router.back()">
      <template #content>이력서 상세</template>
    </el-page-header>

    <el-card v-if="resumeStore.currentResume" style="margin-top: 20px">
      <ResumeDetail
        :resume="resumeStore.currentResume"
        :analyzing="resumeStore.isAnalyzing"
        @analyze="handleAnalyze"
      />

      <el-divider v-if="resumeStore.currentResume.status === 'completed'" />

      <div v-if="resumeStore.currentResume.status === 'completed'" style="text-align: center">
        <el-button
          type="primary"
          size="large"
          @click="router.push(`/questions/setup/${resumeStore.currentResume.id}`)"
        >
          면접 질문 생성하기
        </el-button>
      </div>
    </el-card>

    <el-skeleton v-else :rows="10" animated style="margin-top: 20px" />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import ResumeDetail from '@/features/resume/ui/ResumeDetail.vue';
import { useResumeStore } from '@/features/resume';

const route = useRoute();
const router = useRouter();
const resumeStore = useResumeStore();

onMounted(async () => {
  const id = Number(route.params.id);
  try {
    await resumeStore.fetchResume(id);
  } catch {
    ElMessage.error('이력서를 불러올 수 없습니다.');
    router.push('/resumes');
  }
});

async function handleAnalyze() {
  if (!resumeStore.currentResume) return;
  try {
    await resumeStore.analyze(resumeStore.currentResume.id);
    await resumeStore.fetchResume(resumeStore.currentResume.id);
    ElMessage.success('이력서 분석이 완료되었습니다.');
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string } } };
    ElMessage.error(err.response?.data?.message || '분석에 실패했습니다.');
    await resumeStore.fetchResume(resumeStore.currentResume!.id);
  }
}
</script>

<style lang="scss" scoped>
.resume-detail-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

@media (max-width: 640px) {
  .resume-detail-page {
    padding: 12px 0;
  }
}
</style>
