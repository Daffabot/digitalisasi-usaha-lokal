import path from "path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// Development proxy to avoid CORS during local development.
// It forwards requests from /api/* to the remote OCR API and rewrites
// Set-Cookie headers to work with localhost.
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
          proxy.on("proxyRes", (proxyRes) => {
            const setCookieHeader = proxyRes.headers["set-cookie"];
            
            if (setCookieHeader && Array.isArray(setCookieHeader)) {
              const rewritten = setCookieHeader.map((cookie) => {
                // Remove Domain attribute entirely for localhost
                let rewrittenCookie = cookie.replace(/;\s*Domain=[^;]+/gi, "");
                
                // Replace SameSite=Strict or SameSite=Lax with SameSite=None
                // and add Secure flag (required for SameSite=None)
                // For local dev, we'll use SameSite=Lax without Secure
                rewrittenCookie = rewrittenCookie.replace(/;\s*SameSite=(Strict|None)/gi, "; SameSite=Lax");
                
                // Remove Secure flag for localhost (HTTP)
                rewrittenCookie = rewrittenCookie.replace(/;\s*Secure/gi, "");
                
                // Ensure SameSite=Lax is present
                if (!/SameSite=/i.test(rewrittenCookie)) {
                  rewrittenCookie += "; SameSite=Lax";
                }
                
                return rewrittenCookie;
              });
              
              proxyRes.headers["set-cookie"] = rewritten;
            }
          });
        },
      },
    },
  },
}));
