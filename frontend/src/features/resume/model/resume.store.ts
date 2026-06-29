import { defineStore } from 'pinia';
import { ref } from 'vue';
import { resumeApi } from '../api/resume.api';
import type {
  Resume,
  ResumeSummary,
  UploadResponse,
  AnalyzeResponse,
} from './resume.types';

export const useResumeStore = defineStore('resume', () => {
  const resumes = ref<ResumeSummary[]>([]);
  const currentResume = ref<Resume | null>(null);
  const uploadResult = ref<UploadResponse | null>(null);
  const isLoadingResumes = ref(false);
  const isUploading = ref(false);
  const isAnalyzing = ref(false);

  async function upload(file: File, title?: string): Promise<UploadResponse> {
    isUploading.value = true;
    try {
      const response = await resumeApi.upload(file, title);
      uploadResult.value = response.data;
      return response.data;
    } finally {
      isUploading.value = false;
    }
  }

  async function analyze(resumeId: number): Promise<AnalyzeResponse> {
    isAnalyzing.value = true;
    try {
      const response = await resumeApi.analyze(resumeId);
      return response.data;
    } finally {
      isAnalyzing.value = false;
    }
  }

  async function fetchResumes(): Promise<ResumeSummary[]> {
    isLoadingResumes.value = true;
    try {
      const response = await resumeApi.getAll();
      resumes.value = response.data;
      return response.data;
    } finally {
      isLoadingResumes.value = false;
    }
  }

  async function fetchResume(resumeId: number): Promise<Resume> {
    const response = await resumeApi.getById(resumeId);
    currentResume.value = response.data;
    return response.data;
  }

  async function remove(resumeId: number): Promise<void> {
    await resumeApi.remove(resumeId);
    resumes.value = resumes.value.filter((resume) => resume.id !== resumeId);

    if (currentResume.value?.id === resumeId) {
      currentResume.value = null;
    }
  }

  async function removeMany(resumeIds: number[]): Promise<void> {
    await Promise.all(resumeIds.map((resumeId) => resumeApi.remove(resumeId)));
    const resumeIdSet = new Set(resumeIds);
    resumes.value = resumes.value.filter((resume) => !resumeIdSet.has(resume.id));

    if (currentResume.value && resumeIdSet.has(currentResume.value.id)) {
      currentResume.value = null;
    }
  }

  function reset() {
    currentResume.value = null;
    uploadResult.value = null;
  }

  return {
    resumes,
    currentResume,
    uploadResult,
    isLoadingResumes,
    isUploading,
    isAnalyzing,
    upload,
    analyze,
    fetchResumes,
    fetchResume,
    remove,
    removeMany,
    reset,
  };
});
