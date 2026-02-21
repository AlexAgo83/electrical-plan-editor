import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const distDir = join(process.cwd(), "dist");
const manifestPath = join(distDir, "manifest.webmanifest");
const serviceWorkerPath = join(distDir, "sw.js");

if (!existsSync(distDir)) {
  throw new Error("dist directory not found. Run `npm run build` before `npm run quality:pwa`.");
}

if (!existsSync(manifestPath)) {
  throw new Error("dist/manifest.webmanifest is missing.");
}

if (!existsSync(serviceWorkerPath)) {
  throw new Error("dist/sw.js is missing.");
}

const workboxFile = readdirSync(distDir).find((name) => /^workbox-.*\.js$/.test(name));
if (workboxFile === undefined) {
  throw new Error("No workbox runtime artifact found in dist (expected workbox-*.js).");
}

const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
if (manifest.name !== "e-Plan Editor") {
  throw new Error(`Unexpected manifest name: ${String(manifest.name)}`);
}

if (manifest.short_name !== "e-Plan Editor") {
  throw new Error(`Unexpected manifest short_name: ${String(manifest.short_name)}`);
}

if (manifest.start_url !== "/") {
  throw new Error(`Unexpected manifest start_url: ${String(manifest.start_url)}`);
}

if (!Array.isArray(manifest.icons)) {
  throw new Error("Manifest icons array is missing.");
}

const has192 = manifest.icons.some((icon) => icon?.src === "/icons/icon-192.png" && icon?.sizes === "192x192");
const has512 = manifest.icons.some((icon) => icon?.src === "/icons/icon-512.png" && icon?.sizes === "512x512");

if (!has192 || !has512) {
  throw new Error("Manifest icons do not include expected 192x192 and 512x512 entries.");
}

console.log("PWA artifact quality gate passed.");
console.log(`Checked manifest, sw.js, and ${workboxFile}.`);
