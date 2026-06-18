import { createRouter, createWebHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  // Phase 1-3에서 Auth 라우트 추가 예정
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
