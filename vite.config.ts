import { fileURLToPath, URL } from "node:url";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    // PWA: design system §10.6. Precaches the whole shell offline; no runtime API calls exist in the MVP.
    VitePWA({
      registerType: "prompt", // E2-07: the user chooses when to refresh
      includeAssets: ["fonts/*.woff2", "icons/*.png", "icons/*.svg"],
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,png,woff2,json}"],
        navigateFallback: "/index.html",
        cleanupOutdatedCaches: true,
      },
      manifest: {
        name: "AlgoArchitect",
        short_name: "AlgoArch",
        description: "Match real architecture scenarios to the right algorithm. Five minutes, one thumb, offline.",
        id: "/",
        start_url: "/",
        scope: "/",
        display: "standalone",
        orientation: "any",
        background_color: "#0f1013",
        theme_color: "#0f1013",
        categories: ["education", "productivity"],
        icons: [
          { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
          { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
          { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
          { src: "/icons/icon-monochrome.svg", sizes: "any", type: "image/svg+xml", purpose: "monochrome" },
        ],
      },
    }),
  ],
  resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
});
