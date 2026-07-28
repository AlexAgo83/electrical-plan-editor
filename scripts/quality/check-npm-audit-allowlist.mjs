import { spawnSync } from "node:child_process";

// fixAvailable may be false (no fix) or an object with isSemVerMajor:true
// (fix requires a major version change — downgrade to exceljs@3.x is not viable).
function isNoViableFix(fixAvailable) {
  return (
    fixAvailable === false ||
    (typeof fixAvailable === "object" &&
      fixAvailable !== null &&
      fixAvailable.isSemVerMajor === true)
  );
}

const ALLOWED_VULNERABILITIES = [
  {
    name: "legacy-build-chain",
    severity: "high",
    reason: "The latest compatible ExcelJS, ESLint 9, and Vite PWA releases retain this build-only dependency chain. npm only offers incompatible major upgrades or a downgrade; the affected packages are not shipped by the application.",
    matches(vulnerability) {
      return (
        [
          "@eslint/config-array",
          "@eslint/eslintrc",
          "@trickfilm400/rollup-plugin-off-main-thread",
          "archiver",
          "archiver-utils",
          "brace-expansion",
          "ejs",
          "eslint",
          "exceljs",
          "filelist",
          "glob",
          "jake",
          "minimatch",
          "readdir-glob",
          "rimraf",
          "vite-plugin-pwa",
          "workbox-build",
          "zip-stream"
        ].includes(vulnerability.name) &&
        vulnerability.severity === "high"
      );
    }
  },
  {
    name: "exceljs",
    severity: "moderate",
    reason: "exceljs@4.x is the latest upstream release and still depends on vulnerable uuid; the only available fix is a downgrade to 3.x (isSemVerMajor). XLSX export is dynamically loaded and isolated.",
    matches(vulnerability) {
      return (
        vulnerability.name === "exceljs" &&
        vulnerability.severity === "moderate" &&
        vulnerability.isDirect === true &&
        isNoViableFix(vulnerability.fixAvailable) &&
        Array.isArray(vulnerability.via) &&
        vulnerability.via.length === 1 &&
        vulnerability.via[0] === "uuid"
      );
    }
  },
  {
    name: "uuid",
    severity: "moderate",
    reason: "Transitive dependency of exceljs only; no upstream exceljs@4.x release currently removes it.",
    matches(vulnerability) {
      return (
        vulnerability.name === "uuid" &&
        vulnerability.severity === "moderate" &&
        isNoViableFix(vulnerability.fixAvailable) &&
        Array.isArray(vulnerability.effects) &&
        vulnerability.effects.length === 1 &&
        vulnerability.effects[0] === "exceljs" &&
        Array.isArray(vulnerability.via) &&
        vulnerability.via.some((entry) => entry?.url === "https://github.com/advisories/GHSA-w5hq-g745-h8pq")
      );
    }
  }
];

function parseAuditReport(stdout) {
  try {
    return JSON.parse(stdout);
  } catch (error) {
    console.error("Unable to parse npm audit JSON output.");
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

const result = spawnSync("npm", ["audit", "--json"], {
  cwd: process.cwd(),
  encoding: "utf8",
  shell: false
});

if (result.error !== undefined) {
  console.error("Unable to run npm audit.");
  console.error(result.error.message);
  process.exit(1);
}

const report = parseAuditReport(result.stdout);
const vulnerabilities = Object.values(report.vulnerabilities ?? {});
const unexpected = [];
const accepted = [];

for (const vulnerability of vulnerabilities) {
  const allowlistEntry = ALLOWED_VULNERABILITIES.find((entry) => entry.matches(vulnerability));
  if (allowlistEntry === undefined) {
    unexpected.push(vulnerability);
    continue;
  }
  accepted.push({ vulnerability, reason: allowlistEntry.reason });
}

if (unexpected.length > 0) {
  console.error("npm audit allowlist failed. Unexpected vulnerabilities:");
  for (const vulnerability of unexpected) {
    console.error(`- ${vulnerability.name}: ${vulnerability.severity}`);
  }
  process.exit(1);
}

console.log("npm audit allowlist passed.");
if (accepted.length === 0) {
  console.log("No vulnerabilities reported by npm audit.");
} else {
  console.log("Accepted vulnerabilities:");
  for (const { vulnerability, reason } of accepted) {
    console.log(`- ${vulnerability.name}: ${vulnerability.severity}`);
    console.log(`  ${reason}`);
  }
}
