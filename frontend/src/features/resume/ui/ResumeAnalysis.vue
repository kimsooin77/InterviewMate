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
          :timestamp="formatCareerPeriod(career)"
          placement="top"
        >
          <el-card shadow="never">
            <h4 style="margin: 0">{{ career.position }}</h4>
            <p style="margin: 4px 0 0; color: #909399">{{ career.company }}</p>
            <p v-if="career.description" style="margin: 8px 0 0; font-size: 14px">
              {{ career.description }}
            </p>
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
          <p
            v-if="formatProjectMeta(project)"
            style="margin: 4px 0; color: #909399; font-size: 13px"
          >
            {{ formatProjectMeta(project) }}
          </p>
          <p v-if="project.description" style="font-size: 14px">
            {{ project.description }}
          </p>
          <SkillTagList
            v-if="getProjectSkills(project).length > 0"
            :skills="getProjectSkills(project)"
          />
          <ul
            v-if="project.responsibilities?.length"
            class="resume-analysis__responsibilities"
          >
            <li v-for="responsibility in project.responsibilities" :key="responsibility">
              {{ responsibility }}
            </li>
          </ul>
        </el-card>
      </div>
      <p v-else class="resume-analysis__empty">추출된 프로젝트가 없습니다</p>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import SkillTagList from './SkillTagList.vue';
import type { Career, Project, Resume } from '../model/resume.types';

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

function formatCareerPeriod(career: Career): string {
  return career.duration || formatPeriod(career.startDate, career.endDate);
}

function formatProjectMeta(project: Project): string {
  return [project.role, project.duration || formatPeriod(project.startDate, project.endDate)]
    .filter(Boolean)
    .join(' | ');
}

function formatPeriod(startDate?: string, endDate?: string): string {
  if (startDate && endDate) {
    return `${startDate} ~ ${endDate}`;
  }

  return startDate || endDate || '';
}

function getProjectSkills(project: Project): string[] {
  if (project.skills?.length) {
    return project.skills;
  }

  return project.environment || [];
}
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

  &__responsibilities {
    margin: 12px 0 0;
    padding-left: 18px;
    color: #606266;
    font-size: 14px;
    line-height: 1.6;
  }
}

@media (max-width: 640px) {
  .resume-analysis {
    &__status {
      align-items: stretch;
      flex-direction: column;

      .el-button {
        width: 100%;
        margin-left: 0;
      }
    }

    :deep(.el-timeline) {
      padding-left: 0;
    }
  }
}
</style>
