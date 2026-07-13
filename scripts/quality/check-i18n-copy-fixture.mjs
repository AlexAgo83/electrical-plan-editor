import { spawnSync } from "node:child_process";

const result = spawnSync(process.execPath, ["scripts/quality/check-i18n-copy.mjs", "scripts/quality/fixtures/hardcoded-product-copy.tsx"], {
  encoding: "utf8"
});
if (result.status === 0 || !result.stderr.includes("Hardcoded product copy")) {
  console.error("The i18n guard did not reject the hardcoded-copy fixture.");
  process.exit(1);
}
console.log("i18n guard rejection fixture passed.");
