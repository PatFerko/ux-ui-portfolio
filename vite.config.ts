import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    ViteImageOptimizer({
      png: { quality: 80 },
      jpeg: { quality: 80 },
      webp: { quality: 80, lossless: false },
      avif: { quality: 65, lossless: false },
    }),
  ],
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
