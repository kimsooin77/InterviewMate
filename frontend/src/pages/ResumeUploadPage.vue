<template>
  <div class="resume-upload-page">
    <el-page-header @back="router.back()">
      <template #content>이력서 업로드</template>
    </el-page-header>

    <el-card style="margin-top: 20px">
      <ResumeUploader :loading="resumeStore.isUploading" @upload="handleUpload" />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import ResumeUploader from '@/features/resume/ui/ResumeUploader.vue';
import { useResumeStore } from '@/features/resume';

const router = useRouter();
const resumeStore = useResumeStore();

async function handleUpload(file: File, title?: string) {
  try {
    const result = await resumeStore.upload(file, title);
    ElMessage.success('이력서가 업로드되었습니다.');
    router.push(`/resumes/${result.id}`);
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string } } };
    ElMessage.error(err.response?.data?.message || '업로드에 실패했습니다.');
  }
}
</script>

<style lang="scss" scoped>
.resume-upload-page {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
}
</style>
