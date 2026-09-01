import { createFileRoute } from "@tanstack/react-router";
import { DayEditor } from "@/components/day-editor";
import { localIsoDate } from "@/lib/folio/schema";

export const Route = createFileRoute("/_folio/")({
  component: TodayPage,
});

function TodayPage() {
  return <DayEditor date={localIsoDate()} />;
}
