import request from '@/utils/request'

/**
 * 管理员登录
 */
export function login(data) {
    return request({
        url: '/admin/login',
        method: 'post',
        data
    })
}

/**
 * 管理员登出
 */
export function logout() {
    return request({
        url: '/admin/logout',
        method: 'post'
    })
}

/**
 * 获取管理员信息
 */
export function getAdminInfo() {
    return request({
        url: '/admin/info',
        method: 'get'
    })
}
