<template>
  <el-upload
    ref="uploadRef"
    class="resume-uploader"
    drag
    :auto-upload="false"
    :limit="1"
    accept=".pdf"
    :on-change="handleFileChange"
    :on-exceed="handleExceed"
  >
    <div class="resume-uploader__content">
      <el-icon class="resume-uploader__icon" :size="48">
        <UploadFilled />
      </el-icon>
      <div class="resume-uploader__text">
        PDF 이력서를 드래그하거나 클릭하여 업로드하세요
      </div>
      <div class="resume-uploader__hint">
        PDF 파일만 가능, 최대 10MB
      </div>
    </div>
  </el-upload>

  <div v-if="selectedFile" class="resume-uploader__selected">
    <el-input
      v-model="title"
      placeholder="이력서 제목 (선택사항)"
      style="margin-bottom: 12px"
    />
    <div class="resume-uploader__file-info">
      <span>{{ selectedFile.name }}</span>
      <span class="resume-uploader__file-size">{{ formatFileSize(selectedFile.size) }}</span>
    </div>
    <el-button
      type="primary"
      :loading="loading"
      style="width: 100%; margin-top: 12px"
      @click="handleUpload"
    >
      업로드
    </el-button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { UploadFilled } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import type { UploadFile, UploadInstance } from 'element-plus';
import { formatFileSize, isValidPdf, isWithinSizeLimit } from '@/shared/utils/file';
import { MAX_FILE_SIZE } from '@/shared/constants';

const emit = defineEmits<{
  upload: [file: File, title?: string];
}>();

defineProps<{
  loading?: boolean;
}>();

const uploadRef = ref<UploadInstance>();
const selectedFile = ref<File | null>(null);
const title = ref('');

function handleFileChange(uploadFile: UploadFile) {
  const file = uploadFile.raw;
  if (!file) return;

  if (!isValidPdf(file)) {
    ElMessage.error('PDF 파일만 업로드할 수 있습니다.');
    uploadRef.value?.clearFiles();
    return;
  }

  if (!isWithinSizeLimit(file, MAX_FILE_SIZE / (1024 * 1024))) {
    ElMessage.error('파일 크기가 10MB를 초과합니다.');
    uploadRef.value?.clearFiles();
    return;
  }

  selectedFile.value = file;
}

function handleExceed() {
  ElMessage.warning('파일은 1개만 업로드할 수 있습니다.');
}

function handleUpload() {
  if (!selectedFile.value) return;
  emit('upload', selectedFile.value, title.value || undefined);
}
</script>

<style lang="scss" scoped>
.resume-uploader {
  &__content {
    padding: 20px 0;
  }

  &__icon {
    color: #909399;
  }

  &__text {
    margin-top: 8px;
    font-size: 14px;
    color: #606266;
  }

  &__hint {
    margin-top: 4px;
    font-size: 12px;
    color: #909399;
  }

  &__selected {
    margin-top: 16px;
  }

  &__file-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 12px;
    background: #f5f7fa;
    border-radius: 4px;
    font-size: 14px;
  }

  &__file-size {
    color: #909399;
    font-size: 12px;
  }
}
</style>
