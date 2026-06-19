import { createRouter, createWebHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';
import { authGuard } from './guards';
import AppLayout from '@/shared/ui/AppLayout.vue';

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/pages/LoginPage.vue'),
    meta: { guestOnly: true },
  },
  {
    path: '/signup',
    name: 'Signup',
    component: () => import('@/pages/SignupPage.vue'),
    meta: { guestOnly: true },
  },
  {
    path: '/',
    component: AppLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        redirect: '/resumes/upload',
      },
      {
        path: 'resumes/upload',
        name: 'ResumeUpload',
        component: () => import('@/pages/ResumeUploadPage.vue'),
      },
      {
        path: 'resumes/:id',
        name: 'ResumeDetail',
        component: () => import('@/pages/ResumeDetailPage.vue'),
      },
      {
        path: 'questions/setup/:resumeId',
        name: 'QuestionSetup',
        component: () => import('@/pages/QuestionSetupPage.vue'),
      },
      {
        path: 'question-sets/:id',
        name: 'QuestionPreview',
        component: () => import('@/pages/QuestionPreviewPage.vue'),
      },
      {
        path: 'interviews/start/:questionSetId',
        name: 'Interview',
        component: () => import('@/pages/InterviewPage.vue'),
      },
      {
        path: 'evaluations/:sessionId',
        name: 'Evaluation',
        component: () => import('@/pages/EvaluationPage.vue'),
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(authGuard);

export default router;
