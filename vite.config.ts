import react from "@vitejs/plugin-react";
import path from "path";

// https://vite.dev/config/
export default {
  plugins: [
    react(),
    // The chef-dev plugin was removed for simplicity
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
};
