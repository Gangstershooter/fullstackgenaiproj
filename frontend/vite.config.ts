import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    hmr: {
      protocol: "ws",
      host: "localhost",
      clientPort: 5173,
      timeout: 30000,
    },
    watch: {
      usePolling: true,
    },
  },
})
