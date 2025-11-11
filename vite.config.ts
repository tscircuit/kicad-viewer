import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [react()],
	define: {
		global: {},
	},
	// Use "/" for Vercel (default), or override with VITE_BASE_URL env var for GitHub Pages
	base: process.env.VITE_BASE_URL || "/",
	server: {
		proxy: {
			"/api": {
				target: "https://kicad-mod-cache.tscircuit.com/",
				changeOrigin: true,
				rewrite: (path) => path.replace(/^\/api/, ""),
			},
		},
	},
});
