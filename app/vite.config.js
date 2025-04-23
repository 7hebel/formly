import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  server: {
    host: '0.0.0.0',
    port: 5100,
    allowedHosts: ['all', "*", "formly-node.hebel.smallhost.pl", "formly.cc"],
  },
  plugins: [react()],
})
