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
 * 学生签到
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
        url: `/registration/stats/${activityId}`,
        method: 'get'
    })
}
