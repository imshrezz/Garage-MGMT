import path from "path";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

import checker from "vite-plugin-checker";
// https://vite.dev/config/
export default defineConfig({
  plugins: [checker({ typescript: false }), react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: { chunkSizeWarningLimit: 1600 },
});
