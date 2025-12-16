import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  logLevel: 'info',
  plugins: [
    vue(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    host: '0.0.0.0',
    hmr: {
      host: 'localhost',
      port: 5173
    },
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            const timestamp = new Date().toLocaleTimeString('zh-CN', { hour12: false })
            console.log(`[${timestamp}] [请求] ${req.method} ${req.url}`)
          })
          proxy.on('proxyRes', (proxyRes, req, res) => {
            const timestamp = new Date().toLocaleTimeString('zh-CN', { hour12: false })
            console.log(`[${timestamp}] [响应] ${req.method} ${req.url}`)
          })
          proxy.on('error', (err, req, res) => {
            const timestamp = new Date().toLocaleTimeString('zh-CN', { hour12: false })
            console.error(`[${timestamp}] [错误] ${req.method} ${req.url} - ${err.message}`)
          })
        }
      }
    }
  }
})
