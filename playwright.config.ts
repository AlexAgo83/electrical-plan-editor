import { defineConfig } from "@playwright/test";
import { loadEnv } from "vite";
import { resolveRuntimeEnvironment } from "./src/config/environment";

const env = resolveRuntimeEnvironment(loadEnv("development", process.cwd(), ""));
for (const warning of env.warnings) {
  console.warn(`[env] ${warning}`);
}

export default defineConfig({
  testDir: "tests/e2e",
  reporter: "line",
  use: {
    baseURL: env.e2eBaseUrl
  },
  webServer: {
    command: "npm run dev",
    port: env.appPort,
    reuseExistingServer: true
  }
});
