<template>
  <el-container class="app-layout">
    <el-header class="app-layout__header">
      <button class="app-layout__logo" type="button" @click="navigateTo('/')">
        InterviewMate
      </button>

      <div v-if="authStore.isAuthenticated" class="app-layout__nav">
        <el-button text @click="navigateTo('/resumes/upload')">이력서</el-button>
        <el-button text @click="navigateTo('/interviews/history')">면접 기록</el-button>
        <span v-if="authStore.user?.name" class="app-layout__user">
          {{ authStore.user.name }}
        </span>
        <el-button text @click="handleLogout">로그아웃</el-button>
      </div>

      <button
        v-if="authStore.isAuthenticated"
        class="app-layout__menu-button"
        type="button"
        aria-label="메뉴 열기"
        :aria-expanded="isMobileMenuOpen"
        @click="isMobileMenuOpen = true"
      >
        <el-icon><Menu /></el-icon>
      </button>
    </el-header>

    <el-drawer
      v-model="isMobileMenuOpen"
      modal-class="app-layout-mobile-menu"
      direction="rtl"
      size="292px"
      :with-header="false"
    >
      <aside class="mobile-menu-panel" aria-label="모바일 메뉴">
        <div class="mobile-menu-user-wrap">
          <div class="mobile-menu-user">
            <div class="mobile-menu-user__inner">
              <span class="mobile-menu-user__avatar">
                <el-icon><UserFilled /></el-icon>
              </span>
              <div class="mobile-menu-user__text">
                <strong>{{ authStore.user?.name || '사용자' }}</strong>
              </div>
            </div>
          </div>
        </div>

        <nav class="mobile-menu-list">
          <button type="button" @click="navigateTo('/resumes/upload')">
            <span class="mobile-menu-list__content">
              <span class="mobile-menu-list__icon">
                <el-icon><Document /></el-icon>
              </span>
              <span>이력서</span>
            </span>
          </button>
          <button type="button" @click="navigateTo('/interviews/history')">
            <span class="mobile-menu-list__content">
              <span class="mobile-menu-list__icon">
                <el-icon><ChatLineRound /></el-icon>
              </span>
              <span>면접 기록</span>
            </span>
          </button>
        </nav>

        <div class="mobile-menu-logout-wrap">
          <button type="button" class="mobile-menu-logout" @click="handleLogout">
            <span class="mobile-menu-logout__content">
              <span class="mobile-menu-list__icon">
                <el-icon><SwitchButton /></el-icon>
              </span>
              <span>로그아웃</span>
            </span>
          </button>
        </div>
      </aside>
    </el-drawer>

    <el-main class="app-layout__main">
      <router-view />
    </el-main>
  </el-container>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import {
  ChatLineRound,
  Document,
  Menu,
  SwitchButton,
  UserFilled,
} from '@element-plus/icons-vue';
import { useAuthStore } from '@/features/auth';

const authStore = useAuthStore();
const router = useRouter();
const isMobileMenuOpen = ref(false);

function navigateTo(path: string) {
  isMobileMenuOpen.value = false;
  router.push(path);
}

function handleLogout() {
  isMobileMenuOpen.value = false;
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
    gap: 12px;
    height: auto;
    min-height: 60px;
    padding: 10px 20px;
    border-bottom: 1px solid #e4e7ed;
    background: #fff;
    box-shadow: 0 2px 10px rgba(15, 23, 42, 0.04);
  }

  &__logo {
    appearance: none;
    flex: 0 0 auto;
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
    justify-content: flex-end;
    flex-wrap: wrap;
    gap: 8px;
    min-width: 0;
  }

  &__menu-button {
    appearance: none;
    display: none;
    align-items: center;
    justify-content: center;
    width: 42px;
    height: 42px;
    border: 0;
    border-radius: 10px;
    background: transparent;
    color: #409eff;
    font-size: 20px;
    cursor: pointer;

    &:hover,
    &:focus {
      background: #ecf5ff;
      outline: none;
    }
  }

  &__user {
    max-width: 140px;
    overflow: hidden;
    color: #606266;
    font-size: 14px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__main {
    min-width: 0;
    padding: 20px;
    background: #f5f7fa;
  }
}

@media (max-width: 760px) {
  .app-layout {
    &__header {
      flex-direction: row;
      flex-wrap: nowrap;
      min-height: 58px;
      padding: 8px 14px;
    }

    &__logo {
      font-size: 19px;
    }

    &__nav {
      display: none;
    }

    &__menu-button {
      display: inline-flex;
    }

    &__main {
      padding: 12px;
    }
  }
}
</style>

<style lang="scss">
.app-layout-mobile-menu {
  .el-drawer {
    background: #f8fbff;
  }

  .el-drawer__body {
    padding: 0;
  }
}

.mobile-menu-panel {
  display: flex;
  min-height: 100%;
  flex-direction: column;
  padding: 0;
  background:
    linear-gradient(180deg, rgba(64, 158, 255, 0.1) 0%, rgba(64, 158, 255, 0) 150px),
    #fff;
}

.mobile-menu-user-wrap {
  padding: 18px;
}

.mobile-menu-user__inner {
  display: flex;
  align-items: center;
  gap: 12px;
}

.mobile-menu-user__avatar {
  display: inline-flex;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 12px;
  color: #fff;
  font-size: 22px;

  .el-icon {
	--color: #409eff
  }
}

.mobile-menu-user__text {
  min-width: 0;

  strong {
    display: block;
    overflow: hidden;
    color: #1f2a44;
    font-size: 20px;
    line-height: 1.2;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.mobile-menu-list {
  border-top: 1px solid #e4e7ed;
}

.mobile-menu-list button,
.mobile-menu-logout {
  appearance: none;
  display: flex;
  align-items: center;
  width: 100%;
  border: 0;
  border-bottom: 1px solid #e4e7ed;
  background: transparent;
  padding: 0;
  color: #303133;
  font: inherit;
  font-size: 17px;
  font-weight: 600;
  text-align: left;
  cursor: pointer;
}

.mobile-menu-list__content,
.mobile-menu-logout__content {
  display: flex;
  align-items: center;
  width: 100%;
  gap: 12px;
  padding: 17px 18px;
}

.mobile-menu-list button:hover,
.mobile-menu-list button:focus {
  color: #409eff;
  outline: none;
}

.mobile-menu-list__icon {
  display: inline-flex;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: transparent;
  color: #409eff;
  font-size: 19px;
}

.mobile-menu-logout-wrap {
  margin-top: auto;
  padding: 18px;
}

.mobile-menu-logout {
  border: 1px solid #fde2e2;
  border-radius: 10px;
  background: #fff5f5;
  color: #f56c6c;

  .mobile-menu-logout__content {
    padding: 15px 14px;
  }
}

.mobile-menu-logout:hover,
.mobile-menu-logout:focus {
  border-color: #fab6b6;
  background: #fef0f0;
  outline: none;
}
</style>
