<template>
  <div class="grade-badge" :style="{ backgroundColor: badgeColor }">
    <span class="grade-badge__grade">{{ grade }}</span>
    <span class="grade-badge__score">{{ score }}점</span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  grade: string;
  score: number;
}>();

const badgeColor = computed(() => {
  const g = props.grade;
  if (g === 'A+' || g === 'A') return '#67C23A';
  if (g === 'B+' || g === 'B') return '#409EFF';
  if (g === 'C+' || g === 'C') return '#E6A23C';
  return '#F56C6C';
});
</script>

<style lang="scss" scoped>
.grade-badge {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100px;
  height: 100px;
  border-radius: 50%;
  color: #fff;

  &__grade {
    font-size: 32px;
    font-weight: 700;
    line-height: 1;
  }

  &__score {
    font-size: 14px;
    margin-top: 4px;
  }
}
</style>
