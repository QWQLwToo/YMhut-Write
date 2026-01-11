import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()], // 启用 Vue 插件，修复报错的核心
  base: './',       // 确保 Electron 打包后路径正确
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'), // 设置 @ 指向 src 目录
    },
  },
  server: {
    port: 5173,     // 固定端口，方便 Electron 连接
    strictPort: true,
  }
})