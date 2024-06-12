import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    global: {},
  },
  base: "https://tscircuit.github.io/kicad-viewer",
  server: {
    proxy: {
      "/api": {
        target: "https://kicad-mod-cache.tscircuit.com/",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
})
