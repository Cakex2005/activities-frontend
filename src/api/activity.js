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
 * 获取活动统计信息(根据状态聚合)
 * 注意: 需要在前端自行聚合列表数据或使用其他统计接口
 */
export function getActivityStats() {
    // 文档中没有 /activity/stats 接口
    // 需要通过查询列表并聚合数据来实现统计
    return request({
        url: '/activity/list',
        method: 'get',
        params: { pageSize: 1000 } // 获取全部数据用于统计
    })
}
