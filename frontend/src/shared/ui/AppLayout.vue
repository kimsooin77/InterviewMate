<template>
  <el-container class="app-layout">
    <el-header class="app-layout__header">
      <div class="app-layout__logo">InterviewMate</div>
      <div v-if="authStore.isAuthenticated" class="app-layout__nav">
        <span class="app-layout__user">{{ authStore.user?.name }}</span>
        <el-button text @click="handleLogout">로그아웃</el-button>
      </div>
    </el-header>
    <el-main class="app-layout__main">
      <slot />
    </el-main>
  </el-container>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/features/auth';

const authStore = useAuthStore();
const router = useRouter();

function handleLogout() {
  authStore.logout();
  router.push('/login');
}
</script>

<style lang="scss" scoped>
.app-layout {
  min-height: 100vh;

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid #e4e7ed;
    background: #fff;
  }

  &__logo {
    font-size: 20px;
    font-weight: 700;
    color: #409eff;
  }

  &__nav {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  &__user {
    font-size: 14px;
    color: #606266;
  }

  &__main {
    background: #f5f7fa;
  }
}
</style>
