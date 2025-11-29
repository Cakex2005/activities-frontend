<template>
  <div class="activity-form-page">
    <div class="page-header">
      <h2>{{ isEdit ? '编辑活动' : '创建活动' }}</h2>
    </div>

    <div class="card">
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="120px"
        size="default"
      >
        <el-form-item label="活动名称" prop="activityName">
          <el-input v-model="form.activityName" placeholder="请输入活动名称" maxlength="100" show-word-limit />
        </el-form-item>

        <el-form-item label="活动描述" prop="activityDescription">
          <el-input
            v-model="form.activityDescription"
            type="textarea"
            :rows="4"
            placeholder="请输入活动描述"
            maxlength="2000"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="活动类型" prop="activityType">
          <el-select v-model="form.activityType" placeholder="请选择活动类型" style="width: 100%;">
            <el-option
              v-for="type in activityTypes"
              :key="type.typeCode"
              :label="type.typeName"
              :value="type.typeCode"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="活动时间" required>
          <el-col :span="11">
            <el-form-item prop="startTime">
              <el-date-picker
                v-model="form.startTime"
                type="datetime"
                placeholder="开始时间"
                style="width: 100%;"
                format="YYYY-MM-DD HH:mm"
                value-format="YYYY-MM-DDTHH:mm:ss"
              />
            </el-form-item>
          </el-col>
          <el-col :span="2" class="text-center">
            <span>至</span>
          </el-col>
          <el-col :span="11">
            <el-form-item prop="endTime">
              <el-date-picker
                v-model="form.endTime"
                type="datetime"
                placeholder="结束时间"
                style="width: 100%;"
                format="YYYY-MM-DD HH:mm"
                value-format="YYYY-MM-DDTHH:mm:ss"
              />
            </el-form-item>
          </el-col>
        </el-form-item>

        <el-form-item label="报名时间" required>
          <el-col :span="11">
            <el-form-item prop="registrationStartTime">
              <el-date-picker
                v-model="form.registrationStartTime"
                type="datetime"
                placeholder="报名开始时间"
                style="width: 100%;"
                format="YYYY-MM-DD HH:mm"
                value-format="YYYY-MM-DDTHH:mm:ss"
              />
            </el-form-item>
          </el-col>
          <el-col :span="2" class="text-center">
            <span>至</span>
          </el-col>
          <el-col :span="11">
            <el-form-item prop="registrationEndTime">
              <el-date-picker
                v-model="form.registrationEndTime"
                type="datetime"
                placeholder="报名结束时间"
                style="width: 100%;"
                format="YYYY-MM-DD HH:mm"
                value-format="YYYY-MM-DDTHH:mm:ss"
              />
            </el-form-item>
          </el-col>
        </el-form-item>

        <el-form-item label="活动地点" prop="location">
          <el-input v-model="form.location" placeholder="请输入活动地点" maxlength="200" />
        </el-form-item>

        <el-form-item label="主办方" prop="organizer">
          <el-input v-model="form.organizer" placeholder="请输入主办方" maxlength="100" />
        </el-form-item>

        <el-form-item label="联系人" prop="contactPerson">
          <el-input v-model="form.contactPerson" placeholder="请输入联系人姓名" maxlength="50" />
        </el-form-item>

        <el-form-item label="联系电话" prop="contactPhone">
          <el-input v-model="form.contactPhone" placeholder="请输入联系电话" maxlength="20" />
        </el-form-item>

        <el-form-item label="最大参与人数" prop="maxParticipants">
          <el-input-number
            v-model="form.maxParticipants"
            :min="1"
            :max="100000"
            placeholder="不填表示不限制"
            style="width: 200px;"
          />
          <span style="margin-left: 12px; color: #6b7280; font-size: 13px;">不填表示不限制人数</span>
        </el-form-item>

        <el-form-item label="活动海报" prop="posterUrl">
          <div class="poster-upload-container">
            <!-- 方式一: 手动输入URL -->
            <div class="url-input-section">
              <el-input 
                v-model="form.posterUrl" 
                placeholder="可手动输入图片URL（支持外部链接）" 
                clearable
              >
                <template #prepend>
                  <el-icon><Link /></el-icon>
                </template>
              </el-input>
            </div>

            <!-- 方式二: 上传图片文件 -->
            <div class="upload-section">
              <el-upload
                class="poster-uploader"
                :auto-upload="false"
                :show-file-list="false"
                :on-change="handleFileChange"
                accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                drag
              >
                <div v-if="!form.posterUrl" class="upload-placeholder">
                  <el-icon class="upload-icon" :size="50"><Plus /></el-icon>
                  <div class="upload-text">点击或拖拽图片到此处上传</div>
                  <div class="upload-hint">支持 jpg/png/gif/webp 格式，最大 50MB</div>
                </div>
                <div v-else class="image-preview">
                  <img :src="form.posterUrl" alt="海报预览" />
                  <div class="image-mask">
                    <el-icon :size="20" @click.stop="previewPoster"><ZoomIn /></el-icon>
                    <el-icon :size="20" @click.stop="removePoster"><Delete /></el-icon>
                  </div>
                </div>
              </el-upload>
              
              <!-- 上传进度 -->
              <el-progress 
                v-if="uploading" 
                :percentage="uploadProgress" 
                :status="uploadProgress === 100 ? 'success' : undefined"
                style="margin-top: 12px;"
              />
            </div>

            <!-- 操作按钮 -->
            <div v-if="form.posterUrl" class="poster-actions">
              <el-button size="small" @click="previewPoster">
                <el-icon><ZoomIn /></el-icon>
                预览
              </el-button>
              <el-button size="small" type="danger" @click="removePoster">
                <el-icon><Delete /></el-icon>
                删除
              </el-button>
            </div>
          </div>
        </el-form-item>

        <!-- 图片预览对话框 -->
        <el-dialog v-model="showPreview" title="海报预览" width="60%">
          <img :src="form.posterUrl" alt="海报" style="width: 100%; display: block;" />
        </el-dialog>

        <el-form-item>
          <el-button type="primary" :loading="submitting" @click="handleSubmit">
            {{ submitting ? '提交中...' : (isEdit ? '更新活动' : '创建活动') }}
          </el-button>
          <el-button @click="handleCancel">取消</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Link, ZoomIn, Delete } from '@element-plus/icons-vue'
import { getActivityTypes } from '@/api/activityType'
import { createActivity, updateActivity, getActivityDetail } from '@/api/activity'
import { uploadFile } from '@/api/file'

const route = useRoute()
const router = useRouter()

const formRef = ref(null)
const submitting = ref(false)
const activityTypes = ref([])

// 海报上传相关状态
const uploading = ref(false)
const uploadProgress = ref(0)
const showPreview = ref(false)

const isEdit = computed(() => !!route.params.id)

const form = reactive({
  id: null,
  activityName: '',
  activityDescription: '',
  activityType: '',
  startTime: '',
  endTime: '',
  location: '',
  organizer: '',
  contactPerson: '',
  contactPhone: '',
  maxParticipants: null,
  registrationStartTime: '',
  registrationEndTime: '',
  posterUrl: ''
})

const rules = {
  activityName: [
    { required: true, message: '请输入活动名称', trigger: 'blur' },
    { max: 100, message: '活动名称最多100个字符', trigger: 'blur' }
  ],
  activityType: [
    { required: true, message: '请选择活动类型', trigger: 'change' }
  ],
  startTime: [
    { required: true, message: '请选择活动开始时间', trigger: 'change' }
  ],
  endTime: [
    { required: true, message: '请选择活动结束时间', trigger: 'change' }
  ],
  location: [
    { required: true, message: '请输入活动地点', trigger: 'blur' }
  ],
  organizer: [
    { required: true, message: '请输入主办方', trigger: 'blur' }
  ],
  contactPerson: [
    { required: true, message: '请输入联系人', trigger: 'blur' }
  ],
  contactPhone: [
    { required: true, message: '请输入联系电话', trigger: 'blur' }
  ],
  registrationStartTime: [
    { required: true, message: '请选择报名开始时间', trigger: 'change' }
  ],
  registrationEndTime: [
    { required: true, message: '请选择报名结束时间', trigger: 'change' }
  ]
}

onMounted(async () => {
  await loadActivityTypes()
  
  // 编辑模式，加载活动详情
  if (isEdit.value) {
    await loadActivityDetail()
  }
})

const loadActivityTypes = async () => {
  try {
    // 传递较大的 pageSize 以获取所有类型
    const res = await getActivityTypes({ pageNum: 1, pageSize: 100 })
    if (res.code === 200) {
      // 后端返回的是 PageInfo 对象，列表数据在 list 字段中
      if (res.data && Array.isArray(res.data.list)) {
        activityTypes.value = res.data.list
      } else if (Array.isArray(res.data)) {
        // 兼容直接返回数组的情况
        activityTypes.value = res.data
      } else {
        activityTypes.value = []
      }
    }
  } catch (error) {
    console.error('加载活动类型失败:', error)
  }
}

const loadActivityDetail = async () => {
  try {
    const res = await getActivityDetail(route.params.id)
    if (res.code === 200) {
      Object.assign(form, res.data)
    }
  } catch (error) {
    ElMessage.error('加载活动详情失败')
    router.back()
  }
}

const handleSubmit = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    
    submitting.value = true
    try {
      const apiMethod = isEdit.value ? updateActivity : createActivity
      const res = await apiMethod(form)
      
      if (res.code === 200) {
        ElMessage.success(isEdit.value ? '更新成功' : '创建成功')
        router.push('/activities')
      }
    } catch (error) {
      console.error('提交失败:', error)
    } finally {
      submitting.value = false
    }
  })
}

const handleCancel = () => {
  router.back()
}

// ==================== 海报上传相关方法 ====================

/**
 * 处理文件选择变化
 */
const handleFileChange = async (file) => {
  const rawFile = file.raw
  
  // 文件验证
  if (!validateFile(rawFile)) {
    return
  }
  
  // 开始上传
  await uploadPosterFile(rawFile)
}

/**
 * 验证文件类型和大小
 */
const validateFile = (file) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
  const maxSize = 50 * 1024 * 1024 // 50MB
  
  if (!allowedTypes.includes(file.type)) {
    ElMessage.error('只支持 jpg、png、gif、webp 格式的图片')
    return false
  }
  
  if (file.size > maxSize) {
    ElMessage.error('图片大小不能超过 50MB')
    return false
  }
  
  return true
}

/**
 * 上传海报文件到服务器
 */
const uploadPosterFile = async (file) => {
  try {
    uploading.value = true
    uploadProgress.value = 0
    
    // 模拟上传进度
    const progressInterval = setInterval(() => {
      if (uploadProgress.value < 90) {
        uploadProgress.value += 10
      }
    }, 100)
    
    // 调用上传API (purpose 设置为 activity_poster)
    const res = await uploadFile(file, 'activity_poster')
    
    clearInterval(progressInterval)
    
    if (res.code === 200 && res.data) {
      uploadProgress.value = 100
      form.posterUrl = res.data.url
      ElMessage.success('海报上传成功')
      
      // 延迟重置进度条
      setTimeout(() => {
        uploading.value = false
        uploadProgress.value = 0
      }, 1000)
    } else {
      throw new Error(res.message || '上传失败')
    }
  } catch (error) {
    uploading.value = false
    uploadProgress.value = 0
    console.error('上传失败:', error)
    ElMessage.error('上传失败: ' + (error.message || '未知错误'))
  }
}

/**
 * 预览海报大图
 */
const previewPoster = () => {
  if (form.posterUrl) {
    showPreview.value = true
  }
}

/**
 * 删除海报
 */
const removePoster = () => {
  ElMessageBox.confirm('确定要删除海报吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    form.posterUrl = ''
    ElMessage.success('已删除海报')
  }).catch(() => {
    // 用户取消删除
  })
}
</script>

<style scoped lang="scss">
.activity-form-page {
  max-width: 900px;
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

.card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.15);
  padding: 24px;
}

.text-center {
  text-align: center;
}

// ==================== 海报上传样式 ====================

.poster-upload-container {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.url-input-section {
  margin-bottom: 16px;
  width: 100%;
}

.upload-section {
  margin-top: 0;
  width: 100%;
}

.poster-uploader {
  :deep(.el-upload) {
    width: 100%;
  }

  :deep(.el-upload-dragger) {
    width: 100%;
    height: 240px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 2px dashed #d1d5db;
    border-radius: 8px;
    background-color: #fafafa;
    transition: all 0.3s;
    padding: 0;

    &:hover {
      border-color: #409eff;
      background-color: #f0f9ff;
    }
  }
}

.upload-placeholder {
  text-align: center;
  
  .upload-icon {
    color: #8b5cf6;
    margin-bottom: 12px;
  }
  
  .upload-text {
    font-size: 14px;
    color: #374151;
    margin-bottom: 8px;
    font-weight: 500;
  }
  
  .upload-hint {
    font-size: 12px;
    color: #9ca3af;
  }
}

.image-preview {
  position: relative;
  width: 100%;
  height: 240px;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    display: block;
    background-color: #f9fafb;
  }
  
  .image-mask {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 20px;
    opacity: 0;
    transition: opacity 0.3s;
    
    &:hover {
      opacity: 1;
    }
    
    .el-icon {
      color: #fff;
      cursor: pointer;
      font-size: 24px;
      transition: transform 0.2s;
      
      &:hover {
        transform: scale(1.2);
      }
    }
  }
}

.poster-actions {
  margin-top: 12px;
  display: flex;
  gap: 8px;
}
</style>
