<template>
  <div class="interview-progress">
    <div class="interview-progress__text">
      <span>질문 {{ progress.current }} / {{ progress.total }}</span>
    </div>
    <el-progress
      :percentage="percentage"
      :stroke-width="12"
      :show-text="false"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { Progress } from '../model/interview.types';

const props = defineProps<{
  progress: Progress;
}>();

const percentage = computed(() => {
  if (props.progress.total === 0) return 0;
  return Math.round(
    ((props.progress.current - 1) / props.progress.total) * 100,
  );
});
</script>

<style lang="scss" scoped>
.interview-progress {
  &__text {
    display: flex;
    justify-content: space-between;
    margin-bottom: 8px;
    font-size: 14px;
    color: #606266;
  }
}
</style>
