<template>
  <el-card shadow="hover" class="eval-item-card">
    <div class="eval-item-card__header">
      <el-tag type="warning">보완 필요</el-tag>
      <span class="eval-item-card__score">{{ item.totalScore }}점</span>
    </div>

    <section class="eval-item-card__section">
      <h4>질문</h4>
      <p>{{ item.question }}</p>
    </section>

    <section class="eval-item-card__section eval-item-card__section--answer">
      <h4>내 답변</h4>
      <p>{{ item.answer }}</p>
    </section>

    <section class="eval-item-card__section">
      <h4>해설</h4>
      <p>{{ item.feedback }}</p>
    </section>

    <section class="eval-item-card__section" v-if="item.improvements.length">
      <h4>부족한 부분</h4>
      <ul>
        <li v-for="(improvement, index) in item.improvements" :key="index">
          {{ improvement }}
        </li>
      </ul>
    </section>
  </el-card>
</template>

<script setup lang="ts">
import type { EvaluationItem } from '../model/evaluation.types';

defineProps<{
  item: EvaluationItem;
}>();
</script>

<style lang="scss" scoped>
.eval-item-card {
  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 16px;
  }

  &__score {
    font-size: 18px;
    font-weight: 700;
    color: #e6a23c;
  }

  &__section {
    & + & {
      margin-top: 16px;
    }

    h4 {
      margin: 0 0 8px;
      font-size: 14px;
      color: #303133;
    }

    p {
      margin: 0;
      line-height: 1.7;
      color: #606266;
      white-space: pre-wrap;
    }

    ul {
      margin: 0;
      padding-left: 18px;
      color: #606266;

      li {
        line-height: 1.8;
      }
    }

    &--answer {
      padding: 12px 16px;
      border-radius: 8px;
      background: #f5f7fa;
    }
  }
}
</style>
