import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    host: true,
    proxy: {
      '/api': {
        target: mode === 'production' 
          ? '/api'  // 프로덕션에서는 같은 도메인 사용
          : 'http://localhost:5000', // 개발 환경에서는 로컬 서버로
        changeOrigin: true,
        secure: false,
      },
      '/ws': {  // WebSocket 프록시 설정 추가
        target: mode === 'production'
          ? 'ws://localhost:5000'
          : 'ws://localhost:5000',
        ws: true,
        changeOrigin: true
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: false
  }
}))