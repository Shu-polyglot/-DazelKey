import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import basicSsl from '@vitejs/plugin-basic-ssl'

const base = process.env.VERCEL ? '/' : '/-DazelKey/'

export default defineConfig({
  base,
  server: {
    // LAN-reachable (not just localhost) so a phone on the same Wi-Fi
    // can open the dev server directly -- `npm run dev` then prints the
    // Network URL to use. HTTPS (self-signed, via basicSsl below) is
    // what makes that actually useful rather than just loading: camera
    // capture, clipboard (Copy Invite Link), and PWA installability all
    // require a secure context, which a plain http:// LAN address isn't.
    // The phone will show a one-time "not trusted" warning for the
    // self-signed cert -- that's expected, proceed through it.
    host: true,
  },
  plugins: [
    react(),
    basicSsl(),
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
