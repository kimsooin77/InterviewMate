<template>
  <el-row :gutter="24">
    <el-col :span="12">
      <el-card shadow="never" class="sw-card sw-card--strength">
        <template #header>
          <span class="sw-card__title sw-card__title--strength">강점</span>
        </template>
        <ul class="sw-card__list">
          <li v-for="(item, i) in strengths" :key="i">{{ item }}</li>
        </ul>
      </el-card>
    </el-col>
    <el-col :span="12">
      <el-card shadow="never" class="sw-card sw-card--improvement">
        <template #header>
          <span class="sw-card__title sw-card__title--improvement">개선점</span>
        </template>
        <ul class="sw-card__list">
          <li v-for="(item, i) in improvements" :key="i">{{ item }}</li>
        </ul>
      </el-card>
    </el-col>
  </el-row>
</template>

<script setup lang="ts">
defineProps<{
  strengths: string[];
  improvements: string[];
}>();
</script>

<style lang="scss" scoped>
.sw-card {
  &__title {
    font-size: 16px;
    font-weight: 600;

    &--strength {
      color: #67C23A;
    }

    &--improvement {
      color: #E6A23C;
    }
  }

  &__list {
    margin: 0;
    padding-left: 18px;

    li {
      font-size: 14px;
      line-height: 2;
      color: #606266;
    }
  }
}
</style>
