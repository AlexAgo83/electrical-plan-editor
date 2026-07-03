import fs from "node:fs";
import path from "node:path";
import { gzipSync } from "node:zlib";

const MAIN_CHUNK_WARN_BYTES = Number(process.env.BUNDLE_MAIN_WARN_BYTES ?? 500 * 1024);
const INITIAL_GZIP_WARN_BYTES = Number(process.env.BUNDLE_INITIAL_GZIP_WARN_BYTES ?? 130 * 1024);
const TOTAL_GZIP_WARN_BYTES = Number(process.env.BUNDLE_TOTAL_GZIP_WARN_BYTES ?? 850 * 1024);
const TOP_CHUNK_COUNT = Number(process.env.BUNDLE_TOP_CHUNK_COUNT ?? 8);

function formatKiB(bytes) {
  return `${(bytes / 1024).toFixed(2)} KiB`;
}

const assetsDir = path.resolve(process.cwd(), "dist/assets");
if (!fs.existsSync(assetsDir)) {
  console.error("[bundle:metrics] missing dist/assets. Run `npm run build` first.");
  process.exit(1);
}

const jsFileNames = fs.readdirSync(assetsDir).filter((name) => name.endsWith(".js"));
if (jsFileNames.length === 0) {
  console.error("[bundle:metrics] no JavaScript assets found under dist/assets.");
  process.exit(1);
}

const jsAssets = jsFileNames.map((fileName) => {
  const absolutePath = path.join(assetsDir, fileName);
  const content = fs.readFileSync(absolutePath);
  return {
    fileName,
    rawBytes: content.length,
    gzipBytes: gzipSync(content).length
  };
});

function readIfExists(filePath) {
  return fs.existsSync(filePath) ? fs.readFileSync(filePath, "utf8") : "";
}

function collectIndexHtmlJsAssets() {
  const indexHtml = readIfExists(path.resolve(process.cwd(), "dist/index.html"));
  return new Set(
    [...indexHtml.matchAll(/(?:src|href)="\/?(assets\/[^"]+\.js)"/g)].map((match) => path.basename(match[1]))
  );
}

function collectIndexHtmlEntryScript() {
  const indexHtml = readIfExists(path.resolve(process.cwd(), "dist/index.html"));
  const match = indexHtml.match(/<script[^>]+type="module"[^>]+src="\/?(assets\/[^"]+\.js)"/);
  return match === null ? null : path.basename(match[1]);
}

function collectPrecachedAssets() {
  const swSource = readIfExists(path.resolve(process.cwd(), "dist/sw.js"));
  return new Set([...swSource.matchAll(/url:"(assets\/[^"]+)"/g)].map((match) => path.basename(match[1])));
}

const totalJsGzipBytes = jsAssets.reduce((total, asset) => total + asset.gzipBytes, 0);
const initialJsAssets = collectIndexHtmlJsAssets();
const entryScriptFileName = collectIndexHtmlEntryScript();
const precachedAssets = collectPrecachedAssets();
const entryScriptChunk =
  jsAssets.find((asset) => asset.fileName === entryScriptFileName) ??
  jsAssets.find((asset) => /^index-[A-Za-z0-9_-]+\.js$/.test(asset.fileName)) ??
  [...jsAssets].sort((left, right) => right.rawBytes - left.rawBytes)[0];
const largestInitialChunk =
  jsAssets
    .filter((asset) => initialJsAssets.has(asset.fileName))
    .sort((left, right) => right.rawBytes - left.rawBytes)[0] ?? entryScriptChunk;
const initialJsGzipBytes = jsAssets
  .filter((asset) => initialJsAssets.has(asset.fileName))
  .reduce((total, asset) => total + asset.gzipBytes, 0);
const precachedJsGzipBytes = jsAssets
  .filter((asset) => precachedAssets.has(asset.fileName))
  .reduce((total, asset) => total + asset.gzipBytes, 0);
const topChunks = [...jsAssets].sort((left, right) => right.rawBytes - left.rawBytes).slice(0, TOP_CHUNK_COUNT);

function classifyAsset(asset) {
  const tags = [];
  if (initialJsAssets.has(asset.fileName)) {
    tags.push("initial");
  }
  if (precachedAssets.has(asset.fileName)) {
    tags.push("precache");
  } else {
    tags.push("lazy-only");
  }
  return tags.join(", ");
}

console.log("[bundle:metrics] budget report");
console.log(
  `[bundle:metrics] entry JS chunk: ${entryScriptChunk.fileName} (${formatKiB(entryScriptChunk.rawBytes)} raw / ${formatKiB(entryScriptChunk.gzipBytes)} gzip)`
);
console.log(
  `[bundle:metrics] largest initial JS chunk: ${largestInitialChunk.fileName} (${formatKiB(largestInitialChunk.rawBytes)} raw / ${formatKiB(largestInitialChunk.gzipBytes)} gzip)`
);
console.log(
  `[bundle:metrics] initial JS gzip: ${formatKiB(initialJsGzipBytes)} across ${initialJsAssets.size} index.html module chunk(s)`
);
console.log(
  `[bundle:metrics] precached JS gzip: ${formatKiB(precachedJsGzipBytes)} across ${[...precachedAssets].filter((name) => name.endsWith(".js")).length} chunk(s)`
);
console.log(
  `[bundle:metrics] total JS gzip: ${formatKiB(totalJsGzipBytes)} across ${jsAssets.length} chunks`
);
console.log(
  `[bundle:metrics] budgets: largest initial chunk <= ${formatKiB(MAIN_CHUNK_WARN_BYTES)} raw, initial JS gzip <= ${formatKiB(INITIAL_GZIP_WARN_BYTES)}, total JS gzip <= ${formatKiB(TOTAL_GZIP_WARN_BYTES)}`
);
console.log(`[bundle:metrics] top ${topChunks.length} JS chunks:`);
for (const asset of topChunks) {
  console.log(
    `  - ${asset.fileName}: ${formatKiB(asset.rawBytes)} raw / ${formatKiB(asset.gzipBytes)} gzip (${classifyAsset(asset)})`
  );
}

const budgetFailures = [];
if (largestInitialChunk.rawBytes > MAIN_CHUNK_WARN_BYTES) {
  budgetFailures.push(`largest initial chunk exceeds budget by ${formatKiB(largestInitialChunk.rawBytes - MAIN_CHUNK_WARN_BYTES)}`);
}
if (initialJsGzipBytes > INITIAL_GZIP_WARN_BYTES) {
  budgetFailures.push(`initial JS gzip exceeds budget by ${formatKiB(initialJsGzipBytes - INITIAL_GZIP_WARN_BYTES)}`);
}
if (totalJsGzipBytes > TOTAL_GZIP_WARN_BYTES) {
  budgetFailures.push(`total JS gzip exceeds budget by ${formatKiB(totalJsGzipBytes - TOTAL_GZIP_WARN_BYTES)}`);
}

for (const failure of budgetFailures) {
  console.error(`[bundle:metrics] budget failure: ${failure}`);
}

process.exit(budgetFailures.length === 0 ? 0 : 1);
