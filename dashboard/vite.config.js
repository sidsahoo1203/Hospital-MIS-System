import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Must match DASHBOARD_URL in backend/config/.env (CORS)
  server: { port: 5174, strictPort: true },
})
