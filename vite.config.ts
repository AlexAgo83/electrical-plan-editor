import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { resolveRuntimeEnvironment } from "./src/config/environment";

export default defineConfig(({ mode }) => {
  const env = resolveRuntimeEnvironment(loadEnv(mode, process.cwd(), ""));
  for (const warning of env.warnings) {
    console.warn(`[env] ${warning}`);
  }

  return {
    plugins: [react()],
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
