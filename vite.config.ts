import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";

export default defineConfig({
  plugins: [svelte()],
  build: {
    lib: {
      entry: "src/main.ts",
      name: "VoltagePayments",
      formats: ["es", "umd"],
      fileName: (format) =>
        `voltage-payments.${format === "es" ? "esm" : format}.js`,
    },
    rollupOptions: {
      // Bundle everything for CDN distribution
      external: [],
      output: {
        globals: {},
      },
    },
    target: "es2017",
    minify: "terser",
    sourcemap: true,
  },
  define: {
    // Remove development code in production
    "process.env.NODE_ENV": '"production"',
  },
}); 