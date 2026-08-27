import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

const base = process.env.VERCEL ? '/' : '/-DazelKey/'

export default defineConfig({
  base,
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon-16.png', 'favicon-32.png', 'apple-touch-icon-180.png'],
      manifest: {
        name: 'DazelKey',
        short_name: 'DazelKey',
        description: 'Unlock Unlived Moments',
        start_url: base,
        scope: base,
        display: 'standalone',
        background_color: '#05070d',
        theme_color: '#05070d',
        icons: [
          { src: 'pwa-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'pwa-512-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
    }),
  ],
})
