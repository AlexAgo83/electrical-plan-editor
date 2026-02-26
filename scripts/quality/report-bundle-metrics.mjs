import fs from "node:fs";
import path from "node:path";
import { gzipSync } from "node:zlib";

const MAIN_CHUNK_WARN_BYTES = Number(process.env.BUNDLE_MAIN_WARN_BYTES ?? 500 * 1024);
const TOTAL_GZIP_WARN_BYTES = Number(process.env.BUNDLE_TOTAL_GZIP_WARN_BYTES ?? 220 * 1024);

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

const mainChunk =
  jsAssets.find((asset) => /^index-[A-Za-z0-9_-]+\.js$/.test(asset.fileName)) ??
  [...jsAssets].sort((left, right) => right.rawBytes - left.rawBytes)[0];

const totalJsGzipBytes = jsAssets.reduce((total, asset) => total + asset.gzipBytes, 0);

console.log("[bundle:metrics] informational non-blocking budget report");
console.log(
  `[bundle:metrics] main JS chunk: ${mainChunk.fileName} (${formatKiB(mainChunk.rawBytes)} raw / ${formatKiB(mainChunk.gzipBytes)} gzip)`
);
console.log(
  `[bundle:metrics] total JS gzip: ${formatKiB(totalJsGzipBytes)} across ${jsAssets.length} chunks`
);
console.log(
  `[bundle:metrics] warning budgets: main <= ${formatKiB(MAIN_CHUNK_WARN_BYTES)} raw, total JS gzip <= ${formatKiB(TOTAL_GZIP_WARN_BYTES)}`
);

if (mainChunk.rawBytes > MAIN_CHUNK_WARN_BYTES) {
  console.warn(
    `[bundle:metrics] warning: main chunk exceeds budget by ${formatKiB(mainChunk.rawBytes - MAIN_CHUNK_WARN_BYTES)}`
  );
}
if (totalJsGzipBytes > TOTAL_GZIP_WARN_BYTES) {
  console.warn(
    `[bundle:metrics] warning: total JS gzip exceeds budget by ${formatKiB(totalJsGzipBytes - TOTAL_GZIP_WARN_BYTES)}`
  );
}

process.exit(0);
