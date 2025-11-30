<template>
  <div class="registration-list-page">
<div class="page-header">
      <h2>报名管理</h2>
    </div>

    <!-- 筛选工具栏 -->
    <div class="toolbar">
      <div class="search-group">
        <el-select
          v-model="activityId"
          placeholder="选择活动"
          filterable
          clearable
          style="width: 300px;"
          @change="handleSearch"
        >
          <el-option
            v-for="activity in activities"
            :key="activity.id"
            :label="activity.activityName"
            :value="activity.id"
          />
        </el-select>
        
        <input
          type="text"
          placeholder="搜索学生姓名或手机号"
          v-model="searchQuery"
          @keyup.enter="handleSearch"
        />
        
        <select v-model="statusFilter" @change="handleSearch">
          <option value="">全部状态</option>
          <option value="1">报名成功</option>
          <option value="2">已取消</option>
        </select>
        
        <select v-model="checkInFilter" @change="handleSearch">
          <option value="">签到状态</option>
          <option value="0">未签到</option>
          <option value="1">已签到</option>
        </select>
        
        <button class="btn-primary" @click="handleSearch">查询</button>
        
        <el-button 
          v-if="activityId"
          type="success"
          @click="showQRCode"
          :icon="Grid"
        >
          签到二维码
        </el-button>
      </div>
    </div>

    <!-- 报名列表表格 -->
    <div class="card">
      <el-table :data="registrations" v-loading="loading" style="width: 100%">
        <el-table-column label="活动名称" min-width="200">
          <template #default="{ row }">
            <span v-if="row.activityName">{{ row.activityName }}</span>
            <el-tag v-else type="info" size="small">活动已删除</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="studentName" label="学生姓名" width="120" />
        <el-table-column prop="studentPhone" label="手机号" width="140" />
        <el-table-column label="报名状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.registrationStatus === 1 ? 'success' : 'info'">
              {{ row.registrationStatus === 1 ? '报名成功' : '已取消' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="签到状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.checkInStatus === 1 ? 'success' : 'warning'">
              {{ row.checkInStatus === 1 ? '已签到' : '未签到' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="报名时间" width="180">
          <template #default="{ row }">
            {{ formatTime(row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column label="签到时间" width="180">
          <template #default="{ row }">
            {{ row.checkInTime ? formatTime(row.checkInTime) : '-' }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120">
          <template #default="{ row }">
            <el-button
              v-if="row.checkInStatus === 0 && row.registrationStatus === 1"
              type="primary"
              text
              @click="handleCheckIn(row)"
            >
              签到
            </el-button>
            <span v-else>-</span>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSearch"
          @current-change="handleSearch"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Grid } from '@element-plus/icons-vue'
import { getRegistrationList, checkInStudent } from '@/api/registration'
import { getActivityList } from '@/api/activity'

const router = useRouter()
const route = useRoute()

const loading = ref(false)
const searchQuery = ref('')
const activityId = ref('')
const statusFilter = ref('')
const checkInFilter = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const registrations = ref([])
const activities = ref([])

onMounted(() => {
  // 从路由参数获取活动ID
  if (route.query.activityId) {
    activityId.value = Number(route.query.activityId)
  }
  
  loadActivities()
  loadRegistrations()
})

const showQRCode = () => {
  if (!activityId.value) return
  router.push(`/activities/${activityId.value}/checkin-qrcode`)
}

const loadActivities = async () => {
  try {
    const res = await getActivityList({ pageNum: 1, pageSize: 1000 })
    if (res.code === 200) {
      activities.value = res.data.list || []
    }
  } catch (error) {
    console.error('加载活动列表失败:', error)
  }
}

const loadRegistrations = async () => {
  loading.value = true
  try {
    // 根据输入内容智能选择搜索字段
    let studentName = undefined
    let studentPhone = undefined
    
    if (searchQuery.value) {
      // 如果是11位纯数字且以1开头，判定为完整手机号，使用手机号精确搜索
      if (/^1[3-9]\d{9}$/.test(searchQuery.value)) {
        studentPhone = searchQuery.value
      } else {
        // 其他情况（包括非11位纯数字、姓名等）都使用姓名模糊搜索
        studentName = searchQuery.value
      }
    }
    
    const params = {
      pageNum: currentPage.value,
      pageSize: pageSize.value,
      activityId: activityId.value || undefined,
      studentName: studentName,
      studentPhone: studentPhone,
      registrationStatus: statusFilter.value || undefined,
      checkInStatus: checkInFilter.value || undefined
    }
    
    console.log('查询参数:', params)
    
    const res = await getRegistrationList(params)
    if (res.code === 200) {
      registrations.value = res.data.list || []
      total.value = res.data.total || 0
    } else {
      registrations.value = []
      total.value = 0
      ElMessage.error(res.message || '加载报名列表失败')
    }
  } catch (error) {
    console.error('加载报名列表失败:', error)
    registrations.value = []
    total.value = 0
    ElMessage.error('加载报名列表失败')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  currentPage.value = 1
  loadRegistrations()
}

const handleCheckIn = async (row) => {
  try {
    await ElMessageBox.confirm(`确认为"${row.studentName}"签到吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    const res = await checkInStudent({
      activityId: row.activityId,
      studentPhone: row.studentPhone
    })
    
    if (res.code === 200) {
      ElMessage.success('签到成功')
      loadRegistrations()
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('签到失败:', error)
    }
  }
}

const formatTime = (time) => {
  if (!time) return '-'
  return time.replace('T', ' ').substring(0, 19)
}
</script>

<style scoped lang="scss">
.registration-list-page {
  max-width: 1400px;
}

.page-header {
  margin-bottom: 16px;
  
  h2 {
    font-size: 20px;
    color: #111827;
    margin: 0;
    font-weight: 600;
  }
}

.toolbar {
  margin-bottom: 12px;
}

.search-group {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  align-items: center;
}

input[type="text"], select {
  padding: 7px 10px;
  border-radius: 8px;
  border: 1px solid #d1d5db;
  font-size: 13px;
  outline: none;
  min-width: 160px;
}

input:focus, select:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 1px rgba(37, 99, 235, 0.2);
}

.btn-primary {
  padding: 8px 14px;
  border-radius: 999px;
  border: none;
  background: #2563eb;
  color: #fff;
  font-size: 13px;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-primary:hover {
  background: #1d4ed8;
}

.card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.15);
  padding: 16px;
}

.pagination-wrapper {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}
</style>
