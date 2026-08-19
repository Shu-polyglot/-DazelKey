import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  // Served from https://<user>.github.io/bucket-list-app/ (a project
  // page, not a user/org root page), so asset URLs need this prefix --
  // without it every built <script>/<link> resolves against the domain
  // root and 404s.
  base: '/bucket-list-app/',
  plugins: [react()],
})
