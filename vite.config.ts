import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  base: '/cspu-ai/',
  plugins: [vue(), tailwindcss()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    proxy: {
      '/api': {
        target: 'https://0e25-82-215-118-45.ngrok-free.app',
        changeOrigin: true,
        headers: {
          'ngrok-skip-browser-warning': 'true',
        },
      },
    },
  },
})
