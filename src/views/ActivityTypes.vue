<template>
  <div class="activity-types-page">
    <div class="page-header">
      <h2>活动类型管理</h2>
      <el-button type="primary" @click="showDialog(null)">+ 新增类型</el-button>
    </div>

    <div class="card">
      <el-table :data="types" v-loading="loading" style="width: 100%">
        <el-table-column prop="typeCode" label="类型编码" width="200" />
        <el-table-column prop="typeName" label="类型名称" width="200" />
        <el-table-column prop="description" label="描述" min-width="300" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.isEnabled === 1 ? 'success' : 'danger'">
              {{ row.isEnabled === 1 ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180">
          <template #default="{ row }">
            <el-button type="primary" text @click="showDialog(row)">编辑</el-button>
            <el-button type="danger" text @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 新增/编辑对话框 -->
    <el-dialog
      :title="dialogForm.id ? '编辑类型' : '新增类型'"
      v-model="dialogVisible"
      width="500px"
    >
      <el-form
        ref="formRef"
        :model="dialogForm"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item label="类型编码" prop="typeCode">
          <el-input v-model="dialogForm.typeCode" :disabled="!!dialogForm.id" placeholder="如: ACADEMIC" />
        </el-form-item>
        <el-form-item label="类型名称" prop="typeName">
          <el-input v-model="dialogForm.typeName" placeholder="如: 学术讲座" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="dialogForm.description" type="textarea" :rows="3" />
        </el-form-item>
        <el-form-item label="状态" prop="isEnabled">
          <el-radio-group v-model="dialogForm.isEnabled">
            <el-radio :label="1">启用</el-radio>
            <el-radio :label="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSubmit">
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  getActivityTypes,
  createActivityType,
  updateActivityType,
  deleteActivityType
} from '@/api/activityType'

const loading = ref(false)
const submitting = ref(false)
const types = ref([])
const dialogVisible = ref(false)
const formRef = ref(null)

const dialogForm = reactive({
  id: null,
  typeCode: '',
  typeName: '',
  description: '',
  isEnabled: 1
})

const rules = {
  typeCode: [
    { required: true, message: '请输入类型编码', trigger: 'blur' },
    { pattern: /^[A-Z_]+$/, message: '编码只能包含大写字母和下划线', trigger: 'blur' }
  ],
  typeName: [
    { required: true, message: '请输入类型名称', trigger: 'blur' }
  ],
  isEnabled: [
    { required: true, message: '请选择状态', trigger: 'change' }
  ]
}

onMounted(() => {
  loadTypes()
})

const loadTypes = async () => {
  loading.value = true
  try {
    const res = await getActivityTypes({ pageNum: 1, pageSize: 1000 })
    if (res.code === 200) {
      types.value = res.data.list || []
    }
  } catch (error) {
    console.error('加载类型失败:', error)
  } finally {
    loading.value = false
  }
}

const showDialog = (row) => {
  if (row) {
    Object.assign(dialogForm, row)
  } else {
    Object.assign(dialogForm, {
      id: null,
      typeCode: '',
      typeName: '',
      description: '',
      isEnabled: 1
    })
  }
  dialogVisible.value = true
}

const handleSubmit = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    
    submitting.value = true
    try {
      const apiMethod = dialogForm.id ? updateActivityType : createActivityType
      const res = await apiMethod(dialogForm)
      
      if (res.code === 200) {
        ElMessage.success(dialogForm.id ? '更新成功' : '创建成功')
        dialogVisible.value = false
        loadTypes()
      }
    } catch (error) {
      console.error('提交失败:', error)
    } finally {
      submitting.value = false
    }
  })
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(`确定要删除类型"${row.typeName}"吗？`, '警告', {
      confirmButtonText: '确定删除',
      cancelButtonText: '取消',
      type: 'error'
    })
    
    const res = await deleteActivityType(row.id)
    if (res.code === 200) {
      ElMessage.success('删除成功')
      loadTypes()
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败:', error)
    }
  }
}
</script>

<style scoped lang="scss">
.activity-types-page {
  max-width: 1200px;
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
  padding: 16px;
}
</style>
