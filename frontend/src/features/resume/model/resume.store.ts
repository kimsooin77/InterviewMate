import { defineStore } from 'pinia';
import { ref } from 'vue';
import { resumeApi } from '../api/resume.api';
import type { Resume, UploadResponse, AnalyzeResponse } from './resume.types';

export const useResumeStore = defineStore('resume', () => {
  const currentResume = ref<Resume | null>(null);
  const uploadResult = ref<UploadResponse | null>(null);
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

  async function fetchResume(resumeId: number): Promise<Resume> {
    const response = await resumeApi.getById(resumeId);
    currentResume.value = response.data;
    return response.data;
  }

  function reset() {
    currentResume.value = null;
    uploadResult.value = null;
  }

  return {
    currentResume,
    uploadResult,
    isUploading,
    isAnalyzing,
    upload,
    analyze,
    fetchResume,
    reset,
  };
});
