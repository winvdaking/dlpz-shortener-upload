import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Optimisations de build
    target: "esnext",
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom"],
          animations: ["framer-motion"],
          ui: ["lucide-react"],
          shaders: ["@paper-design/shaders-react"],
        },
      },
    },
    // Optimisation des assets
    assetsInlineLimit: 4096,
    chunkSizeWarningLimit: 1000,
  },
  server: {
    // Optimisations de développement
    hmr: {
      overlay: false,
    },
    // Configuration pour éviter les problèmes de permissions
    fs: {
      strict: false,
    },
    // Proxy pour l'API backend
    proxy: {
      "/api": {
        target: "http://localhost:3002",
        changeOrigin: true,
        secure: false,
        configure: (proxy, _options) => {
          proxy.on("error", (err, _req, _res) => {
            console.log("Erreur proxy:", err);
          });
          proxy.on("proxyReq", (proxyReq, req, _res) => {
            console.log("Requête proxy:", req.method, req.url);
          });
        },
      },
    },
  },
  optimizeDeps: {
    include: ["react", "react-dom", "framer-motion", "lucide-react"],
    // Configuration pour éviter les problèmes de cache
    force: true,
  },
  // Configuration pour éviter les problèmes de permissions sur OneDrive
  clearScreen: false,
  logLevel: "info",
});
