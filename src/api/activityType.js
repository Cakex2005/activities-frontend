import request from '@/utils/request'

/**
 * 获取活动类型列表
 */
export function getActivityTypes(params) {
    return request({
        url: '/activity-types/list',
        method: 'get',
        params
    })
}

/**
 * 创建活动类型
 */
export function createActivityType(data) {
    return request({
        url: '/activity-types/create',
        method: 'post',
        data
    })
}

/**
 * 更新活动类型
 */
export function updateActivityType(data) {
    return request({
        url: `/activity-types/${data.id}`,
        method: 'put',
        data
    })
}

/**
 * 删除活动类型
 */
export function deleteActivityType(typeId) {
    return request({
        url: `/activity-types/${typeId}`,
        method: 'delete'
    })
}
