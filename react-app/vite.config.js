import { defineConfig } from 'vite'import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  // GitHub Pages serves this app from a project-page subpath
  // (https://<user>.github.io/dazelkey/), so built <script>/<link>
  // URLs need that prefix there or they 404 against the domain root.
  // Vercel deploys to its own domain root instead, so the same prefix
  // there 404s every asset the opposite way -- `VERCEL` is set on every
  // build Vercel runs (and only there), which is what tells the two
  // apart without needing a second config file.
  base: process.env.VERCEL ? '/' : '/-DazelKey/',
  plugins: [react()],
})
