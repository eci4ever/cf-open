import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { cloudflare } from "@cloudflare/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import path from "node:path";

export default defineConfig({
	plugins: [
		tanstackRouter({
			target: "react",
			autoCodeSplitting: true,
			routesDirectory: "./src/web/routes",
			generatedRouteTree: "./src/web/routeTree.gen.ts",
		}),
		tailwindcss(),
		react(),
		cloudflare(),
	],
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src/web"),
		},
	},
});
