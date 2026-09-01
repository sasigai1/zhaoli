import { createFileRoute } from "@tanstack/react-router";
import { MetricsView } from "@/components/metrics-view";

export const Route = createFileRoute("/_folio/metrics")({
  component: MetricsPage,
});

function MetricsPage() {
  return <MetricsView />;
}
