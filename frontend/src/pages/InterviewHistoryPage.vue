<template>
  <div class="interview-history-page">
    <el-page-header @back="router.back()">
      <template #content>면접 기록</template>
    </el-page-header>

    <section class="interview-history-page__hero">
      <div>
        <span class="interview-history-page__eyebrow">MY INTERVIEWS</span>
        <h2>이전에 진행한 면접을 다시 확인하세요</h2>
        <p>완료된 면접은 평가와 리포트로 이어서 볼 수 있고, 진행 중인 면접도 기록으로 남습니다.</p>
      </div>
      <el-button type="primary" @click="router.push('/resumes/upload')">
        새 면접 준비
      </el-button>
    </section>

    <el-skeleton
      v-if="interviewStore.isLoadingHistory"
      :rows="8"
      animated
      class="interview-history-page__list"
    />

    <el-empty
      v-else-if="interviewStore.history.length === 0"
      class="interview-history-page__empty"
      description="아직 저장된 면접 기록이 없습니다."
    />

    <div v-else class="interview-history-page__list">
      <article
        v-for="item in interviewStore.history"
        :key="item.id"
        class="interview-history-page__card"
      >
        <div class="interview-history-page__card-main">
          <div class="interview-history-page__card-title">
            <h3>{{ item.resumeTitle }}</h3>
            <el-tag :type="statusType(item.status)" effect="light">
              {{ statusLabel(item.status) }}
            </el-tag>
          </div>

          <div class="interview-history-page__meta">
            <span>{{ difficultyLabel(item.difficulty) }}</span>
            <span>{{ item.answeredCount }} / {{ item.totalQuestions }}문항 답변</span>
            <span>{{ formatDateTime(item.startedAt) }}</span>
            <span v-if="item.jobPostingApplied">채용공고 반영</span>
          </div>
        </div>

        <div class="interview-history-page__score">
          <strong>{{ item.overallScore ?? '-' }}</strong>
          <span>평가 점수</span>
        </div>

        <div class="interview-history-page__actions">
          <el-button
            v-if="item.status === 'completed'"
            type="primary"
            plain
            @click="router.push(`/evaluations/${item.id}`)"
          >
            평가 보기
          </el-button>
          <el-button
            v-if="item.status === 'completed'"
            @click="router.push(`/reports/${item.id}`)"
          >
            리포트
          </el-button>
          <el-button
            v-else
            @click="router.push(`/question-sets/${item.questionSetId}`)"
          >
            질문 보기
          </el-button>
        </div>
      </article>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { useInterviewStore } from '@/features/interview';
import { formatDateTime } from '@/shared/utils/date';

const router = useRouter();
const interviewStore = useInterviewStore();

onMounted(async () => {
  try {
    await interviewStore.fetchHistory();
  } catch {
    ElMessage.error('면접 기록을 불러오지 못했습니다.');
  }
});

function statusLabel(status: string) {
  const map: Record<string, string> = {
    completed: '완료',
    in_progress: '진행 중',
  };
  return map[status] || status;
}

function statusType(status: string) {
  return status === 'completed' ? 'success' : 'warning';
}

function difficultyLabel(difficulty: string) {
  const map: Record<string, string> = {
    easy: '쉬움',
    medium: '보통',
    hard: '어려움',
  };
  return map[difficulty] || difficulty;
}
</script>

<style lang="scss" scoped>
.interview-history-page {
  max-width: 960px;
  margin: 0 auto;
  padding: 20px;

  &__hero {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
    margin-top: 20px;
    padding: 28px;
    border: 1px solid #dbeafe;
    border-radius: 12px;
    background: linear-gradient(135deg, #eff6ff 0%, #ffffff 72%);

    h2 {
      margin: 6px 0 8px;
      font-size: 24px;
      color: #172554;
    }

    p {
      margin: 0;
      color: #5b6472;
      line-height: 1.6;
    }
  }

  &__eyebrow {
    font-size: 12px;
    font-weight: 800;
    color: #2563eb;
    letter-spacing: 0.04em;
  }

  &__list {
    display: flex;
    flex-direction: column;
    gap: 14px;
    margin-top: 20px;
  }

  &__empty {
    margin-top: 48px;
  }

  &__card {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 96px auto;
    align-items: center;
    gap: 18px;
    padding: 20px 22px;
    border: 1px solid #e6edf7;
    border-radius: 12px;
    background: #fff;
    box-shadow: 0 10px 28px rgba(15, 23, 42, 0.05);
  }

  &__card-title {
    display: flex;
    align-items: center;
    gap: 10px;

    h3 {
      margin: 0;
      font-size: 18px;
      color: #1f2a44;
    }
  }

  &__meta {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 10px;

    span {
      padding: 5px 10px;
      border-radius: 999px;
      background: #f3f7ff;
      color: #536276;
      font-size: 13px;
    }
  }

  &__score {
    text-align: center;

    strong {
      display: block;
      font-size: 28px;
      color: #2563eb;
    }

    span {
      font-size: 12px;
      color: #8a95a5;
    }
  }

  &__actions {
    display: flex;
    gap: 8px;
  }
}

@media (max-width: 760px) {
  .interview-history-page {
    &__hero,
    &__card {
      display: flex;
      flex-direction: column;
      align-items: stretch;
    }

    &__score {
      text-align: left;
    }

    &__actions {
      flex-wrap: wrap;
    }
  }
}
</style>
