<template>
  <el-container class="app-layout">
    <el-header class="app-layout__header">
      <button class="app-layout__logo" type="button" @click="router.push('/')">
        InterviewMate
      </button>
      <div v-if="authStore.isAuthenticated" class="app-layout__nav">
        <el-button text @click="router.push('/resumes/upload')">이력서</el-button>
        <el-button text @click="router.push('/interviews/history')">면접 기록</el-button>
        <span class="app-layout__user">{{ authStore.user?.name }}</span>
        <el-button text @click="handleLogout">로그아웃</el-button>
      </div>
    </el-header>
    <el-main class="app-layout__main">
      <router-view />
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
    position: sticky;
    top: 0;
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid #e4e7ed;
    background: #fff;
    box-shadow: 0 2px 10px rgba(15, 23, 42, 0.04);
  }

  &__logo {
    appearance: none;
    border: 0;
    background: transparent;
    padding: 0;
    font-size: 20px;
    font-weight: 700;
    color: #409eff;
    cursor: pointer;

    &:hover,
    &:focus,
    &:active {
      border: 0;
      background: transparent;
      outline: none;
    }
  }

  &__nav {
    display: flex;
    align-items: center;
    gap: 8px;
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
