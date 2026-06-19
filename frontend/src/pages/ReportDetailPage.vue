<template>
  <div class="report-page">
    <el-page-header @back="router.back()">
      <template #content>면접 리포트</template>
    </el-page-header>

    <div v-if="reportStore.currentReport" style="margin-top: 20px">
      <ReportDetail :report="reportStore.currentReport" />
    </div>

    <el-skeleton v-else :rows="10" animated style="margin-top: 20px" />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import ReportDetail from '@/features/report/ui/ReportDetail.vue';
import { useReportStore } from '@/features/report';

const route = useRoute();
const router = useRouter();
const reportStore = useReportStore();

onMounted(async () => {
  const sessionId = Number(route.params.sessionId);
  try {
    await reportStore.fetchReport(sessionId);
  } catch {
    ElMessage.error('리포트를 불러올 수 없습니다.');
    router.back();
  }
});
</script>

<style lang="scss" scoped>
.report-page {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
}
</style>
