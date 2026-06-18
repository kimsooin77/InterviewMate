<template>
  <el-form
    ref="formRef"
    :model="form"
    :rules="rules"
    label-position="top"
    @submit.prevent="handleSubmit"
  >
    <el-form-item label="이름" prop="name">
      <el-input
        v-model="form.name"
        placeholder="이름을 입력하세요"
        :prefix-icon="User"
      />
    </el-form-item>

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
        placeholder="영문 대소문자, 숫자, 특수문자 포함 8자 이상"
        :prefix-icon="Lock"
        show-password
      />
    </el-form-item>

    <el-form-item label="비밀번호 확인" prop="confirmPassword">
      <el-input
        v-model="form.confirmPassword"
        type="password"
        placeholder="비밀번호를 다시 입력하세요"
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
        회원가입
      </el-button>
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';
import { User, Message, Lock } from '@element-plus/icons-vue';
import type { FormInstance, FormRules } from 'element-plus';
import type { SignupRequest } from '../model/auth.types';

const emit = defineEmits<{
  submit: [data: SignupRequest];
}>();

defineProps<{
  loading?: boolean;
}>();

const formRef = ref<FormInstance>();

const form = reactive({
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
});

const validateConfirmPassword = (_rule: unknown, value: string, callback: (error?: Error) => void) => {
  if (value !== form.password) {
    callback(new Error('비밀번호가 일치하지 않습니다'));
  } else {
    callback();
  }
};

const rules: FormRules = {
  name: [
    { required: true, message: '이름을 입력하세요', trigger: 'blur' },
  ],
  email: [
    { required: true, message: '이메일을 입력하세요', trigger: 'blur' },
    { type: 'email', message: '올바른 이메일 형식이 아닙니다', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '비밀번호를 입력하세요', trigger: 'blur' },
    { min: 8, message: '비밀번호는 최소 8자 이상이어야 합니다', trigger: 'blur' },
    {
      pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/,
      message: '영문 대소문자, 숫자, 특수문자를 포함해야 합니다',
      trigger: 'blur',
    },
  ],
  confirmPassword: [
    { required: true, message: '비밀번호 확인을 입력하세요', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' },
  ],
};

async function handleSubmit() {
  const valid = await formRef.value?.validate().catch(() => false);
  if (!valid) return;
  emit('submit', {
    name: form.name,
    email: form.email,
    password: form.password,
  });
}
</script>
