import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Bell, CalendarDays, Plus, SunMedium, User } from "lucide-react";
import { Toaster } from "sonner";
import { cn } from "@/lib/cn";
import { useHydratedSchedule } from "@/hooks/use-hydrated";
import { useReminders } from "@/hooks/use-reminders";
import { useSchedule } from "@/lib/schedule/store";
import { BrandMark } from "./brand-mark";
import { Composer } from "./composer";
import { EventDetail } from "./event-detail";

type Tab = "today" | "month" | "reminders" | "me";

const TABS: { id: Tab; to: string; label: string; icon: typeof SunMedium }[] = [
  { id: "today", to: "/", label: "今日", icon: SunMedium },
  { id: "month", to: "/month", label: "月历", icon: CalendarDays },
  { id: "reminders", to: "/reminders", label: "提醒", icon: Bell },
  { id: "me", to: "/me", label: "我", icon: User },
];

export function AppShell({
  active,
  children,
}: {
  active: Tab;
  children: ReactNode;
}) {
  const hydrated = useHydratedSchedule();
  const composerOpen = useSchedule((s) => s.composerOpen);
  const selectedEventId = useSchedule((s) => s.selectedEventId);
  const openComposer = useSchedule((s) => s.openComposer);
  const closeComposer = useSchedule((s) => s.closeComposer);
  const selectEvent = useSchedule((s) => s.selectEvent);
  const notifyEnabled = useSchedule((s) => s.settings.notifyEnabled);

  useReminders(hydrated && notifyEnabled);

  return (
    <div className="min-h-dvh bg-paper text-ink">
      <div className="mx-auto flex min-h-dvh w-full max-w-[430px] flex-col bg-sheet md:min-h-[100dvh] md:shadow-sheet">
        <header className="flex items-center gap-2.5 px-5 pt-[max(18px,env(safe-area-inset-top))] pb-2">
          <BrandMark className="h-7 w-4" />
          <div className="flex flex-col">
            <span className="font-serif text-[22px] leading-none tracking-wide">素笺</span>
            <span className="mt-1 text-[11px] tracking-[0.18em] text-muted">BLANK PAGE</span>
          </div>
        </header>

        <main className="relative min-h-0 flex-1 overflow-y-auto">
          {hydrated ? (
            children
          ) : (
            <div className="px-5 pt-8">
              <p className="font-serif text-4xl tracking-tight text-ink">素笺</p>
              <p className="mt-3 text-sm text-muted">正在展开今天的纸面…</p>
            </div>
          )}
        </main>

        <nav className="relative grid grid-cols-5 border-t border-line/80 bg-sheet pb-[env(safe-area-inset-bottom)]">
          {TABS.slice(0, 2).map((tab) => (
            <NavItem key={tab.id} tab={tab} active={active === tab.id} />
          ))}
          <div className="flex items-center justify-center">
            <button
              type="button"
              onClick={openComposer}
              aria-label="写下日程"
              className="relative -top-4 flex size-14 items-center justify-center rounded-full bg-ink text-sheet shadow-float transition-transform duration-150 ease-out active:scale-[0.96]"
            >
              <Plus className="size-6" strokeWidth={1.75} />
            </button>
          </div>
          {TABS.slice(2).map((tab) => (
            <NavItem key={tab.id} tab={tab} active={active === tab.id} />
          ))}
        </nav>
      </div>

      <Composer open={composerOpen} onOpenChange={(open) => (open ? openComposer() : closeComposer())} />
      <EventDetail
        eventId={selectedEventId}
        onClose={() => selectEvent(null)}
      />
      <Toaster
        position="top-center"
        toastOptions={{
          className:
            "!bg-sheet !text-ink !shadow-float !border-0 !rounded-lg font-sans",
        }}
      />
    </div>
  );
}

function NavItem({
  tab,
  active,
}: {
  tab: (typeof TABS)[number];
  active: boolean;
}) {
  const Icon = tab.icon;
  return (
    <Link
      to={tab.to}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex min-h-14 flex-col items-center justify-center gap-0.5 text-[11px] tracking-wide transition-colors duration-150 ease-out",
        active ? "text-ink" : "text-muted",
      )}
    >
      <Icon className="size-[18px]" strokeWidth={active ? 2.1 : 1.7} />
      {tab.label}
    </Link>
  );
}
