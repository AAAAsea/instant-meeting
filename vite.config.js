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
  server: {
    open: true,
    port: 3000,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      "simple-peer": "simple-peer/simplepeer.min.js",
    }
  },
  // base: '/',
  // root: '/',
  build: {
    rollupOptions: {
      input: {
        remote: path.resolve(__dirname, 'src/remote_control_page/index.html'),
        index: path.resolve('./index.html'),
      },
      output: {
        chunkFileNames: 'static/js/[name]-[hash].js',
        entryFileNames: 'static/js/[name]-[hash].js',
        assetFileNames: 'static/[ext]/[name]-[hash].[ext]',
      }
    }
  }
})
