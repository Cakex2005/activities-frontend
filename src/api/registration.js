import request from '@/utils/request'

/**
 * 获取报名列表
 */
export function getRegistrationList(params) {
    return request({
        url: '/registration/list',
        method: 'get',
        params
    })
}

/**
 * 学生签到(管理员操作)
 * 根据文档,管理员签到使用activityId和studentPhone
 */
export function checkInStudent(data) {
    return request({
        url: '/registration/checkin',
        method: 'post',
        data
    })
}

/**
 * 获取活动报名统计
 */
export function getRegistrationStats(activityId) {
    return request({
        url: `/registration/statistics/${activityId}`,
        method: 'get'
    })
}

/**
 * 取消报名
 */
export function cancelRegistration(registrationId) {
    return request({
        url: `/registration/cancel/${registrationId}`,
        method: 'post'
    })
}

/**
 * 生成签到二维码（管理端展示）
 */
export function generateCheckInQRCode(activityId, baseUrl = '') {
    return request({
        url: `/registration/${activityId}/qrcode`,
        method: 'get',
        params: baseUrl ? { baseUrl } : {}
    })
}

/**
 * 批量签到
 */
export function batchCheckIn(activityId, phoneNumbers) {
    return request({
        url: '/registration/batch-checkin',
        method: 'post',
        params: {
            activityId,
            phoneNumbers: phoneNumbers.join(',') // 转换为逗号分隔字符串，适配Spring Boot @RequestParam
        }
    })
}

/**
 * 获取报名详情
 */
export function getRegistrationDetail(registrationId) {
    return request({
        url: `/registration/${registrationId}`,
        method: 'get'
    })
}
