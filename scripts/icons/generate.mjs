// Generates the PWA icon set from ONE geometry definition ("A as a graph", design system §10.6).
// Usage: node scripts/icons/generate.mjs   (needs Playwright + its Chromium; do not run `playwright install`)
import { mkdirSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import path from "node:path";

const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
const out = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../public/icons");
mkdirSync(out, { recursive: true });

// Palette (raw hex is allowed here: icon source only).
const C = { canvas: "#0f1013", grid: "#1b1d22", leg: "#babec4", accent: "#3e69e9", ring: "#9fbdff", base: "#eff0f3" };

// The mark on the 512 grid. Farthest point from center is 180 px (< 205 px safe radius).
const mark =
  `<path d="M256 128 152 384M256 128l104 256" stroke="${C.leg}" stroke-width="22" stroke-linecap="round" fill="none"/>` +
  `<path d="M193.6 281.6h124.8" stroke="${C.accent}" stroke-width="22" stroke-linecap="round"/>` +
  `<circle cx="256" cy="128" r="34" fill="${C.accent}"/>` +
  `<circle cx="152" cy="384" r="28" fill="${C.base}"/><circle cx="360" cy="384" r="28" fill="${C.base}"/>` +
  `<circle cx="193.6" cy="281.6" r="16" fill="${C.canvas}" stroke="${C.ring}" stroke-width="8"/>` +
  `<circle cx="318.4" cy="281.6" r="16" fill="${C.canvas}" stroke="${C.ring}" stroke-width="8"/>`;

let grid = "";
for (let p = 64; p < 512; p += 64) grid += `<path d="M${p} 0V512M0 ${p}H512" stroke="${C.grid}" stroke-width="2"/>`;

const svg = (inner) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">${inner}</svg>`;
const art = `<rect width="512" height="512" fill="${C.canvas}"/>${grid}${mark}`;
// Rounded-square tile (radius 112 on 512 = 42 on 192 when scaled), transparent corners.
const rounded = svg(`<clipPath id="t"><rect width="512" height="512" rx="112"/></clipPath><g clip-path="url(#t)">${art}</g>`);
// Full bleed (maskable, apple-touch): square, opaque.
const bleed = svg(art);

// Single-color silhouette for Android themed icons.
const monoSvg = svg(
  `<g fill="none" stroke="#000" stroke-linecap="round" stroke-width="22"><path d="M256 128 152 384M256 128l104 256M193.6 281.6h124.8"/></g>` +
    `<circle cx="256" cy="128" r="34"/><circle cx="152" cy="384" r="28"/><circle cx="360" cy="384" r="28"/>` +
    `<circle cx="193.6" cy="281.6" r="20"/><circle cx="318.4" cy="281.6" r="20"/>`,
);

// Mark only, no grid, prefers-color-scheme aware (light default, dark override).
const faviconSvg =
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><style>` +
  `.l{stroke:#454a52}.b{fill:#171b21}.r{fill:#f6f7f9}@media (prefers-color-scheme:dark){.l{stroke:#babec4}.b{fill:#eff0f3}.r{fill:#0f1013}}` +
  `</style><path class="l" d="M256 128 152 384M256 128l104 256" stroke-width="30" stroke-linecap="round" fill="none"/>` +
  `<path d="M193.6 281.6h124.8" stroke="#3e69e9" stroke-width="30" stroke-linecap="round"/>` +
  `<circle cx="256" cy="128" r="46" fill="#3e69e9"/><circle class="b" cx="152" cy="384" r="40"/><circle class="b" cx="360" cy="384" r="40"/>` +
  `<circle class="r" cx="193.6" cy="281.6" r="22" stroke="#3e69e9" stroke-width="10"/><circle class="r" cx="318.4" cy="281.6" r="22" stroke="#3e69e9" stroke-width="10"/></svg>`;

writeFileSync(path.join(out, "favicon.svg"), faviconSvg);
writeFileSync(path.join(out, "icon-monochrome.svg"), monoSvg);

const browser = await chromium.launch();
const render = async (name, markup, size) => {
  const page = await browser.newPage({ viewport: { width: size, height: size } });
  const sized = markup.replace("<svg ", `<svg width="${size}" height="${size}" `);
  await page.setContent(`<html><body style="margin:0;background:transparent">${sized}</body></html>`);
  await page.screenshot({ path: path.join(out, name), omitBackground: true, clip: { x: 0, y: 0, width: size, height: size } });
  await page.close();
  console.log("wrote", name, size);
};
await render("icon-512.png", rounded, 512);
await render("icon-192.png", rounded, 192);
await render("icon-maskable-512.png", bleed, 512);
await render("apple-touch-icon-180.png", bleed, 180);
await browser.close();
