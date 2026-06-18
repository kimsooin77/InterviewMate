<template>
  <el-form
    ref="formRef"
    :model="form"
    :rules="rules"
    label-position="top"
    @submit.prevent="handleSubmit"
  >
    <el-form-item label="이메일" prop="email">
      <el-input
        v-model="form.email"
        type="email"
        placeholder="이메일을 입력하세요"
        :prefix-icon="Message"
      />
    </el-form-item>

    <el-form-item label="비밀번호" prop="password">
      <el-input
        v-model="form.password"
        type="password"
        placeholder="비밀번호를 입력하세요"
        :prefix-icon="Lock"
        show-password
      />
    </el-form-item>

    <el-form-item>
      <el-button
        type="primary"
        native-type="submit"
        :loading="loading"
        style="width: 100%"
      >
        로그인
      </el-button>
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';
import { Message, Lock } from '@element-plus/icons-vue';
import type { FormInstance, FormRules } from 'element-plus';
import type { LoginRequest } from '../model/auth.types';

const emit = defineEmits<{
  submit: [data: LoginRequest];
}>();

defineProps<{
  loading?: boolean;
}>();

const formRef = ref<FormInstance>();

const form = reactive<LoginRequest>({
  email: '',
  password: '',
});

const rules: FormRules = {
  email: [
    { required: true, message: '이메일을 입력하세요', trigger: 'blur' },
    { type: 'email', message: '올바른 이메일 형식이 아닙니다', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '비밀번호를 입력하세요', trigger: 'blur' },
  ],
};

async function handleSubmit() {
  const valid = await formRef.value?.validate().catch(() => false);
  if (!valid) return;
  emit('submit', { ...form });
}
</script>
