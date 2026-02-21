import { defineConfig } from "@playwright/test";

// Avoid NO_COLOR/FORCE_COLOR conflict warnings in Node child processes.
delete process.env.NO_COLOR;

export default defineConfig({
  testDir: "tests/e2e",
  reporter: "line",
  use: {
    baseURL: "http://127.0.0.1:4173"
  },
  webServer: {
    command: "npm run dev -- --host 127.0.0.1 --port 4173",
    port: 4173,
    reuseExistingServer: true
  }
});
