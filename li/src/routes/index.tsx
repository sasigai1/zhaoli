import { createFileRoute } from "@tanstack/react-router";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppShell } from "@/components/app-shell";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return (
    <TooltipProvider delayDuration={400}>
      <AppShell />
    </TooltipProvider>
  );
}
