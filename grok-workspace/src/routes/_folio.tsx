import { Outlet, createFileRoute, useRouterState } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { localIsoDate } from "@/lib/folio/schema";

export const Route = createFileRoute("/_folio")({
  component: FolioLayout,
});

function FolioLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const today = localIsoDate();
  let tab: "today" | "archive" | "metrics" | "day" = "today";
  if (pathname.startsWith("/archive")) tab = "archive";
  else if (pathname.startsWith("/metrics")) tab = "metrics";
  else if (pathname.startsWith("/d/")) {
    const date = pathname.slice(3);
    tab = date === today ? "today" : "day";
  }

  return (
    <AppShell tab={tab}>
      <Outlet />
    </AppShell>
  );
}
