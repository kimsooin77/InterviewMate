<template>
  <div class="login-page">
    <el-card class="login-page__card">
      <template #header>
        <h2 class="login-page__title">InterviewMate</h2>
        <p class="login-page__subtitle">AI 기반 기술 면접 시뮬레이터</p>
      </template>

      <LoginForm :loading="loading" @submit="handleLogin" />

      <div class="login-page__footer">
        계정이 없으신가요?
        <router-link to="/signup">회원가입</router-link>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import LoginForm from '@/features/auth/ui/LoginForm.vue';
import { useAuthStore } from '@/features/auth';
import type { LoginRequest } from '@/features/auth';

const authStore = useAuthStore();
const router = useRouter();
const loading = ref(false);

async function handleLogin(data: LoginRequest) {
  loading.value = true;
  try {
    await authStore.login(data);
    ElMessage.success('로그인 성공');
    router.push('/');
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string } } };
    ElMessage.error(err.response?.data?.message || '로그인에 실패했습니다.');
  } finally {
    loading.value = false;
  }
}
</script>

<style lang="scss" scoped>
.login-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 20px;
  background: #f5f7fa;

  &__card {
    width: min(420px, 100%);
  }

  &__title {
    margin: 0;
    font-size: 24px;
    font-weight: 700;
    color: #409eff;
    text-align: center;
  }

  &__subtitle {
    margin: 8px 0 0;
    font-size: 14px;
    color: #909399;
    text-align: center;
  }

  &__footer {
    margin-top: 16px;
    font-size: 14px;
    color: #909399;
    text-align: center;

    a {
      color: #409eff;
      text-decoration: none;

      &:hover {
        text-decoration: underline;
      }
    }
  }
}
</style>
