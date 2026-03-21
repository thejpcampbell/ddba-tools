import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Vercel serves from root — no base path needed
// (GitHub Pages needed /ddba-tools/ but Vercel does not)
export default defineConfig({
  plugins: [react()],
})
