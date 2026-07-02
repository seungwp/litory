import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  // GitHub Pages serves the site under the repository sub-path
  base: '/HUSS_Hackathon_Yaho_website/',
  plugins: [react()],
})
