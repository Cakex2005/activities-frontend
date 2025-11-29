import axios from 'axios'
import { ElMessage } from 'element-plus'
import { getToken, removeToken } from './auth'
import router from '@/router'

const request = axios.create({
    baseURL: '/api',
    timeout: 10000
})

// 请求拦截器
request.interceptors.request.use(
    config => {
        // 自动添加 Token
        const token = getToken()
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`
        }

        // 添加请求日志
        console.log(`[API请求] ${config.method.toUpperCase()} ${config.url}`, {
            参数: config.params || config.data,
            headers: config.headers
        })

        return config
    },
    error => {
        console.error('[API请求失败]', error)
        return Promise.reject(error)
    }
)

// 响应拦截器
request.interceptors.response.use(
    response => {
        const res = response.data

        // 添加响应日志
        console.log(`[API响应] ${response.config.method.toUpperCase()} ${response.config.url}`, {
            状态码: res.code,
            消息: res.message,
            数据: res.data
        })

        // 后端统一返回格式: { code, message, data }
        if (res.code === 200) {
            return res
        }

        // 业务错误处理
        ElMessage.error(res.message || '操作失败')
        return Promise.reject(new Error(res.message || 'Error'))
    },
    error => {
        console.error('[API响应错误]', {
            URL: error.config?.url,
            方法: error.config?.method?.toUpperCase(),
            状态码: error.response?.status,
            错误信息: error.response?.data?.message || error.message
        })

        if (error.response) {
            const { status, data } = error.response

            // Token 过期或无效，跳转登录
            if (status === 401 || data?.code === 4006 || data?.code === 4007) {
                ElMessage.error('登录已过期，请重新登录')
                removeToken()
                router.push('/login')
                return Promise.reject(error)
            }

            // 其他错误
            const message = data?.message || '请求失败'
            ElMessage.error(message)
        } else {
            ElMessage.error('网络错误，请检查您的网络连接')
        }

        return Promise.reject(error)
    }
)

export default request
