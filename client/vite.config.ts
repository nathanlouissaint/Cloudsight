import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { visualizer } from "rollup-plugin-visualizer";

export default defineConfig({
  plugins: [
    react(),
    visualizer({
      filename: "dist/stats.html",
      gzipSize: true,
      brotliSize: true,
      open: false,
    }),
  ],

  build: {
    chunkSizeWarningLimit: 1000,

    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules/react")) {
            return "react";
          }

          if (id.includes("@tanstack/react-query")) {
            return "query";
          }

          if (id.includes("recharts")) {
            return "charts";
          }

          if (id.includes("framer-motion")) {
            return "animation";
          }

          if (id.includes("node_modules")) {
            return "vendor";
          }
        },
      },
    },
  },
});
