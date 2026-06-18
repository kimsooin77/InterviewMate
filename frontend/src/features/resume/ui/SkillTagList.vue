<template>
  <div class="skill-tag-list">
    <el-tag
      v-for="skill in skills"
      :key="skill"
      type="primary"
      effect="light"
      class="skill-tag-list__tag"
    >
      {{ skill }}
    </el-tag>
    <span v-if="skills.length === 0" class="skill-tag-list__empty">
      추출된 기술 스택이 없습니다
    </span>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  skills: string[];
}>();
</script>

<style lang="scss" scoped>
.skill-tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;

  &__tag {
    font-size: 13px;
  }

  &__empty {
    font-size: 14px;
    color: #909399;
  }
}
</style>
