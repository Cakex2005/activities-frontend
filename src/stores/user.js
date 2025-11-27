import { defineStore } from 'pinia'
import { ref } from 'vue'
import { login, logout, getAdminInfo } from '@/api/admin'
import { setToken, removeToken } from '@/utils/auth'

export const useUserStore = defineStore('user', () => {
    const userInfo = ref(null)
    const token = ref('')

    /**
     * 登录
     */
    async function userLogin(loginData) {
        try {
            const res = await login(loginData)
            if (res.code === 200) {
                token.value = res.data.token
                setToken(res.data.token)
                userInfo.value = res.data
                return res
            }
        } catch (error) {
            throw error
        }
    }

    /**
     * 登出
     */
    async function userLogout() {
        try {
            await logout()
        } catch (error) {
            console.error('登出失败:', error)
        } finally {
            token.value = ''
            userInfo.value = null
            removeToken()
        }
    }

    /**
     * 获取用户信息
     */
    async function getUserInfo() {
        try {
            const res = await getAdminInfo()
            if (res.code === 200) {
                userInfo.value = res.data
                return res.data
            }
        } catch (error) {
            throw error
        }
    }

    return {
        userInfo,
        token,
        userLogin,
        userLogout,
        getUserInfo
    }
})
