import request from '@/utils/request'

/**
 * 创建活动
 */
export function createActivity(data) {
    return request({
        url: '/activity/create',
        method: 'post',
        data
    })
}

/**
 * 更新活动
 */
export function updateActivity(data) {
    return request({
        url: '/activity/update',
        method: 'put',
        data
    })
}

/**
 * 删除活动
 */
export function deleteActivity(activityId) {
    return request({
        url: `/activity/${activityId}`,
        method: 'delete'
    })
}

/**
 * 发布活动
 */
export function publishActivity(activityId) {
    return request({
        url: `/activity/publish/${activityId}`,
        method: 'post'
    })
}

/**
 * 取消活动
 */
export function cancelActivity(activityId) {
    return request({
        url: `/activity/cancel/${activityId}`,
        method: 'post'
    })
}

/**
 * 获取活动详情
 */
export function getActivityDetail(activityId) {
    return request({
        url: `/activity/${activityId}`,
        method: 'get'
    })
}

/**
 * 查询活动列表(分页)
 */
export function getActivityList(params) {
    return request({
        url: '/activity/list',
        method: 'get',
        params
    })
}

/**
 * 更新活动状态
 */
export function updateActivityStatus(data) {
    return request({
        url: '/activity/status',
        method: 'put',
        data
    })
}


/**
 * 获取活动统计信息(前端聚合)
 */
export function getActivityStats() {
    return request({
        url: '/activity/list',
        method: 'get',
        params: { pageNum: 1, pageSize: 1000 }
    })
}

/**
 * AI生成活动海报
 */
export function generateAIPoster(data) {
    return request({
        url: '/file/ai/generate-poster',
        method: 'post',
        data
    })
}
