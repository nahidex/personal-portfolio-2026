import { defineConfig } from "vite";

export default defineConfig({
  // Custom domain serves from the root, not a /repo-name/ subpath.
  base: "/",
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
