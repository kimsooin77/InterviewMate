<template>
  <div class="resume-analysis">
    <div class="resume-analysis__status">
      <el-tag :type="statusType" size="large">{{ statusText }}</el-tag>
      <el-button
        v-if="resume.status === 'pending'"
        type="primary"
        :loading="analyzing"
        @click="$emit('analyze')"
      >
        AI 분석 시작
      </el-button>
    </div>

    <template v-if="resume.status === 'completed'">
      <el-divider />

      <h4>기술 스택</h4>
      <SkillTagList :skills="resume.skills" />

      <h4 style="margin-top: 20px">경력</h4>
      <el-timeline v-if="resume.careers.length > 0">
        <el-timeline-item
          v-for="(career, index) in resume.careers"
          :key="index"
          :timestamp="`${career.startDate} ~ ${career.endDate}`"
          placement="top"
        >
          <el-card shadow="never">
            <h4 style="margin: 0">{{ career.position }}</h4>
            <p style="margin: 4px 0 0; color: #909399">{{ career.company }}</p>
            <p style="margin: 8px 0 0; font-size: 14px">{{ career.description }}</p>
          </el-card>
        </el-timeline-item>
      </el-timeline>
      <p v-else class="resume-analysis__empty">추출된 경력이 없습니다</p>

      <h4 style="margin-top: 20px">프로젝트</h4>
      <div v-if="resume.projects.length > 0" class="resume-analysis__projects">
        <el-card
          v-for="(project, index) in resume.projects"
          :key="index"
          shadow="hover"
          class="resume-analysis__project-card"
        >
          <h4 style="margin: 0">{{ project.name }}</h4>
          <p style="margin: 4px 0; color: #909399; font-size: 13px">
            {{ project.role }} | {{ project.startDate }} ~ {{ project.endDate }}
          </p>
          <p style="font-size: 14px">{{ project.description }}</p>
          <SkillTagList v-if="project.skills" :skills="project.skills" />
        </el-card>
      </div>
      <p v-else class="resume-analysis__empty">추출된 프로젝트가 없습니다</p>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import SkillTagList from './SkillTagList.vue';
import type { Resume } from '../model/resume.types';

const props = defineProps<{
  resume: Resume;
  analyzing?: boolean;
}>();

defineEmits<{
  analyze: [];
}>();

const statusType = computed(() => {
  const map: Record<string, string> = {
    pending: 'info',
    analyzing: 'warning',
    completed: 'success',
    failed: 'danger',
  };
  return (map[props.resume.status] || 'info') as 'info' | 'warning' | 'success' | 'danger';
});

const statusText = computed(() => {
  const map: Record<string, string> = {
    pending: '분석 대기',
    analyzing: '분석 중...',
    completed: '분석 완료',
    failed: '분석 실패',
  };
  return map[props.resume.status] || props.resume.status;
});
</script>

<style lang="scss" scoped>
.resume-analysis {
  &__status {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  &__projects {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  &__empty {
    font-size: 14px;
    color: #909399;
  }
}
</style>
