import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
// biome-ignore lint/style/useNodejsImportProtocol: this is bun
import path from "path";
import { defineConfig } from "vite";

export default defineConfig({
	plugins: [react(), tailwindcss()],
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
		},
	},
});
