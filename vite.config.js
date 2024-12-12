import { defineConfig } from "vite";

export default defineConfig({
  optimizeDeps: {
    include: ["ol"], // Ensure `ol` is optimized for ES modules
  },
  server: {
    open: true, // Automatically open in the browser
  },
});
