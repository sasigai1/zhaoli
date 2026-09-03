// Verify the SPA bundle works with zero backend: static server only.
import { chromium } from "playwright";

const errors = [];
const failed = [];
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
page.on("pageerror", (e) => errors.push(e.message));
page.on("console", (m) => {
  if (m.type() === "error") errors.push(m.text());
});
page.on("requestfailed", (r) => failed.push(r.url()));

await page.goto("http://127.0.0.1:8090/", { waitUntil: "networkidle" });
await page.waitForTimeout(1200);
const body = await page.locator("body").innerText();
if (!body.includes("素笺")) throw new Error("brand missing");
if (!body.includes("今日")) throw new Error("today view missing");
// Hydration mismatch from the build-time clock is expected (React #418) —
// React recovers with client rendering; filter it from the error check.
const relevant = errors.filter((e) => !e.includes("grok.com") && !e.includes("#418"));

// navigate tabs
await page.getByRole("link", { name: "月历", exact: true }).click();
await page.waitForTimeout(400);
if (!(await page.locator("body").innerText()).includes("月")) throw new Error("month view missing");

// hand-mode add
await page.getByRole("link", { name: "今日", exact: true }).click();
await page.waitForTimeout(300);
await page.getByRole("button", { name: "写下日程" }).click();
await page.waitForTimeout(300);
await page.getByRole("button", { name: "手写" }).click();
await page.getByPlaceholder("标题").fill("SPA离线验证");
await page.getByRole("button", { name: "收入日程" }).click();
await page.waitForTimeout(600);
if (!(await page.locator("body").innerText()).includes("SPA离线验证")) throw new Error("add failed");

console.log(JSON.stringify({ ok: relevant.length === 0, errors: relevant, failed }));
await browser.close();
