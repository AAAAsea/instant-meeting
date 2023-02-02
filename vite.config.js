import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import electron from 'vite-electron-plugin'
import path from 'path'

export default defineConfig({
  plugins: [
    react(),
    electron({
      include: [
        'electron',
      ],
    }),
  ],
  base: '/', // 防止部署后二级路由无法访问
  build: {
    assetsDir: '/'
  },
  server: {
    open: true,
    port: 3000,
    // host: '0.0.0.0'
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      "simple-peer": "simple-peer/simplepeer.min.js"
    }
  }
})
