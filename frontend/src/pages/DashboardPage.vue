<template>
  <div class="dashboard-page">
    <section class="dashboard-page__hero">
      <div>
        <span class="dashboard-page__eyebrow">DASHBOARD</span>
        <h1>{{ userName }}님, 면접 준비를 이어가볼까요?</h1>
        <p>이력서를 업로드하고 질문을 생성한 뒤, 진행 중인 면접과 최근 결과를 한 곳에서 확인하세요.</p>
      </div>
      <div class="dashboard-page__hero-actions">
        <el-button type="primary" size="large" @click="router.push('/resumes')">
          이력서 업로드
        </el-button>
        <el-button size="large" @click="router.push('/interviews/history')">
          면접 기록
        </el-button>
      </div>
    </section>

    <el-skeleton v-if="interviewStore.isLoadingHistory" :rows="9" animated />

    <template v-else>
      <section class="dashboard-page__stats" aria-label="면접 요약">
        <article class="dashboard-page__stat">
          <span>전체 면접</span>
          <strong>{{ totalInterviews }}</strong>
        </article>
        <article class="dashboard-page__stat">
          <span>진행 중</span>
          <strong>{{ inProgressInterviews }}</strong>
        </article>
        <article class="dashboard-page__stat">
          <span>완료</span>
          <strong>{{ completedInterviews }}</strong>
        </article>
        <article class="dashboard-page__stat">
          <span>평균 점수</span>
          <strong>{{ averageScore }}</strong>
        </article>
      </section>

      <section v-if="activeInterview" class="dashboard-page__continue">
        <div>
          <span class="dashboard-page__section-label">진행 중인 면접</span>
          <h2>{{ activeInterview.resumeTitle }}</h2>
          <p>
            {{ activeInterview.answeredCount }} / {{ activeInterview.totalQuestions }}문항 답변 완료
          </p>
        </div>
        <el-button
          type="primary"
          @click="router.push(`/interviews/session/${activeInterview.id}`)"
        >
          이어하기
        </el-button>
      </section>

      <section class="dashboard-page__grid">
        <article class="dashboard-page__panel">
          <div class="dashboard-page__panel-header">
            <div>
              <span class="dashboard-page__section-label">최근 면접</span>
              <h2>최근 진행 기록</h2>
            </div>
            <el-button text @click="router.push('/interviews/history')">전체 보기</el-button>
          </div>

          <el-empty
            v-if="recentInterviews.length === 0"
            description="아직 저장된 면접 기록이 없습니다."
          />

          <div v-else class="dashboard-page__recent-list">
            <button
              v-for="item in recentInterviews"
              :key="item.id"
              type="button"
              class="dashboard-page__recent-item"
              @click="openInterview(item)"
            >
              <div>
                <strong>{{ item.resumeTitle }}</strong>
                <span>{{ formatDateTime(item.startedAt) }}</span>
              </div>
              <div class="dashboard-page__recent-meta">
                <el-tag :type="item.status === 'completed' ? 'success' : 'warning'" effect="light">
                  {{ item.status === 'completed' ? '완료' : '진행 중' }}
                </el-tag>
                <span>{{ item.overallScore ?? '-' }}점</span>
              </div>
            </button>
          </div>
        </article>

        <article class="dashboard-page__panel dashboard-page__steps">
          <span class="dashboard-page__section-label">준비 흐름</span>
          <h2>추천 진행 순서</h2>
          <ol>
            <li>
              <strong>이력서 업로드</strong>
              <span>PDF 이력서를 등록하고 AI 분석을 시작합니다.</span>
            </li>
            <li>
              <strong>질문 생성</strong>
              <span>분석된 경력과 기술 스택 기반 질문을 만듭니다.</span>
            </li>
            <li>
              <strong>모의 면접</strong>
              <span>답변과 피드백을 반복하며 실전 감각을 점검합니다.</span>
            </li>
          </ol>
        </article>
      </section>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { useAuthStore } from '@/features/auth';
import { useInterviewStore } from '@/features/interview';
import type { InterviewHistoryItem } from '@/features/interview';
import { formatDateTime } from '@/shared/utils/date';

const router = useRouter();
const authStore = useAuthStore();
const interviewStore = useInterviewStore();

const userName = computed(() => authStore.user?.name || '사용자');
const historyItems = computed<InterviewHistoryItem[]>(() => interviewStore.history);
const totalInterviews = computed(() => historyItems.value.length);
const completedInterviews = computed(
  () => historyItems.value.filter((item: InterviewHistoryItem) => item.status === 'completed').length,
);
const inProgressInterviews = computed(
  () => historyItems.value.filter((item: InterviewHistoryItem) => item.status !== 'completed').length,
);
const scoredInterviews = computed(() =>
  historyItems.value.filter(
    (item): item is InterviewHistoryItem & { overallScore: number } =>
      typeof item.overallScore === 'number',
  ),
);
const averageScore = computed(() => {
  if (scoredInterviews.value.length === 0) return '-';

  const total = scoredInterviews.value.reduce(
    (sum: number, item: InterviewHistoryItem & { overallScore: number }) =>
      sum + item.overallScore,
    0,
  );
  return Math.round(total / scoredInterviews.value.length);
});
const activeInterview = computed(() =>
  historyItems.value.find((item: InterviewHistoryItem) => item.status !== 'completed') || null,
);
const recentInterviews = computed(() => historyItems.value.slice(0, 4));

onMounted(async () => {
  try {
    await interviewStore.fetchHistory();
  } catch {
    ElMessage.error('대시보드 데이터를 불러오지 못했습니다.');
  }
});

function openInterview(item: InterviewHistoryItem) {
  if (item.status === 'completed') {
    router.push(`/evaluations/${item.id}`);
    return;
  }

  router.push(`/interviews/session/${item.id}`);
}
</script>

<style lang="scss" scoped>
.dashboard-page {
  max-width: 1080px;
  margin: 0 auto;
  padding: 20px;

  &__hero {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    padding: 18px 20px;
    border: 1px solid #d9ecff;
    border-radius: 10px;
    background: linear-gradient(135deg, #ecf5ff 0%, #ffffff 72%);

    h1 {
      margin: 5px 0 4px;
      color: #172554;
      font-size: 23px;
      line-height: 1.25;
    }

    p {
      max-width: 620px;
      margin: 0;
      color: #536276;
      font-size: 13px;
      line-height: 1.45;
    }
  }

  &__hero-actions {
    display: flex;
    flex: 0 0 auto;
    gap: 10px;
  }

  &__eyebrow,
  &__section-label {
    color: #409eff;
    font-size: 11px;
    font-weight: 800;
    letter-spacing: 0.04em;
  }

  &__stats {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 8px;
    margin-top: 10px;
  }

  &__stat,
  &__panel,
  &__continue {
    border: 1px solid #e6edf7;
    border-radius: 10px;
    background: #fff;
    box-shadow: 0 10px 26px rgba(15, 23, 42, 0.04);
  }

  &__stat {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    padding: 10px 12px;

    span {
      color: #7a8699;
      font-size: 12px;
      font-weight: 700;
      white-space: nowrap;
    }

    strong {
      display: block;
      color: #1f2a44;
      font-size: 20px;
      line-height: 1;
    }
  }

  &__continue {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    margin-top: 12px;
    padding: 16px;

    h2 {
      margin: 6px 0;
      color: #1f2a44;
      font-size: 20px;
    }

    p {
      margin: 0;
      color: #6b7280;
    }
  }

  &__grid {
    display: grid;
    grid-template-columns: minmax(0, 1.4fr) minmax(280px, 0.8fr);
    gap: 14px;
    margin-top: 14px;
  }

  &__panel {
    padding: 20px;

    h2 {
      margin: 6px 0 0;
      color: #1f2a44;
      font-size: 20px;
    }
  }

  &__panel-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }

  &__recent-list {
    display: flex;
    flex-direction: column;
    margin-top: 16px;
    border-top: 1px solid #eef2f7;
  }

  &__recent-item {
    appearance: none;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    border: 0;
    border-bottom: 1px solid #eef2f7;
    background: transparent;
    padding: 14px 0;
    text-align: left;
    cursor: pointer;

    strong {
      display: block;
      color: #1f2a44;
      font-size: 15px;
    }

    span {
      color: #8a95a5;
      font-size: 13px;
    }

    &:hover strong,
    &:focus strong {
      color: #409eff;
    }

    &:focus {
      outline: none;
    }
  }

  &__recent-meta {
    display: flex;
    flex: 0 0 auto;
    align-items: center;
    gap: 10px;
  }

  &__steps {
    ol {
      display: flex;
      flex-direction: column;
      gap: 14px;
      margin: 18px 0 0;
      padding: 0;
      list-style: none;
    }

    li {
      padding-left: 14px;
      border-left: 3px solid #d9ecff;
    }

    strong {
      display: block;
      color: #1f2a44;
      font-size: 15px;
    }

    span {
      display: block;
      margin-top: 4px;
      color: #6b7280;
      font-size: 13px;
      line-height: 1.5;
    }
  }
}

@media (max-width: 760px) {
  .dashboard-page {
    padding: 8px 0;

    &__hero,
    &__continue,
    &__panel {
      border-radius: 8px;
    }

    &__hero,
    &__continue {
      align-items: stretch;
      flex-direction: column;
    }

    &__hero {
      gap: 12px;
      padding: 12px 14px;

      h1 {
        font-size: 20px;
      }

      p {
        font-size: 12px;
        line-height: 1.4;
      }
    }

    &__hero-actions {
      flex-direction: column;

      .el-button {
        min-height: 34px;
      }
    }

    &__grid {
      grid-template-columns: 1fr;
    }

    &__stats {
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 6px;
      margin-top: 8px;
    }

    &__stat {
      padding: 8px 10px;

      span {
        font-size: 11px;
      }

      strong {
        font-size: 18px;
      }
    }

    &__recent-item,
    &__recent-meta {
      align-items: flex-start;
      flex-direction: column;
    }
  }
}
</style>
