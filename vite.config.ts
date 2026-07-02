import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  // GitHub Pages serves the site under the repository sub-path
  base: '/litory/',
  plugins: [react()],
  server: {
    // dev-only: forward API calls to the local Spring Boot backend (no CORS)
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
})
