<template>
  <el-card shadow="hover" class="eval-item-card">
    <div class="eval-item-card__header">
      <el-tag type="warning">보완 필요</el-tag>
      <span class="eval-item-card__score">{{ item.totalScore }}점</span>
    </div>

    <section class="eval-item-card__section eval-item-card__section--question">
      <h4>질문</h4>
      <p>{{ item.question }}</p>
    </section>

    <el-collapse class="eval-item-card__answer-collapse">
      <el-collapse-item title="내 답변 보기" name="answer">
        <p>{{ item.answer }}</p>
      </el-collapse-item>
    </el-collapse>

    <div class="eval-item-card__content-grid">
      <div class="eval-item-card__left-column">
        <section class="eval-item-card__section eval-item-card__section--review">
          <h4>내 답변에 대한 평가</h4>
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
      </div>

      <section
        v-if="item.idealAnswer"
        class="eval-item-card__section eval-item-card__section--ideal"
      >
        <h4>정답 방향 · 정석 답변</h4>
        <p>{{ item.idealAnswer }}</p>
      </section>
    </div>
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
  height: 100%;

  :deep(.el-card__body) {
    display: flex;
    flex-direction: column;
    max-height: min(560px, calc(100vh - 260px));
    min-height: 420px;
    overflow: hidden;
    padding: 18px;
  }

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

    &--review,
    &--ideal {
      padding: 12px 16px;
      border-radius: 8px;
    }

    &--question {
      flex: 0 0 auto;
    }

    &--review {
      border: 1px solid #fee2e2;
      background: #fff7f7;
    }

    &--ideal {
      border: 1px solid #bfdbfe;
      background: #eff6ff;

      h4 {
        color: #1d4ed8;
      }
    }
  }

  &__answer-collapse {
    margin: 0 0 12px;
    border-top: 1px solid #e5e7eb;
    border-bottom: 1px solid #e5e7eb;

    :deep(.el-collapse-item__header) {
      height: 38px;
      font-size: 13px;
      font-weight: 700;
      color: #536276;
    }

    :deep(.el-collapse-item__content) {
      padding-bottom: 12px;
      color: #606266;
      line-height: 1.7;
      white-space: pre-wrap;
    }

    p {
      margin: 0;
    }
  }

  &__content-grid {
    display: grid;
    grid-template-columns: minmax(0, 0.92fr) minmax(0, 1.08fr);
    gap: 12px;
    min-height: 0;
    overflow: auto;
    padding-right: 4px;
    scrollbar-color: transparent transparent;
    scrollbar-width: thin;
    transition: scrollbar-color 0.2s ease;

    .eval-item-card__section {
      margin-top: 0;
    }

    .eval-item-card__section--ideal {
      min-height: 0;
      overflow: auto;
      scrollbar-color: transparent transparent;
      scrollbar-width: thin;
      transition: scrollbar-color 0.2s ease;
    }

    &::-webkit-scrollbar,
    .eval-item-card__section--ideal::-webkit-scrollbar {
      width: 8px;
      height: 8px;
    }

    &::-webkit-scrollbar-thumb,
    .eval-item-card__section--ideal::-webkit-scrollbar-thumb {
      border: 2px solid transparent;
      border-radius: 999px;
      background-color: transparent;
      background-clip: content-box;
    }

    &::-webkit-scrollbar-track,
    .eval-item-card__section--ideal::-webkit-scrollbar-track {
      background: transparent;
    }
  }

  &:hover {
    .eval-item-card__content-grid,
    .eval-item-card__section--ideal {
      scrollbar-color: rgba(37, 99, 235, 0.38) transparent;
    }

    .eval-item-card__content-grid::-webkit-scrollbar-thumb,
    .eval-item-card__section--ideal::-webkit-scrollbar-thumb {
      background-color: rgba(37, 99, 235, 0.38);
    }
  }

  &__left-column {
    display: flex;
    flex-direction: column;
    gap: 12px;
    min-height: 0;
    overflow: auto;
    scrollbar-color: transparent transparent;
    scrollbar-width: thin;
    transition: scrollbar-color 0.2s ease;

    .eval-item-card__section {
      margin-top: 0;
    }

    &::-webkit-scrollbar {
      width: 8px;
    }

    &::-webkit-scrollbar-thumb {
      border: 2px solid transparent;
      border-radius: 999px;
      background-color: transparent;
      background-clip: content-box;
    }

    &::-webkit-scrollbar-track {
      background: transparent;
    }
  }

  &:hover {
    .eval-item-card__left-column {
      scrollbar-color: rgba(37, 99, 235, 0.38) transparent;
    }

    .eval-item-card__left-column::-webkit-scrollbar-thumb {
      background-color: rgba(37, 99, 235, 0.38);
    }
  }
}

@media (max-width: 720px) {
  .eval-item-card {
    :deep(.el-card__body) {
      max-height: min(620px, calc(100vh - 220px));
    }

    &__content-grid {
      display: flex;
      flex-direction: column;
    }
  }
}
</style>
