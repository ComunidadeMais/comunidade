import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  assetsInclude: ['**/*.PNG', '**/*.png'],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: [
            'react',
            'react-dom',
            'react-router-dom',
            '@emotion/react',
            '@emotion/styled',
            'axios'
          ],
          mui: [
            '@mui/material',
            '@mui/icons-material'
          ]
        }
      }
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
      '/uploads': {
        target: process.env.VITE_UPLOADS_URL || 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      }
    },
  },
})
