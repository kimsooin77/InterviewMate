import { defineStore } from 'pinia';
import { ref } from 'vue';
import { reportApi } from '../api/report.api';
import type { Report } from './report.types';

export const useReportStore = defineStore('report', () => {
  const currentReport = ref<Report | null>(null);
  const isLoading = ref(false);

  async function fetchReport(sessionId: number): Promise<Report> {
    isLoading.value = true;
    try {
      const response = await reportApi.getBySessionId(sessionId);
      currentReport.value = response.data;
      return response.data;
    } finally {
      isLoading.value = false;
    }
  }

  function reset() {
    currentReport.value = null;
    isLoading.value = false;
  }

  return {
    currentReport,
    isLoading,
    fetchReport,
    reset,
  };
});
