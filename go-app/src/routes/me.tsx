import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { MeView } from "@/components/me-view";

export const Route = createFileRoute("/me")({ component: MePage });

function MePage() {
  return (
    <AppShell active="me">
      <MeView />
    </AppShell>
  );
}
