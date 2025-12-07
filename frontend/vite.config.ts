import path from "path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// Development proxy to avoid CORS during local development.
// It forwards requests from /api/* to the remote OCR API and rewrites
// Set-Cookie Domain header to localhost so the browser accepts cookies.
// NOTE: This is for development only.
const API_TARGET = "https://ini-ocr-production.up.railway.app";

export default defineConfig(() => ({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      "/api": {
        target: API_TARGET,
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
        configure: (proxy) => {
          // rewrite Set-Cookie domain to localhost so browser will accept it in dev
          proxy.on("proxyRes", (proxyRes) => {
            const setCookieHeader =
              proxyRes.headers && proxyRes.headers["set-cookie"];
            if (setCookieHeader && Array.isArray(setCookieHeader)) {
              const rewritten = setCookieHeader.map((cookie) =>
                // remove Domain attribute or replace it with localhost
                cookie.replace(/;\s*Domain=[^;]+/i, "; Domain=localhost")
              );
              proxyRes.headers["set-cookie"] = rewritten;
            }
          });
        },
      },
    },
  },
}));
