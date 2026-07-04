import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages with a custom domain serves from the root, so base is '/'.
// If you ever drop the custom domain and use https://<user>.github.io/coffeemap/,
// change this to '/coffeemap/'.
export default defineConfig({
  base: '/',
  plugins: [react()],
})
