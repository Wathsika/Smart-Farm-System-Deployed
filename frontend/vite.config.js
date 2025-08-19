import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc"; // prefer swc for faster builds
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    environment: "jsdom",
    setupFiles: "./src/test/setup.js",
  },
});
