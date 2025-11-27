<template>
  <div class="activity-list">
    <!-- 统计卡片 -->
    <div class="stats-row">
      <StatCard title="总活动数" :value="stats.total || 0" description="包含所有状态的活动" />
      <StatCard title="报名中" :value="stats.registration || 0" description="当前可报名的活动" />
      <StatCard title="进行中" :value="stats.ongoing || 0" description="正在举办的活动" />
      <StatCard title="未发布" :value="stats.draft || 0" description="保存为草稿，未公开" />
    </div>

    <!-- 工具栏 -->
    <div class="toolbar">
      <div class="search-group">
        <input
          type="text"
          placeholder="按活动名称搜索"
          v-model="searchQuery"
          @keyup.enter="handleSearch"
        />
        <select v-model="statusFilter" @change="handleSearch">
          <option value="">全部状态</option>
          <option value="0">未发布</option>
          <option value="1">报名中</option>
          <option value="2">报名结束</option>
          <option value="3">进行中</option>
          <option value="4">已结束</option>
          <option value="5">已取消</option>
        </select>
      </div>
      <button class="btn-primary" @click="goToCreate">+ 创建新活动</button>
    </div>

    <!-- 活动列表表格 -->
    <div class="card">
      <el-table
        :data="activities"
        v-loading="loading"
        style="width: 100%"
        :header-cell-style="{ background: '#fafafa', color: '#6b7280', fontSize: '12px' }"
      >
        <el-table-column label="海报" width="100">
          <template #default="{ row }">
            <div
              class="poster"
              :style="{ backgroundImage: row.posterUrl ? `url(${row.posterUrl})` : 'none' }"
            ></div>
          </template>
        </el-table-column>

        <el-table-column label="活动名称" min-width="200">
          <template #default="{ row }">
            <div>
              {{ row.activityName }}<br />
              <span style="font-size: 11px; color: #6b7280;">{{ row.location }}</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="类型" prop="activityTypeName" width="120" />

        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <span class="tag" :class="getStatusClass(row.activityStatus)">
              {{ row.activityStatusName }}
            </span>
          </template>
        </el-table-column>

        <el-table-column label="报名人数 / 上限" width="150">
          <template #default="{ row }">
            {{ row.currentRegistrationCount || 0 }} / {{ row.maxParticipants || '不限' }}
          </template>
        </el-table-column>

        <el-table-column label="报名时间" min-width="180">
          <template #default="{ row }">
            {{ formatTimeRange(row.registrationStartTime, row.registrationEndTime) }}
          </template>
        </el-table-column>

        <el-table-column label="活动时间" min-width="180">
          <template #default="{ row }">
            {{ formatTimeRange(row.startTime, row.endTime) }}
          </template>
        </el-table-column>

        <el-table-column label="访问量" prop="viewCount" width="100" />

        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-dropdown @command="(cmd) => handleAction(cmd, row)">
              <el-button type="primary" text>
                操作 <el-icon class="el-icon--right"><arrow-down /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="edit">编辑</el-dropdown-item>
                  <el-dropdown-item v-if="row.activityStatus === 0" command="publish">发布</el-dropdown-item>
                  <el-dropdown-item v-if="row.activityStatus === 1" command="cancel">取消</el-dropdown-item>
                  <el-dropdown-item command="delete" divided>删除</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
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
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowDown } from '@element-plus/icons-vue'
import StatCard from '@/components/StatCard.vue'
import {
  getActivityList,
  getActivityStats,
  publishActivity,
  cancelActivity,
  deleteActivity
} from '@/api/activity'

const router = useRouter()

const loading = ref(false)
const searchQuery = ref('')
const statusFilter = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const activities = ref([])
const stats = ref({})

onMounted(() => {
  loadActivities()
  loadStats()
})

const loadActivities = async () => {
  loading.value = true
  try {
    const params = {
      pageNum: currentPage.value,
      pageSize: pageSize.value,
      keyword: searchQuery.value || undefined,
      activityStatus: statusFilter.value || undefined
    }
    
    const res = await getActivityList(params)
    if (res.code === 200) {
      activities.value = res.data.list || []
      total.value = res.data.total || 0
    }
  } catch (error) {
    console.error('加载活动列表失败:', error)
  } finally {
    loading.value = false
  }
}

const loadStats = async () => {
  try {
    const res = await getActivityStats()
    if (res.code === 200) {
      // 前端聚合统计数据
      const allActivities = res.data.list || []
      stats.value = {
        total: allActivities.length,
        draft: allActivities.filter(a => a.activityStatus === 0).length,
        registration: allActivities.filter(a => a.activityStatus === 1).length,
        ongoing: allActivities.filter(a => a.activityStatus === 3).length
      }
    }
  } catch (error) {
    console.error('加载统计信息失败:', error)
  }
}

const handleSearch = () => {
  currentPage.value = 1
  loadActivities()
}

const goToCreate = () => {
  router.push('/activities/create')
}

const handleAction = async (command, row) => {
  switch (command) {
    case 'edit':
      router.push(`/activities/edit/${row.id}`)
      break
    case 'publish':
      await handlePublish(row)
      break
    case 'cancel':
      await handleCancel(row)
      break
    case 'delete':
      await handleDelete(row)
      break
  }
}

const handlePublish = async (row) => {
  try {
    await ElMessageBox.confirm(`确定要发布活动"${row.activityName}"吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    const res = await publishActivity(row.id)
    if (res.code === 200) {
      ElMessage.success('发布成功')
      loadActivities()
      loadStats()
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('发布失败:', error)
    }
  }
}

const handleCancel = async (row) => {
  try {
    await ElMessageBox.confirm(`确定要取消活动"${row.activityName}"吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    const res = await cancelActivity(row.id)
    if (res.code === 200) {
      ElMessage.success('取消成功')
      loadActivities()
      loadStats()
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('取消失败:', error)
    }
  }
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除活动"${row.activityName}"吗？此操作不可恢复！`,
      '警告',
      {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'error'
      }
    )
    
    const res = await deleteActivity(row.id)
    if (res.code === 200) {
      ElMessage.success('删除成功')
      loadActivities()
      loadStats()
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败:', error)
    }
  }
}

const getStatusClass = (status) => {
  const statusMap = {
    0: 'tag-gray',   // 未发布
    1: 'tag-green',  // 报名中
    2: 'tag-yellow', // 报名结束
    3: 'tag-yellow', // 进行中
    4: 'tag-red',    // 已结束
    5: 'tag-red'     // 已取消
  }
  return statusMap[status] || 'tag-gray'
}

const formatTimeRange = (start, end) => {
  if (!start) return '-'
  const startStr = start.replace('T', ' ').substring(0, 16)
  if (!end) return startStr
  const endStr = end.replace('T', ' ').substring(0, 16)
  return `${startStr} ~ ${endStr}`
}
</script>

<style scoped lang="scss">
.activity-list {
  max-width: 1400px;
}

.stats-row {
  display: flex;
  gap: 16px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  flex-wrap: wrap;
  gap: 8px;
}

.search-group {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
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
  padding: 14px 16px;
  box-sizing: border-box;
}

.poster {
  width: 60px;
  height: 36px;
  border-radius: 4px;
  background: #e5e7eb;
  background-size: cover;
  background-position: center;
}

.pagination-wrapper {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}
</style>
