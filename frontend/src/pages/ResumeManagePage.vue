<template>
  <div class="resume-manage-page">
    <section class="resume-manage-page__hero">
      <div>
        <span class="resume-manage-page__eyebrow">RESUME CENTER</span>
        <h1>이력서 관리</h1>
        <p>저장된 이력서를 불러오거나 새 이력서를 추가하고, 채용공고를 함께 첨부해 맞춤 면접 질문을 생성하세요.</p>
      </div>
    </section>

    <section class="resume-manage-page__config">
      <div class="resume-manage-page__config-grid">
        <el-form-item label="난이도">
          <el-radio-group v-model="form.difficulty">
            <el-radio-button value="easy">쉬움</el-radio-button>
            <el-radio-button value="medium">보통</el-radio-button>
            <el-radio-button value="hard">어려움</el-radio-button>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="질문 개수">
          <el-input-number
            v-model="form.count"
            :min="3"
            :max="20"
            :step="1"
            controls-position="right"
          />
        </el-form-item>
      </div>

      <el-form-item label="채용공고">
        <el-input
          v-model="form.jobPosting"
          type="textarea"
          :rows="6"
          maxlength="12000"
          show-word-limit
          placeholder="채용공고의 주요 업무, 자격요건, 우대사항, 기술 스택을 붙여넣어 주세요."
        />
      </el-form-item>
    </section>

    <section class="resume-manage-page__grid">
      <article class="resume-manage-page__panel">
        <div class="resume-manage-page__panel-header">
          <div>
            <span class="resume-manage-page__eyebrow">SAVED</span>
            <h2>저장된 이력서 불러오기</h2>
          </div>
          <div class="resume-manage-page__panel-tools">
            <el-checkbox
              v-if="resumeStore.resumes.length > 0"
              :model-value="isAllChecked"
              :indeterminate="isPartiallyChecked"
              @change="toggleAllChecked"
            >
              전체 선택
            </el-checkbox>
            <el-button text @click="loadResumes">새로고침</el-button>
          </div>
        </div>

        <el-skeleton v-if="resumeStore.isLoadingResumes" :rows="5" animated />

        <el-empty
          v-else-if="resumeStore.resumes.length === 0"
          description="아직 저장된 이력서가 없습니다."
        />

        <div v-else class="resume-manage-page__resume-list">
          <article
            v-for="resume in resumeStore.resumes"
            :key="resume.id"
            class="resume-manage-page__resume-card"
            :class="{ 'is-active': selectedResumeId === resume.id }"
            @click="selectedResumeId = resume.id"
          >
            <el-checkbox
              :model-value="checkedResumeIds.includes(resume.id)"
              class="resume-manage-page__resume-checkbox"
              @change="(checked: boolean) => toggleResumeChecked(resume.id, checked)"
              @click.stop
            />
            <div class="resume-manage-page__resume-main">
              <div>
                <strong>{{ resume.title }}</strong>
                <span>{{ resume.fileName }} · {{ formatFileSize(resume.fileSize) }}</span>
              </div>
              <div class="resume-manage-page__resume-meta">
                <el-tag size="small" :type="statusType(resume.status)" effect="light">
                  {{ statusLabel(resume.status) }}
                </el-tag>
                <span>{{ resume.skillCount }}개 기술 · {{ resume.projectCount }}개 프로젝트</span>
              </div>
            </div>
          </article>
        </div>

        <div class="resume-manage-page__actions">
          <el-button
            type="primary"
            size="large"
            :disabled="!selectedResumeId"
            :loading="isSubmitting"
            @click="generateFromSelectedResume"
          >
            선택한 이력서로 질문 생성
          </el-button>
          <el-button
            size="large"
            :disabled="!selectedResumeId"
            @click="router.push(`/resumes/${selectedResumeId}`)"
          >
            상세 보기
          </el-button>
          <el-button
            type="danger"
            plain
            size="large"
            :disabled="checkedResumeIds.length === 0 || isSubmitting"
            @click="deleteCheckedResumes"
          >
            삭제
          </el-button>
        </div>
      </article>

      <article class="resume-manage-page__panel">
        <div class="resume-manage-page__panel-header">
          <div>
            <span class="resume-manage-page__eyebrow">NEW</span>
            <h2>새 이력서 추가</h2>
          </div>
        </div>

        <ResumeUploader
          :loading="isSubmitting"
          submit-label="업로드 후 질문 생성"
          @upload="uploadAndGenerate"
        />
      </article>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import ResumeUploader from '@/features/resume/ui/ResumeUploader.vue';
import { useResumeStore } from '@/features/resume';
import { useQuestionStore } from '@/features/question';
import type { ResumeSummary } from '@/features/resume';
import { formatFileSize } from '@/shared/utils/file';

const router = useRouter();
const resumeStore = useResumeStore();
const questionStore = useQuestionStore();
const selectedResumeId = ref<number | null>(null);
const checkedResumeIds = ref<number[]>([]);

const form = reactive({
  difficulty: 'medium',
  count: 10,
  jobPosting: '',
});

const isSubmitting = computed(
  () => resumeStore.isUploading || resumeStore.isAnalyzing || questionStore.isGenerating,
);
const isAllChecked = computed(
  () =>
    resumeStore.resumes.length > 0 &&
    checkedResumeIds.value.length === resumeStore.resumes.length,
);
const isPartiallyChecked = computed(
  () =>
    checkedResumeIds.value.length > 0 &&
    checkedResumeIds.value.length < resumeStore.resumes.length,
);

onMounted(loadResumes);

async function loadResumes() {
  try {
    const resumes = await resumeStore.fetchResumes();

    if (!selectedResumeId.value && resumes.length > 0) {
      selectedResumeId.value = resumes[0].id;
    }

    checkedResumeIds.value = checkedResumeIds.value.filter((resumeId) =>
      resumes.some((resume: ResumeSummary) => resume.id === resumeId),
    );
  } catch {
    ElMessage.error('저장된 이력서를 불러오지 못했습니다.');
  }
}

async function generateFromSelectedResume() {
  if (!selectedResumeId.value) return;

  const selectedResume = resumeStore.resumes.find(
    (resume: ResumeSummary) => resume.id === selectedResumeId.value,
  );

  await analyzeIfNeededAndGenerate(selectedResumeId.value, selectedResume?.status);
}

function toggleResumeChecked(resumeId: number, checked: boolean) {
  checkedResumeIds.value = checked
    ? [...new Set([...checkedResumeIds.value, resumeId])]
    : checkedResumeIds.value.filter((checkedId) => checkedId !== resumeId);
}

function toggleAllChecked(checked: boolean) {
  checkedResumeIds.value = checked
    ? resumeStore.resumes.map((resume: ResumeSummary) => resume.id)
    : [];
}

async function deleteCheckedResumes() {
  if (checkedResumeIds.value.length === 0) return;

  const resumeIds = [...checkedResumeIds.value];
  const deleteCount = resumeIds.length;

  try {
    await ElMessageBox.confirm(
      `${deleteCount}개의 이력서를 삭제할까요?`,
      '이력서 삭제',
      {
        confirmButtonText: '삭제',
        cancelButtonText: '취소',
        type: 'warning',
      },
    );

    await resumeStore.removeMany(resumeIds);
    checkedResumeIds.value = [];

    if (selectedResumeId.value && resumeIds.includes(selectedResumeId.value)) {
      selectedResumeId.value = resumeStore.resumes[0]?.id || null;
    }

    ElMessage.success('선택한 이력서를 삭제했습니다.');
  } catch (error: unknown) {
    if (error === 'cancel' || error === 'close') return;
    showError(error, '이력서 삭제에 실패했습니다.');
  }
}

async function uploadAndGenerate(file: File, title?: string) {
  try {
    const uploaded = await resumeStore.upload(file, title);
    selectedResumeId.value = uploaded.id;
    await analyzeIfNeededAndGenerate(uploaded.id, uploaded.status);
  } catch (error: unknown) {
    showError(error, '이력서 업로드에 실패했습니다.');
  }
}

async function analyzeIfNeededAndGenerate(resumeId: number, status?: string) {
  try {
    if (status !== 'completed') {
      await resumeStore.analyze(resumeId);
      await resumeStore.fetchResumes();
    }

    const jobPosting = form.jobPosting.trim();
    const questionSet = await questionStore.generate({
      resumeId,
      difficulty: form.difficulty,
      count: form.count,
      ...(jobPosting ? { jobPosting } : {}),
    });

    ElMessage.success('면접 질문이 생성되었습니다.');
    router.push(`/question-sets/${questionSet.id}`);
  } catch (error: unknown) {
    showError(error, '면접 질문 생성에 실패했습니다.');
  }
}

function showError(error: unknown, fallbackMessage: string) {
  const err = error as { response?: { data?: { message?: string } } };
  ElMessage.error(err.response?.data?.message || fallbackMessage);
}

function statusLabel(status: string) {
  const map: Record<string, string> = {
    pending: '분석 대기',
    analyzing: '분석 중',
    completed: '분석 완료',
    failed: '분석 실패',
  };
  return map[status] || status;
}

function statusType(status: string) {
  const map: Record<string, 'success' | 'warning' | 'danger' | 'info'> = {
    pending: 'info',
    analyzing: 'warning',
    completed: 'success',
    failed: 'danger',
  };
  return map[status] || 'info';
}
</script>

<style lang="scss" scoped>
.resume-manage-page {
  max-width: 1080px;
  margin: 0 auto;
  padding: 20px;

  &__hero,
  &__config,
  &__panel {
    border: 1px solid #e6edf7;
    border-radius: 10px;
    background: #fff;
  }

  &__hero {
    padding: 18px 20px;
    background: linear-gradient(135deg, #ecf5ff 0%, #ffffff 72%);

    h1 {
      margin: 5px 0 4px;
      color: #172554;
      font-size: 23px;
      line-height: 1.25;
    }

    p {
      margin: 0;
      color: #536276;
      font-size: 13px;
      line-height: 1.45;
    }
  }

  &__eyebrow {
    color: #409eff;
    font-size: 11px;
    font-weight: 800;
    letter-spacing: 0.04em;
  }

  &__config {
    margin-top: 12px;
    padding: 16px;

    :deep(.el-form-item) {
      align-items: flex-start;
      margin-bottom: 14px;
    }

    :deep(.el-form-item__label) {
      flex: 0 0 76px;
      justify-content: flex-start;
      width: 76px;
      padding-right: 12px;
      line-height: 32px;
      text-align: left;
    }

    :deep(.el-form-item__content) {
      min-width: 0;
      flex: 1;
    }
  }

  &__config-grid {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 180px;
    gap: 14px;
  }

  &__grid {
    display: grid;
    grid-template-columns: minmax(0, 1.1fr) minmax(320px, 0.9fr);
    gap: 14px;
    margin-top: 14px;
  }

  &__panel {
    padding: 18px;
  }

  &__panel-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 14px;

    h2 {
      margin: 4px 0 0;
      color: #1f2a44;
      font-size: 20px;
    }
  }

  &__panel-tools {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  &__resume-list {
    display: flex;
    max-height: 420px;
    flex-direction: column;
    gap: 10px;
    overflow: auto;
    padding-right: 2px;
  }

  &__resume-card {
    display: flex;
    align-items: center;
    gap: 12px;
    width: 100%;
    border: 1px solid #e6edf7;
    border-radius: 8px;
    background: #fff;
    padding: 14px;
    cursor: pointer;

    &.is-active,
    &:hover,
    &:focus {
      border-color: #409eff;
      background: #f4f9ff;
      outline: none;
    }

    strong {
      display: block;
      color: #1f2a44;
      font-size: 15px;
      line-height: 1.4;
    }

    span {
      display: block;
      margin-top: 4px;
      color: #7a8699;
      font-size: 12px;
    }
  }

  &__resume-checkbox {
    flex: 0 0 auto;
  }

  &__resume-main {
    display: flex;
    align-items: center;
    justify-content: space-between;
    min-width: 0;
    width: 100%;
    gap: 14px;
  }

  &__resume-meta {
    display: flex;
    flex: 0 0 auto;
    flex-direction: column;
    align-items: flex-end;
    justify-content: center;
  }

  &__actions {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    margin-top: 14px;

    .el-button {
      min-height: 40px;
    }
  }
}

@media (max-width: 760px) {
  .resume-manage-page {
    padding: 8px 0;

    &__hero {
      padding: 12px 14px;

      h1 {
        font-size: 20px;
      }
    }

    &__config,
    &__panel {
      padding: 14px;
      border-radius: 8px;
    }

    &__config-grid,
    &__grid {
      grid-template-columns: 1fr;
    }

    &__resume-main,
    &__actions {
      flex-direction: column;
      align-items: stretch;
    }

    &__resume-meta {
      align-items: flex-start;
    }

    &__actions .el-button {
      width: 100%;
      margin-left: 0;
    }
  }
}
</style>
