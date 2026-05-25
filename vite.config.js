import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [
    react({
      // Vite 8 + @vitejs/plugin-react v6 — no babel config needed.
      // Leaving options empty uses the correct rolldown-based transform.
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  // Suppress the chunk size warning — expected for a full app without code splitting
  build: {
    chunkSizeWarningLimit: 1600,
  },
})
