import { spawnSync } from "node:child_process";
import path from "node:path";

const playwrightEntrypoint = path.resolve(process.cwd(), "node_modules/@playwright/test/cli.js");
const childEnv = { ...process.env };
delete childEnv.NO_COLOR;

const result = spawnSync(process.execPath, [playwrightEntrypoint, "test", "--reporter=line", ...process.argv.slice(2)], {
  env: childEnv,
  stdio: "inherit"
});

if (result.error) {
  console.error("[test:e2e] failed to execute Playwright:", result.error.message);
  process.exit(1);
}

process.exit(result.status ?? 1);
