import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import { resolveRuntimeEnvironment } from "./src/config/environment";

export default defineConfig(({ mode }) => {
  const env = resolveRuntimeEnvironment(loadEnv(mode, process.cwd(), ""));
  for (const warning of env.warnings) {
    console.warn(`[env] ${warning}`);
  }

  return {
    plugins: [
      react(),
      VitePWA({
        registerType: "prompt",
        injectRegister: false,
        devOptions: {
          enabled: false,
          suppressWarnings: true
        },
        includeAssets: ["app-icon.svg", "favicon.svg", "icons/icon-192.png", "icons/icon-512.png"],
        manifest: {
          name: "e-Plan Editor",
          short_name: "e-Plan Editor",
          description: "Local-first electrical network editor with deterministic modeling and validation.",
          start_url: "/",
          scope: "/",
          display: "standalone",
          background_color: "#0f2335",
          theme_color: "#17374e",
          icons: [
            {
              src: "/icons/icon-192.png",
              sizes: "192x192",
              type: "image/png"
            },
            {
              src: "/icons/icon-512.png",
              sizes: "512x512",
              type: "image/png"
            },
            {
              src: "/icons/icon-512.png",
              sizes: "512x512",
              type: "image/png",
              purpose: "maskable"
            }
          ]
        },
        workbox: {
          cleanupOutdatedCaches: true,
          clientsClaim: true,
          skipWaiting: false,
          navigateFallback: "/index.html",
          runtimeCaching: [
            {
              urlPattern: ({ request }) => request.destination === "document",
              handler: "NetworkFirst",
              options: {
                cacheName: "app-documents",
                networkTimeoutSeconds: 3,
                expiration: {
                  maxEntries: 20,
                  maxAgeSeconds: 7 * 24 * 60 * 60
                }
              }
            }
          ]
        }
      })
    ],
    server: {
      host: env.appHost,
      port: env.appPort
    },
    preview: {
      host: env.appHost,
      port: env.previewPort
    },
    test: {
      environment: "jsdom",
      setupFiles: ["src/tests/setup.ts"],
      include: ["src/tests/**/*.spec.ts", "src/tests/**/*.spec.tsx"],
      exclude: ["tests/e2e/**"],
      coverage: {
        provider: "v8",
        reporter: ["text", "html"],
        include: ["src/core/**/*.ts", "src/store/**/*.ts"]
      }
    }
  };
});
