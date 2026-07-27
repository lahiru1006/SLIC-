import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  server: {
    port: 5173
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt', // Auto update වෙනුවට user ගෙන් අහන්න 'prompt' කළා
      includeAssets: ['slic.png', 'favicon.ico'],
      devOptions: {
        enabled: true
      },
      manifest: {
        name: 'SLIC App',
        short_name: 'SLIC',
        description: 'SLIC Web Application',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'slic.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'slic.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ]
})