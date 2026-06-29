<template>
  <div class="resume-detail">
    <div class="resume-detail__header">
      <h3>{{ resume.title }}</h3>
      <div class="resume-detail__meta">
        <span>{{ resume.fileName }}</span>
        <span>{{ formatFileSize(resume.fileSize) }}</span>
        <span>{{ formatDateTime(resume.createdAt) }}</span>
      </div>
    </div>

    <ResumeAnalysis
      :resume="resume"
      :analyzing="analyzing"
      @analyze="$emit('analyze')"
    />
  </div>
</template>

<script setup lang="ts">
import ResumeAnalysis from './ResumeAnalysis.vue';
import { formatFileSize } from '@/shared/utils/file';
import { formatDateTime } from '@/shared/utils/date';
import type { Resume } from '../model/resume.types';

defineProps<{
  resume: Resume;
  analyzing?: boolean;
}>();

defineEmits<{
  analyze: [];
}>();
</script>

<style lang="scss" scoped>
.resume-detail {
  &__header {
    margin-bottom: 20px;

    h3 {
      margin: 0 0 8px;
    }
  }

  &__meta {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    font-size: 13px;
    color: #909399;
  }
}

@media (max-width: 640px) {
  .resume-detail {
    &__meta {
      flex-direction: column;
      gap: 4px;
    }
  }
}
</style>
