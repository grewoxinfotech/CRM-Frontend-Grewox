import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5174,
    allowedHosts: ["biaxial-lovella-semisuburban.ngrok-free.dev"],
    proxy: {
      '/api': {
        target: 'http://localhost:5351',
        changeOrigin: true,
        secure: false,
      }
    },
    hmr: {
      clientPort: 443,
    }
  }
})

