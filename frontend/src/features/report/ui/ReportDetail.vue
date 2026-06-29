<template>
  <div class="report-detail">
    <div class="report-detail__header">
      <GradeBadge :grade="report.grade" :score="report.overallScore" />
      <div class="report-detail__meta">
        <el-descriptions :column="descriptionColumns" border size="small">
          <el-descriptions-item label="난이도">{{ difficultyLabel }}</el-descriptions-item>
          <el-descriptions-item label="질문 수">{{ report.metadata.totalQuestions }}개</el-descriptions-item>
          <el-descriptions-item label="소요 시간">{{ formattedDuration }}</el-descriptions-item>
          <el-descriptions-item label="완료일">{{ formatDateTime(report.metadata.completedAt) }}</el-descriptions-item>
        </el-descriptions>
      </div>
    </div>

    <el-card style="margin-top: 24px">
      <template #header><span style="font-weight: 600">종합 평가</span></template>
      <p class="report-detail__summary">{{ report.summary }}</p>
    </el-card>

    <el-card style="margin-top: 16px">
      <template #header><span style="font-weight: 600">카테고리별 점수</span></template>
      <CategoryScoreChart :category-scores="report.categoryScores" />
    </el-card>

    <div style="margin-top: 16px">
      <StrengthWeakness
        :strengths="report.strengths"
        :improvements="report.improvements"
      />
    </div>

    <el-card style="margin-top: 16px">
      <template #header><span style="font-weight: 600">질문별 결과</span></template>
      <el-table :data="report.questionResults" stripe class="report-detail__table">
        <el-table-column prop="content" label="질문" min-width="300" show-overflow-tooltip />
        <el-table-column prop="category" label="카테고리" width="120" align="center" />
        <el-table-column prop="score" label="점수" width="80" align="center" />
        <el-table-column prop="grade" label="등급" width="80" align="center">
          <template #default="{ row }">
            <el-tag :type="gradeTagType(row.grade)" size="small">{{ row.grade }}</el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';
import GradeBadge from './GradeBadge.vue';
import CategoryScoreChart from './CategoryScoreChart.vue';
import StrengthWeakness from './StrengthWeakness.vue';
import { formatDateTime } from '@/shared/utils/date';
import type { Report } from '../model/report.types';

const props = defineProps<{
  report: Report;
}>();

const viewportWidth = ref(typeof window === 'undefined' ? 1024 : window.innerWidth);
const descriptionColumns = computed(() => (viewportWidth.value <= 640 ? 1 : 2));

const difficultyLabel = computed(() => {
  const map: Record<string, string> = {
    easy: '쉬움',
    medium: '보통',
    hard: '어려움',
  };
  return map[props.report.metadata.difficulty] || props.report.metadata.difficulty;
});

const formattedDuration = computed(() => {
  const seconds = props.report.metadata.duration;
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes}분 ${secs}초`;
});

function gradeTagType(grade: string): '' | 'success' | 'warning' | 'danger' | 'info' {
  if (grade === 'A+' || grade === 'A') return 'success';
  if (grade === 'B+' || grade === 'B') return '';
  if (grade === 'C+' || grade === 'C') return 'warning';
  return 'danger';
}

function handleResize() {
  viewportWidth.value = window.innerWidth;
}

onMounted(() => {
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
});
</script>

<style lang="scss" scoped>
.report-detail {
  &__header {
    display: flex;
    align-items: center;
    gap: 24px;
  }

  &__meta {
    flex: 1;
  }

  &__summary {
    margin: 0;
    font-size: 15px;
    line-height: 1.8;
    color: #606266;
  }

  &__table {
    width: 100%;
  }
}

@media (max-width: 640px) {
  .report-detail {
    &__header {
      align-items: stretch;
      flex-direction: column;
      gap: 16px;
    }

    &__meta {
      min-width: 0;
    }

    :deep(.el-card__body) {
      padding: 14px;
    }

    :deep(.el-table__inner-wrapper) {
      overflow-x: auto;
    }
  }
}
</style>
