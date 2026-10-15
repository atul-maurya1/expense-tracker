import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'https://expense-tracker-f8fs.onrender.com',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
