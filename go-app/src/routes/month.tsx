import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { MonthView } from "@/components/month-view";

export const Route = createFileRoute("/month")({ component: MonthPage });

function MonthPage() {
  return (
    <AppShell active="month">
      <MonthView />
    </AppShell>
  );
}
