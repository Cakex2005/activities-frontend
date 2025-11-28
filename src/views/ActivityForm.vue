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
          <el-input v-model="form.posterUrl" placeholder="请输入海报URL或上传图片" />
          <div style="margin-top: 8px; color: #6b7280; font-size: 12px;">
            提示: 可以输入图片URL,或通过文件上传功能上传
          </div>
        </el-form-item>

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
import { ElMessage } from 'element-plus'
import { getActivityTypes } from '@/api/activityType'
import { createActivity, updateActivity, getActivityDetail } from '@/api/activity'

const route = useRoute()
const router = useRouter()

const formRef = ref(null)
const submitting = ref(false)
const activityTypes = ref([])

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
</style>
