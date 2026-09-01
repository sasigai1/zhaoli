import { createFileRoute } from "@tanstack/react-router";
import { DayEditor } from "@/components/day-editor";

export const Route = createFileRoute("/_folio/d/$date")({
  component: DayPage,
});

function DayPage() {
  const { date } = Route.useParams();
  return <DayEditor date={date} />;
}
