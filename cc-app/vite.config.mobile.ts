// Mobile (APK) build config — a client-only SPA, no Nitro/SSR, no grok.com
// PWA injector. Bundled assets are served from the WebView's local origin via
// Capacitor, so the app must run fully offline (auth off, DEV_USER fallback).
import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  resolve: { tsconfigPaths: true },
  plugins: [tailwindcss(), tanstackStart({ spa: { enabled: true } }), viteReact()],
});
