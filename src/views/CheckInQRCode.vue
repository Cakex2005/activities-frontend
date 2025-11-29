<template>
  <div class="qrcode-page">
    <div class="page-header">
      <h2>签到二维码</h2>
      <el-button @click="goBack" text>
        <el-icon><Back /></el-icon>
        返回
      </el-button>
    </div>

    <div class="card">
      <!-- 活动信息 -->
      <div v-if="activityInfo" class="activity-info">
        <h3>{{ activityInfo.activityName }}</h3>
        <div class="info-row">
          <el-icon><Clock /></el-icon>
          <span>{{ formatDateTime(activityInfo.startTime) }} - {{ formatDateTime(activityInfo.endTime) }}</span>
        </div>
        <div class="info-row">
          <el-icon><Location /></el-icon>
          <span>{{ activityInfo.location }}</span>
        </div>
      </div>

      <el-divider />

      <!-- 二维码展示区 -->
      <div class="qrcode-display">
        <div v-if="loading" class="loading-container">
          <el-icon class="is-loading" :size="50"><Loading /></el-icon>
          <p>正在生成二维码...</p>
        </div>
        
        <div v-else-if="qrCodeData.qrCodeImage" class="qrcode-container" ref="qrcodeContainer">
          <img 
            :src="qrCodeData.qrCodeImage" 
            alt="签到二维码"
            class="qrcode-image"
          />
          
          <div class="qrcode-hint">
            <el-icon><Cellphone /></el-icon>
            <span>请使用微信或浏览器扫码签到</span>
          </div>

          <!-- 倒计时 -->
          <div class="countdown">
            <el-tag 
              :type="remainingTime > 300 ? 'success' : (remainingTime > 60 ? 'warning' : 'danger')" 
              size="large"
              effect="dark"
            >
              <el-icon><Timer /></el-icon>
              有效期: {{ formattedTime }}
            </el-tag>
          </div>

          <!-- 操作按钮 -->
          <div class="action-buttons">
            <el-button 
              type="primary" 
              :loading="loading"
              @click="refreshQRCode"
              :icon="Refresh"
            >
              刷新二维码
            </el-button>
            
            <el-button 
              @click="toggleFullscreen"
              :icon="isFullscreen ? 'FullScreen' : 'FullScreen'"
            >
              {{ isFullscreen ? '退出全屏' : '全屏展示' }}
            </el-button>
          </div>
        </div>
        
        <div v-else class="empty-state">
          <el-empty description="点击下方按钮生成签到二维码">
            <el-button type="primary" @click="generateQRCode">生成二维码</el-button>
          </el-empty>
        </div>
      </div>

      <el-divider />

      <!-- 实时统计 -->
      <div class="stats-section">
        <h4>实时签到统计</h4>
        <div class="stats-grid">
          <div class="stat-item">
            <div class="stat-value">{{ stats.totalRegistrations }}</div>
            <div class="stat-label">
              <el-icon><User /></el-icon>
              已报名
            </div>
          </div>
          <div class="stat-item">
            <div class="stat-value success">{{ stats.checkedInCount }}</div>
            <div class="stat-label">
              <el-icon><CircleCheck /></el-icon>
              已签到
            </div>
          </div>
          <div class="stat-item">
            <div class="stat-value primary">{{ stats.checkInRate }}%</div>
            <div class="stat-label">
              <el-icon><TrendCharts /></el-icon>
              签到率
            </div>
          </div>
        </div>
        
        <el-progress 
          :percentage="stats.checkInRate" 
          :color="progressColor"
          :stroke-width="12"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { 
  Back, Clock, Location, Loading, Cellphone, Timer, Refresh, 
  User, CircleCheck, TrendCharts 
} from '@element-plus/icons-vue'
import { generateCheckInQRCode, getRegistrationStats } from '@/api/registration'
import { getActivityDetail } from '@/api/activity'

const route = useRoute()
const router = useRouter()

const activityId = route.params.id
const qrcodeContainer = ref(null)

// 数据状态
const loading = ref(false)
const activityInfo = ref(null)
const qrCodeData = ref({
  qrCodeImage: '',
  qrContent: '',
  checkInToken: '',
  expiresIn: 1800
})

const remainingTime = ref(1800)
const isFullscreen = ref(false)

const stats = ref({
  totalRegistrations: 0,
  checkedInCount: 0,
  checkInRate: 0
})

// 定时器
let countdownTimer = null
let statsTimer = null

// ==================== 初始化 ====================

onMounted(async () => {
  await loadActivityInfo()
  await generateQRCode()
  startStatsPolling()
})

onUnmounted(() => {
  clearInterval(countdownTimer)
  clearInterval(statsTimer)
})

// ==================== 活动信息 ====================

const loadActivityInfo = async () => {
  try {
    const res = await getActivityDetail(activityId)
    if (res.code === 200) {
      activityInfo.value = res.data
    }
  } catch (error) {
    ElMessage.error('加载活动信息失败')
  }
}

// ==================== 二维码生成 ====================

const generateQRCode = async () => {
  loading.value = true
  try {
    // 传递H5前端地址作为baseUrl
    const res = await generateCheckInQRCode(activityId, 'http://localhost:5174')
    
    if (res.code === 200) {
      qrCodeData.value = res.data
      remainingTime.value = res.data.expiresIn
      
      startCountdown()
      ElMessage.success('二维码生成成功')
    }
  } catch (error) {
    console.error('生成二维码失败:', error)
    ElMessage.error('生成二维码失败: ' + (error.message || '未知错误'))
  } finally {
    loading.value = false
  }
}

const refreshQRCode = async () => {
  await generateQRCode()
  ElMessage.success('二维码已刷新')
}

// ==================== 倒计时 ====================

const startCountdown = () => {
  clearInterval(countdownTimer)
  
  countdownTimer = setInterval(() => {
    remainingTime.value--
    
    if (remainingTime.value <= 0) {
      clearInterval(countdownTimer)
      ElMessage.warning({
        message: '二维码已过期，请刷新',
        duration: 5000
      })
    }
    
    // 提前30秒提醒
    if (remainingTime.value === 30) {
      ElMessage.warning({
        message: '二维码即将过期，建议刷新',
        duration: 3000
      })
    }
  }, 1000)
}

const formattedTime = computed(() => {
  const minutes = Math.floor(remainingTime.value / 60)
  const seconds = remainingTime.value % 60
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
})

// ==================== 统计数据 ====================

const fetchStats = async () => {
  try {
    const res = await getRegistrationStats(activityId)
    if (res.code === 200) {
      stats.value = {
        totalRegistrations: res.data.totalRegistrations || 0,
        checkedInCount: res.data.checkedInCount || 0,
        checkInRate: res.data.checkInRate || 0
      }
    }
  } catch (error) {
    console.error('获取统计失败:', error)
  }
}

const startStatsPolling = () => {
  fetchStats()
  statsTimer = setInterval(fetchStats, 5000)
}

const progressColor = computed(() => {
  const rate = stats.value.checkInRate
  if (rate >= 80) return '#67c23a'
  if (rate >= 60) return '#409eff'
  if (rate >= 40) return '#e6a23c'
  return '#f56c6c'
})

// ==================== 全屏功能 ====================

const toggleFullscreen = () => {
  const elem = qrcodeContainer.value
  
  if (!elem) return
  
  if (!isFullscreen.value) {
    if (elem.requestFullscreen) {
      elem.requestFullscreen()
    } else if (elem.webkitRequestFullscreen) {
      elem.webkitRequestFullscreen()
    }
    isFullscreen.value = true
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen()
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen()
    }
    isFullscreen.value = false
  }
}

// 监听全屏变化
document.addEventListener('fullscreenchange', () => {
  isFullscreen.value = !!document.fullscreenElement
})

// ==================== 工具函数 ====================

const formatDateTime = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleString('zh-CN', { 
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const goBack = () => {
  router.back()
}
</script>

<style scoped lang="scss">
.qrcode-page {
  max-width: 900px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  
  h2 {
    font-size: 20px;
    color: #111827;
    margin: 0;
    font-weight: 600;
  }
}

.card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.15);
  padding: 24px;
}

// ==================== 活动信息 ====================

.activity-info {
  h3 {
    font-size: 18px;
    color: #111827;
    margin: 0 0 12px 0;
    font-weight: 600;
  }

  .info-row {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #6b7280;
    font-size: 14px;
    margin-bottom: 8px;

    .el-icon {
      color: #9ca3af;
    }
  }
}

// ==================== 二维码展示 ====================

.qrcode-display {
  min-height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading-container {
  text-align: center;
  color: #9ca3af;

  p {
    margin-top: 16px;
    font-size: 14px;
  }
}

.qrcode-container {
  text-align: center;
  width: 100%;

  &:fullscreen {
    background: white;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 40px;

    .qrcode-image {
      width: 60vh;
      height: 60vh;
      max-width: 600px;
      max-height: 600px;
    }

    .countdown {
      .el-tag {
        font-size: 32px;
        padding: 16px 32px;
      }
    }
  }
}

.qrcode-image {
  width: 400px;
  height: 400px;
  border: 4px solid #409eff;
  border-radius: 12px;
  background: white;
  padding: 20px;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.2);
  transition: transform 0.3s;

  &:hover {
    transform: scale(1.02);
  }
}

.qrcode-hint {
  margin-top: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #6b7280;
  font-size: 14px;

  .el-icon {
    color: #409eff;
  }
}

.countdown {
  margin: 24px 0;

  .el-tag {
    font-size: 18px;
    padding: 8px 16px;
    font-weight: 500;
  }
}

.action-buttons {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-top: 16px;
}

.empty-state {
  padding: 60px 0;
}

// ==================== 统计信息 ====================

.stats-section {
  h4 {
    font-size: 16px;
    color: #111827;
    margin: 0 0 20px 0;
    font-weight: 600;
  }
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 20px;
}

.stat-item {
  text-align: center;
  padding: 20px;
  border-radius: 8px;
  background: #f9fafb;
  transition: all 0.3s;

  &:hover {
    background: #f3f4f6;
    transform: translateY(-2px);
  }

  .stat-value {
    font-size: 32px;
    font-weight: 700;
    color: #111827;
    margin-bottom: 8px;

    &.success {
      color: #67c23a;
    }

    &.primary {
      color: #409eff;
    }
  }

  .stat-label {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
    font-size: 14px;
    color: #6b7280;

    .el-icon {
      font-size: 16px;
    }
  }
}
</style>
