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
    name: "pwa-build-deepmerge-prototype-poisoning",
    severity: "low",
    reason: "GHSA-gcqx-w48m-w2h4 has no patched deepmerge release (latest: 4.3.1). Even vite-plugin-pwa@2.0.0 retains workbox-build@7.4.1 and @rollup/plugin-node-resolve@16.0.3. npm only offers a downgrade to vite-plugin-pwa@0.2.1. This build-only chain merges trusted build configuration, not imported workspace data; revisit when upstream publishes a fix.",
    matches(vulnerability) {
      const chain = {
        "deepmerge": { via: null, effects: ["@rollup/plugin-node-resolve"], isDirect: false },
        "@rollup/plugin-node-resolve": { via: "deepmerge", effects: ["workbox-build"], isDirect: false },
        "workbox-build": { via: "@rollup/plugin-node-resolve", effects: ["vite-plugin-pwa"], isDirect: false },
        "vite-plugin-pwa": { via: "workbox-build", effects: [], isDirect: true }
      };
      const expected = Object.hasOwn(chain, vulnerability.name) ? chain[vulnerability.name] : undefined;
      return (
        expected !== undefined &&
        vulnerability.severity === "low" &&
        vulnerability.isDirect === expected.isDirect &&
        (vulnerability.fixAvailable === false ||
          (vulnerability.fixAvailable?.name === "vite-plugin-pwa" &&
            vulnerability.fixAvailable.version === "0.2.1" &&
            vulnerability.fixAvailable.isSemVerMajor === true)) &&
        Array.isArray(vulnerability.effects) &&
        vulnerability.effects.length === expected.effects.length &&
        expected.effects.every((name) => vulnerability.effects.includes(name)) &&
        Array.isArray(vulnerability.via) &&
        vulnerability.via.length === 1 &&
        (expected.via === null
          ? vulnerability.via[0]?.url === "https://github.com/advisories/GHSA-gcqx-w48m-w2h4"
          : vulnerability.via[0] === expected.via)
      );
    }
  },
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
