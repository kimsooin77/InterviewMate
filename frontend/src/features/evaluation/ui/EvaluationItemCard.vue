<template>
  <el-card shadow="hover" class="eval-item-card">
    <div class="eval-item-card__header">
      <span class="eval-item-card__score" :style="{ color: scoreColor }">
        {{ item.totalScore }}점
      </span>
    </div>

    <p class="eval-item-card__question">{{ item.question }}</p>

    <ScoreRadarChart :scores="item.scores" style="margin: 16px 0" />

    <div class="eval-item-card__feedback">
      <p>{{ item.feedback }}</p>
    </div>

    <el-row :gutter="16" style="margin-top: 16px">
      <el-col :span="12">
        <div class="eval-item-card__list eval-item-card__list--strength">
          <h4>강점</h4>
          <ul>
            <li v-for="(s, i) in item.strengths" :key="i">{{ s }}</li>
          </ul>
        </div>
      </el-col>
      <el-col :span="12">
        <div class="eval-item-card__list eval-item-card__list--improvement">
          <h4>개선점</h4>
          <ul>
            <li v-for="(imp, i) in item.improvements" :key="i">{{ imp }}</li>
          </ul>
        </div>
      </el-col>
    </el-row>
  </el-card>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import ScoreRadarChart from './ScoreRadarChart.vue';
import type { EvaluationItem } from '../model/evaluation.types';

const props = defineProps<{
  item: EvaluationItem;
}>();

const scoreColor = computed(() => {
  if (props.item.totalScore >= 80) return '#67C23A';
  if (props.item.totalScore >= 60) return '#E6A23C';
  return '#F56C6C';
});
</script>

<style lang="scss" scoped>
.eval-item-card {
  &__header {
    display: flex;
    justify-content: flex-end;
    margin-bottom: 8px;
  }

  &__score {
    font-size: 20px;
    font-weight: 700;
  }

  &__question {
    margin: 0;
    font-size: 16px;
    line-height: 1.6;
    font-weight: 500;
  }

  &__feedback {
    background: #f5f7fa;
    padding: 12px 16px;
    border-radius: 8px;

    p {
      margin: 0;
      font-size: 14px;
      line-height: 1.6;
      color: #606266;
    }
  }

  &__list {
    h4 {
      margin: 0 0 8px;
      font-size: 14px;
    }

    ul {
      margin: 0;
      padding-left: 18px;

      li {
        font-size: 13px;
        line-height: 1.8;
        color: #606266;
      }
    }

    &--strength h4 {
      color: #67C23A;
    }

    &--improvement h4 {
      color: #E6A23C;
    }
  }
}
</style>
