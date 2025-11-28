<template>
  <div class="main-layout">
    <div class="topbar">
      <div class="topbar-left">高校学生活动管理系统 · 管理后台</div>
      <div class="topbar-right">
        <router-link to="/activities" class="nav-link" :class="{ active: $route.path.startsWith('/activities') }">
          活动管理
        </router-link>
        <router-link to="/registrations" class="nav-link" :class="{ active: $route.path === '/registrations' }">
          报名管理
        </router-link>
        <router-link to="/activity-types" class="nav-link" :class="{ active: $route.path === '/activity-types' }">
          活动类型
        </router-link>
        <el-dropdown @command="handleCommand">
          <div class="user-dropdown">
            <div class="avatar-circle">{{ userInitial }}</div>
            <span class="username">{{ username }}</span>
          </div>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="logout">登出</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>
    <div class="page">
      <router-view />
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessageBox } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { getToken } from '@/utils/auth'

const router = useRouter()
const userStore = useUserStore()

const username = computed(() => userStore.userInfo?.realName || userStore.userInfo?.username || '管理员')
const userInitial = computed(() => username.value.charAt(0))

// 监听token变化,如果token为空则跳转登录页
watch(() => getToken(), (newToken) => {
  if (!newToken && router.currentRoute.value.path !== '/login') {
    router.replace('/login')
  }
})

onMounted(async () => {
  // 获取用户信息
  if (!userStore.userInfo && getToken()) {
    try {
      await userStore.getUserInfo()
    } catch (error) {
      console.error('获取用户信息失败:', error)
    }
  }
})

const handleCommand = async (command) => {
  if (command === 'logout') {
    try {
      await ElMessageBox.confirm('确定要退出登录吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
      await userStore.userLogout()
      // 登出后会自动跳转(watch会监听到token变化)
    } catch (error) {
      // 用户取消
    }
  }
}
</script>

<style scoped lang="scss">
.main-layout {
  min-height: 100vh;
}

.topbar {
  height: 56px;
  background: #111827;
  color: #f9fafb;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  box-sizing: border-box;
}

.topbar-left {
  font-size: 18px;
  font-weight: 600;
}

.topbar-right {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 13px;
}

.nav-link {
  color: #9ca3af;
  text-decoration: none;
  transition: color 0.2s;
  
  &:hover {
    color: #f9fafb;
  }
  
  &.active {
    color: #f9fafb;
  }
}

.user-dropdown {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  color: #f9fafb;
  
  &:hover {
    opacity: 0.8;
  }
}

.avatar-circle {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #4b5563;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
}

.username {
  font-size: 13px;
}

.page {
  padding: 20px 24px;
  box-sizing: border-box;
}
</style>
