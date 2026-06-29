import type { NavigationGuardNext, RouteLocationNormalized } from 'vue-router';
import { useAuthStore } from '@/features/auth';
import { hasValidStoredAccessToken } from '@/shared/utils/auth-token';

export function authGuard(
  to: RouteLocationNormalized,
  _from: RouteLocationNormalized,
  next: NavigationGuardNext,
) {
  const authStore = useAuthStore();
  const hasValidToken = hasValidStoredAccessToken();

  if (!hasValidToken && authStore.isAuthenticated) {
    authStore.logout();
  }

  if (to.meta.requiresAuth && !hasValidToken) {
    next({ path: '/login', query: { redirect: to.fullPath } });
    return;
  }

  if (to.meta.guestOnly && hasValidToken) {
    next('/');
    return;
  }

  if (hasValidToken && !authStore.user) {
    authStore.ensureUser()
      .then(() => next())
      .catch(() => {
        authStore.logout();
        next({ path: '/login', query: { redirect: to.fullPath } });
      });
    return;
  }

  next();
}
