/**
 * 格式化图片URL
 * 将图片URL中的主机名替换为当前访问的主机名
 * 解决局域网/热点环境下，后端返回的IP可能无法访问的问题
 */
export const formatImageUrl = (url) => {
    if (!url) return ''
    try {
        // 如果是相对路径，直接返回
        if (!url.startsWith('http')) return url

        const urlObj = new URL(url)
        // 获取当前页面访问的 hostname (例如 192.168.43.100)
        const currentHostname = window.location.hostname

        // 如果当前是在局域网访问（非localhost），则强制替换图片URL的IP为当前访问IP
        // 保持端口不变（MinIO通常是9000）
        if (currentHostname !== 'localhost' && currentHostname !== '127.0.0.1') {
            urlObj.hostname = currentHostname
        }

        return urlObj.toString()
    } catch (e) {
        console.error('图片URL格式化失败:', e)
        return url
    }
}
