import request from '@/utils/request'

/**
 * 上传文件
 */
export function uploadFile(file, purpose = 'general') {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('purpose', purpose)

    return request({
        url: '/file/upload',
        method: 'post',
        data: formData,
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    })
}

/**
 * 批量上传文件
 */
export function uploadFiles(files, purpose = 'general') {
    const formData = new FormData()
    files.forEach(file => formData.append('files', file))
    formData.append('purpose', purpose)

    return request({
        url: '/file/upload/batch',
        method: 'post',
        data: formData,
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    })
}

/**
 * 获取文件访问URL
 */
export function getFileUrl(fileId) {
    return request({
        url: `/file/url/${fileId}`,
        method: 'get'
    })
}

/**
 * 删除文件
 */
export function deleteFile(fileId) {
    return request({
        url: `/file/${fileId}`,
        method: 'delete'
    })
}

/**
 * Base64文件上传
 */
export function uploadBase64(base64Data, fileName, purpose = 'general') {
    return request({
        url: '/file/upload/base64',
        method: 'post',
        data: base64Data,
        params: { fileName, purpose }
    })
}
