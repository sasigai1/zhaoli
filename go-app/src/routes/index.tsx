import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { TodayView } from "@/components/today-view";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return (
    <AppShell active="today">
      <TodayView />
    </AppShell>
  );
}
