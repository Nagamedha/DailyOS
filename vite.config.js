// vite.config.js — Build tool configuration
// Vite is the tool that runs the local dev server and bundles the app for production.
// @vitejs/plugin-react enables React JSX support.
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})
