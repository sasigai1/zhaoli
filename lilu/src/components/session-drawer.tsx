import { useEffect } from "react";
import type { Session } from "@/lib/types";
import { cn } from "@/lib/utils";

type SessionDrawerProps = {
  open: boolean;
  sessions: Session[];
  activeId: string;
  onClose: () => void;
  onOpen: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
};

export function SessionDrawer({
  open,
  sessions,
  activeId,
  onClose,
  onOpen,
  onNew,
  onDelete,
}: SessionDrawerProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40">
      <button
        type="button"
        aria-label="关闭讨论列表"
        className="absolute inset-0 bg-bg/70"
        onClick={onClose}
      />
      <aside className="absolute inset-y-0 left-0 flex w-full max-w-sm flex-col bg-surface shadow-hairline">
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <p className="text-sm tracking-label text-muted">讨论</p>
          <button
            type="button"
            onClick={() => {
              onNew();
              onClose();
            }}
            className="h-11 px-2 text-sm text-fg transition-opacity hover:opacity-70"
          >
            新的一段
          </button>
        </div>
        <ul className="flex-1 overflow-y-auto px-2 pb-8">
          {sessions.map((session) => {
            const active = session.id === activeId;
            return (
              <li key={session.id} className="relative">
                <button
                  type="button"
                  onClick={() => {
                    onOpen(session.id);
                    onClose();
                  }}
                  className={cn(
                    "flex w-full flex-col items-start gap-1 rounded-md px-3 py-3 pr-14 text-left transition-colors",
                    active ? "bg-fg/5" : "hover:bg-fg/5",
                  )}
                >
                  <span className="font-serif text-base text-fg">{session.title || "新的一段"}</span>
                  <span className="line-clamp-2 text-sm leading-relaxed text-muted">
                    {session.spine || "还没有脉络"}
                  </span>
                  <span className="text-xs tabular-nums text-subtle">{formatWhen(session.updatedAt)}</span>
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(session.id)}
                  className="absolute top-2 right-2 h-11 px-2 text-xs text-subtle transition-colors hover:text-oppose"
                >
                  删除
                </button>
              </li>
            );
          })}
        </ul>
      </aside>
    </div>
  );
}

function formatWhen(ts: number): string {
  const d = new Date(ts);
  const now = new Date();
  const sameDay =
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate();
  if (sameDay) {
    return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  }
  return `${d.getMonth() + 1}月${d.getDate()}日`;
}
