<template>
  <div class="signup-page">
    <el-card class="signup-page__card">
      <template #header>
        <h2 class="signup-page__title">회원가입</h2>
        <p class="signup-page__subtitle">InterviewMate에 가입하세요</p>
      </template>

      <SignupForm :loading="loading" @submit="handleSignup" />

      <div class="signup-page__footer">
        이미 계정이 있으신가요?
        <router-link to="/login">로그인</router-link>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import SignupForm from '@/features/auth/ui/SignupForm.vue';
import { useAuthStore } from '@/features/auth';
import type { SignupRequest } from '@/features/auth';

const authStore = useAuthStore();
const router = useRouter();
const loading = ref(false);

async function handleSignup(data: SignupRequest) {
  loading.value = true;
  try {
    await authStore.signup(data);
    ElMessage.success('회원가입이 완료되었습니다. 로그인해주세요.');
    router.push('/login');
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string } } };
    ElMessage.error(err.response?.data?.message || '회원가입에 실패했습니다.');
  } finally {
    loading.value = false;
  }
}
</script>

<style lang="scss" scoped>
.signup-page {
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
    color: #303133;
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
