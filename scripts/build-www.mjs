/**
 * Assembles the static site into www/, which is what Capacitor packages into
 * the APK.
 *
 * There is no bundler here — the app is a single hand-written index.html — so
 * "building" is a whitelist copy. A whitelist rather than a blacklist on
 * purpose: pointing Capacitor at the repo root would ship .git, node_modules
 * and the serverless function into the APK.
 */
import { cp, mkdir, rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const www = path.join(root, "www");

// api/ is deliberately absent: it is a Vercel serverless function and has no
// meaning inside the app bundle. The native build calls the deployed copy of it
// over the network instead — see native-config.js.
const INCLUDE = [
  "index.html",
  "manifest.webmanifest",
  "native-config.js",
  "icon-192.png",
  "icon-512.png",
  "icon-maskable-512.png",
  "apple-touch-icon.png",
];

await rm(www, { recursive: true, force: true });
await mkdir(www, { recursive: true });

for (const entry of INCLUDE) {
  await cp(path.join(root, entry), path.join(www, entry), { recursive: true });
}

console.log(`www/ assembled — ${INCLUDE.length} entries`);
