import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/anthropic': {
        target: 'https://api.anthropic.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/anthropic/, ''),
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) {
            return
          }

          if (id.includes('ethers')) {
            return 'ethers'
          }

          if (id.includes('react-router-dom')) {
            return 'router'
          }

          if (id.includes('react-hot-toast')) {
            return 'toast'
          }

          return 'vendor'
        },
      },
    },
  },
})
