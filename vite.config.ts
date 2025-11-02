import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig(({ command }) => {
	const isVercel = "1";
	const base =
		command === "serve" || isVercel
			? "/"
			: "https://tscircuit.github.io/kicad-viewer";

	return {
		plugins: [react()],
		define: {
			global: {},
		},
		base,
		server: {
			proxy: {
				"/api": {
					target: "https://kicad-mod-cache.tscircuit.com/",
					changeOrigin: true,
					rewrite: (path) => path.replace(/^\/api/, ""),
				},
			},
		},
	};
});
