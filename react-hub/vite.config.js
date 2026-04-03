import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // When built, assets live at /hub/ within the static site
  base: "/hub/",
  server: {
    port: 5174,
    host: true,
  },
  build: {
    outDir: "../hub",
    emptyOutDir: true,
  },
});
