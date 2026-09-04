import { createRootRoute, HeadContent, Outlet, Scripts } from "@tanstack/react-router";
import { AuthProvider } from "@/lib/auth/provider";
import { PreviewHostBridge } from "@/components/preview-host-bridge";
import { Toaster } from "sonner";
import { HydrateStore } from "@/components/layout/hydrate-store";
import { ReminderWatcher } from "@/components/layout/reminder-watcher";
import { useMounted } from "@/hooks/use-mounted";
import appCss from "../styles.css?url";

const APP_NAME = "日晷 Sundial";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: APP_NAME },
      { name: "theme-color", content: "#F3F0EA" },
      { name: "description", content: "把一天轻轻转过来。用一句话记下多件日程。" },
    ],
    links: [
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      { rel: "stylesheet", href: appCss },
      { rel: "manifest", href: "/__grok/manifest.webmanifest" },
      { rel: "apple-touch-icon", href: "/__grok/icon-180.png" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;500;600&family=Noto+Serif+SC:wght@500;600&display=swap",
      },
    ],
  }),
  component: Root,
});

function ClientToaster() {
  const mounted = useMounted();
  if (!mounted) return null;
  return (
    <Toaster
      theme="light"
      position="top-center"
      toastOptions={{
        className: "font-sans !bg-paper !text-ink !shadow-lift !border-0",
      }}
    />
  );
}

function Root() {
  return (
    <html lang="zh-CN" className="antialiased" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body className="min-h-dvh bg-canvas text-ink">
        <PreviewHostBridge />
        <AuthProvider>
          <HydrateStore />
          <ReminderWatcher />
          <Outlet />
          <ClientToaster />
        </AuthProvider>
        <Scripts />
      </body>
    </html>
  );
}
