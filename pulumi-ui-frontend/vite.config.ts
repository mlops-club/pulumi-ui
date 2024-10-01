import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      }
    }
  },
  build: {
    outDir: 'dist',
    assetsDir: 'static/static',
    rollupOptions: {
      output: {
        entryFileNames: 'static/static/[name]-[hash].js',
        chunkFileNames: 'static/static/[name]-[hash].js',
        assetFileNames: 'static/static/[name]-[hash].[ext]'
      }
    }
  },
  base: '/static/'
})
