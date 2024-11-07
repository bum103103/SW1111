import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    strictPort: false,
    host: true,
    middleware: [
      (req, res, next) => {
        // SPA의 client-side routing을 위한 설정
        if (req.url.includes('/B/')) {
          req.url = '/'
        }
        next()
      }
    ]
  },
  preview: {
    port: 5173,
  }
})