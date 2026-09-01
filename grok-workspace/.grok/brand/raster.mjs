import { chromium } from "playwright";
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const dir = dirname(fileURLToPath(import.meta.url));
const svg = readFileSync(join(dir, "favicon.svg"), "utf8");
const exe =
  "/opt/pw-browsers/chromium_headless_shell-1234/chrome-headless-shell-linux64/chrome-headless-shell";

async function raster(size, out) {
  const browser = await chromium.launch({
    executablePath: exe,
    args: ["--disable-gpu", "--no-sandbox"],
  });
  const page = await browser.newPage({
    viewport: { width: size, height: size },
    deviceScaleFactor: 1,
  });
  await page.setContent(
    `<!doctype html><html><head><style>
      html,body{margin:0;padding:0;width:${size}px;height:${size}px;background:#F1EEE6;overflow:hidden;}
      svg{display:block;width:${size}px;height:${size}px;}
    </style></head><body>${svg}</body></html>`,
    { waitUntil: "load" },
  );
  const buf = await page.screenshot({ type: "png", omitBackground: false });
  writeFileSync(out, buf);
  await browser.close();
  console.log("wrote", out, buf.length);
}

const sizes = [
  [16, join(dir, "favicon-16.png")],
  [32, join(dir, "favicon-32.png")],
  [180, join(dir, "icon-180.png")],
  [192, join(dir, "icon-192.png")],
  [512, join(dir, "icon-512.png")],
];
for (const [size, out] of sizes) {
  await raster(size, out);
}
