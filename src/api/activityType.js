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

/**
 * 获取活动类型详情
 */
export function getActivityTypeDetail(typeId) {
    return request({
        url: `/activity-types/${typeId}`,
        method: 'get'
    })
}

/**
 * 批量删除活动类型
 */
export function batchDeleteActivityTypes(typeIds) {
    return request({
        url: '/activity-types/batch-delete',
        method: 'post',
        data: typeIds
    })
}

/**
 * 检查类型编码是否存在
 */
export function checkTypeCodeExists(typeCode, excludeId = null) {
    return request({
        url: '/activity-types/check/type-code',
        method: 'get',
        params: { typeCode, excludeId }
    })
}

/**
 * 检查类型名称是否存在
 */
export function checkTypeNameExists(typeName, excludeId = null) {
    return request({
        url: '/activity-types/check/type-name',
        method: 'get',
        params: { typeName, excludeId }
    })
}
