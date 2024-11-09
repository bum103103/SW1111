// vite.config.js
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
  port: 6173,
  host: true,
  proxy: {
    '/api': {
      target: 'http://localhost:8080',
      changeOrigin: true,
      secure: false,
      ws: false,
      rewrite: (path) => path.replace(/^\/api/, '')
    },
    '/ws': {
      target: 'ws://localhost:8080',
      ws: true,
      changeOrigin: true,
      secure: false,
      rewrite: (path) => path.replace(/^\/ws/, '')
    }
  },
  cors: {
    origin: ['http://localhost:6173', 'http://localhost:8080'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
  }
},
build: {
  outDir: 'dist',
  sourcemap: false,
  rollupOptions: {
    output: {
      manualChunks: {
        vendor: ['react', 'react-dom', 'react-router-dom'],
      }
    }
  }
},
optimizeDeps: {
  include: ['react', 'react-dom', 'react-router-dom']
},
preview: {
  port: 6173,
  host: true
}
}))