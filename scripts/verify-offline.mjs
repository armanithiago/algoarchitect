// Offline verification. Prereq: `npm run build`, then `npm run preview` (default http://localhost:4173).
// Usage: node scripts/verify-offline.mjs [baseUrl]
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
const base = process.argv[2] ?? "http://localhost:4173";
const failures = [];
const check = (ok, msg) => {
  console.log(`${ok ? "PASS" : "FAIL"}  ${msg}`);
  if (!ok) failures.push(msg);
};

// 1. Manifest and icons (online).
const manifest = await (await fetch(`${base}/manifest.webmanifest`)).json();
console.log("manifest:", JSON.stringify(manifest, null, 2));
check(manifest.name === "AlgoArchitect" && manifest.short_name === "AlgoArch", "manifest names");
check(manifest.display === "standalone" && manifest.start_url === "/", "manifest display/start_url");
check(manifest.theme_color === "#0f1013" && manifest.background_color === "#0f1013", "manifest colors");
const expectedTypes = { png: "image/png", svg: "image/svg+xml" };
for (const icon of [...manifest.icons, { src: "/icons/apple-touch-icon-180.png" }, { src: "/icons/favicon.svg" }]) {
  const res = await fetch(new URL(icon.src, base));
  const type = res.headers.get("content-type") ?? "";
  const want = expectedTypes[icon.src.split(".").pop()];
  check(res.status === 200 && type.startsWith(want), `${icon.src} -> ${res.status} ${type}`);
}

// 2. Offline reload.
const browser = await chromium.launch();
const context = await browser.newContext({ serviceWorkers: "allow" });
const page = await context.newPage();
const served = [];
page.on("response", (r) => {
  if (r.url().includes("/fonts/")) served.push({ url: r.url(), status: r.status(), fromSW: r.fromServiceWorker() });
});

await page.goto(base, { waitUntil: "networkidle" });
await page.evaluate(async () => {
  await navigator.serviceWorker.ready;
});
// Wait until the SW controls the page (first load is uncontrolled until claim; reload once if needed).
let controlled = await page.evaluate(() => !!navigator.serviceWorker.controller);
if (!controlled) {
  await page.reload({ waitUntil: "networkidle" });
  controlled = await page.evaluate(() => !!navigator.serviceWorker.controller);
}
check(controlled, "service worker controls the page");
const cached = await page.evaluate(async () => (await caches.keys()).length);
check(cached > 0, `Cache Storage populated (${cached} cache(s))`);

await context.setOffline(true);
served.length = 0;
await page.reload({ waitUntil: "load" });
const rootChildren = await page.evaluate(() => document.getElementById("root")?.childElementCount ?? 0);
check(rootChildren > 0, `shell renders offline (#root has ${rootChildren} child element(s))`);
check((await page.title()) === "AlgoArchitect", "title present offline");

// A deep link must also fall back to index.html offline.
await page.goto(`${base}/some/deep/link`, { waitUntil: "load" });
check((await page.evaluate(() => document.getElementById("root")?.childElementCount ?? 0)) > 0, "navigateFallback renders shell on a deep link offline");

// Fonts: force the browser to load both families, then confirm the files were fetched (from the SW) and are usable.
const fonts = await page.evaluate(async () => {
  const faces = [...document.fonts].map((f) => `${f.family}:${f.status}`);
  await Promise.all([document.fonts.load('400 16px "Inter Variable"'), document.fonts.load('500 16px "JetBrains Mono Variable"')]);
  return { faces, loaded: [...document.fonts].filter((f) => f.status === "loaded").map((f) => f.family) };
});
console.log("font faces:", fonts.faces.join(", "), "| loaded:", fonts.loaded.join(", "));
const inter = await page.evaluate(async () => (await fetch("/fonts/inter-4.1-latin-wght.woff2")).status);
const jb = await page.evaluate(async () => (await fetch("/fonts/jetbrains-mono-2.211-latin-wght.woff2")).status);
check(inter === 200, "Inter woff2 served offline (200)");
check(jb === 200, "JetBrains Mono woff2 served offline (200)");
check(fonts.loaded.some((f) => f.includes("Inter")), "Inter font face loaded offline");
check(fonts.loaded.some((f) => f.includes("JetBrains")), "JetBrains Mono font face loaded offline");
console.log("font responses while offline:", JSON.stringify(served));

await browser.close();
if (failures.length) {
  console.error(`\n${failures.length} check(s) failed`);
  process.exit(1);
}
console.log("\nAll offline checks passed");
