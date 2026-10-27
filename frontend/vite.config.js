import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Must match FRONTEND_URL in backend/config/.env (CORS)
  server: { port: 5173, strictPort: true },
})
