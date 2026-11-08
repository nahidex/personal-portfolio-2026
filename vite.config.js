import { defineConfig } from "vite";

export default defineConfig({
  base: "/personal-portfolio-2026/",
  server: {
    port: 3000,
    open: false,
  },
  build: {
    outDir: "dist",
    assetsDir: "assets",
    sourcemap: true,
  },
});
