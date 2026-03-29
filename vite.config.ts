import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    assetsInlineLimit: 4096,       // inline assets < 4 KB as base64
    chunkSizeWarningLimit: 1000,   // warn at 1 MB chunks
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React runtime
          'vendor-react': ['react', 'react-dom'],
          // Animation library
          'vendor-framer': ['framer-motion'],
          // Form library
          'vendor-forms': ['react-hook-form'],
          // Icon library
          'vendor-icons': ['lucide-react'],
        },
      },
    },
  },
})
