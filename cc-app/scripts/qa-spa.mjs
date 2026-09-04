// Verify the SPA bundle works with zero backend: static server only.
// The AI split calls a server fn; in the APK it 404s and falls back to the
// local parser — verify that path end-to-end.
import { chromium } from "playwright";

const errors = [];
const failed = [];
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
page.on("pageerror", (e) => errors.push(e.message));
page.on("requestfailed", (r) => failed.push(r.url()));

await page.goto("http://127.0.0.1:8090/", { waitUntil: "networkidle" });
await page.waitForTimeout(1500);
const body = await page.locator("body").innerText();
if (!body.includes("日晷")) throw new Error("brand missing");
// the latin brand renders with CSS uppercase -> innerText yields "SUNDIAL"
if (!/sundial/i.test(body)) throw new Error("latin brand missing");

// month view direct entry
await page.goto("http://127.0.0.1:8090/month", { waitUntil: "networkidle" });
await page.waitForTimeout(800);
if (!(await page.locator("body").innerText()).match(/月|周/)) throw new Error("month view missing");

// compose: local fallback split + commit
await page.goto("http://127.0.0.1:8090/compose", { waitUntil: "networkidle" });
await page.waitForTimeout(800);
await page
  .getByPlaceholder(/今天有/)
  .fill("今天下午 3 点见客户，晚上 7 点和朋友吃饭");
await page.getByRole("button", { name: /智能拆分/ }).click();
await page.waitForTimeout(7000); // server fn fails -> local fallback
const splitBody = await page.locator("body").innerText();
if (!splitBody.includes("全部加入")) throw new Error("split produced no drafts");
await page.getByRole("button", { name: /全部加入/ }).click();
await page.waitForTimeout(800);

// today view should show the committed events
await page.goto("http://127.0.0.1:8090/today", { waitUntil: "networkidle" });
await page.waitForTimeout(1000);
const todayBody = await page.locator("body").innerText();
if (!todayBody.includes("见客户")) throw new Error("committed event missing on today");

const relevant = errors.filter(
  (e) => !e.includes("grok.com") && !e.includes("#418") && !e.includes("404"),
);
console.log(JSON.stringify({ ok: relevant.length === 0, errors: relevant, failed }));
await browser.close();
