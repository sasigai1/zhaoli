import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { RemindersView } from "@/components/reminders-view";

export const Route = createFileRoute("/reminders")({ component: RemindersPage });

function RemindersPage() {
  return (
    <AppShell active="reminders">
      <RemindersView />
    </AppShell>
  );
}
