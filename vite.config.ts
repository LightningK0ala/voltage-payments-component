import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";

export default defineConfig({
  plugins: [svelte({ emitCss: false })],
  server: {
    strictPort: true, // Fail if port is already in use instead of trying another
    proxy: {
      // Proxy Voltage API calls to avoid CORS issues
      "/api/voltage": {
        target: "https://voltageapi.com/v1",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/voltage/, ""),
        configure: (proxy, options) => {
          proxy.on("error", (err, req, res) => {
            console.log("Voltage API proxy error:", err);
          });
          proxy.on("proxyReq", (proxyReq, req, res) => {
            console.log("Proxying Voltage API request:", req.method, req.url);
          });
        },
      },
    },
  },
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
