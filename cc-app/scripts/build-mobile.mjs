// Mobile (APK) web build: SPA build via vite.config.mobile.ts, then normalize
// the emitted shell HTML to index.html for Capacitor's webDir.
import { execSync } from "node:child_process";
import { copyFileSync, existsSync } from "node:fs";

execSync("npx vite build -c vite.config.mobile.ts", {
  stdio: "inherit",
  env: { ...process.env, VITE_AUTH_ENABLED: "false" },
});

const shell = "dist/client/_shell.html";
const index = "dist/client/index.html";
if (!existsSync(shell)) throw new Error(`missing ${shell}`);
copyFileSync(shell, index);
console.log(`mobile web ready: ${index}`);
