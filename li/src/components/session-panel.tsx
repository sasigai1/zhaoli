import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { zhCN } from "date-fns/locale";
import { Plus, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export function SessionPanel() {
  const open = useAppStore((s) => s.panelOpen);
  const discussions = useAppStore((s) => s.discussions);
  const currentId = useAppStore((s) => s.currentId);
  const setPanelOpen = useAppStore((s) => s.setPanelOpen);
  const switchDiscussion = useAppStore((s) => s.switchDiscussion);
  const newDiscussion = useAppStore((s) => s.newDiscussion);
  const deleteDiscussion = useAppStore((s) => s.deleteDiscussion);
  const renameDiscussion = useAppStore((s) => s.renameDiscussion);
  const [editingId, setEditingId] = useState<string | null>(null);

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-40 bg-fg/20 transition-opacity duration-fast ease-smooth",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={() => setPanelOpen(false)}
        aria-hidden="true"
      />
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 flex h-full w-80 max-w-[86vw] flex-col bg-surface shadow-paper-hover",
          "transition-transform duration-fast ease-smooth",
          open ? "translate-x-0" : "-translate-x-full",
        )}
        aria-hidden={!open}
        aria-label="讨论列表"
      >
        <div className="flex items-center justify-between px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-3">
            <span className="font-display text-lg text-fg">讨论</span>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="关闭"
            onClick={() => setPanelOpen(false)}
          >
            <X />
          </Button>
        </div>
        <div className="px-3 pb-3">
          <Button
            variant="outline"
            className="h-11 w-full justify-start rounded-lg"
            onClick={newDiscussion}
          >
            <Plus />
            新的讨论
          </Button>
        </div>
        <ul className="min-h-0 flex-1 overflow-y-auto px-2 pb-8">
          {discussions.map((d) => {
            const active = d.id === currentId;
            return (
              <li key={d.id}>
                <div
                  className={cn(
                    "group flex items-start gap-1 rounded-lg px-2 py-2.5",
                    active ? "bg-surface-2" : "hover:bg-bg",
                  )}
                >
                  <button
                    type="button"
                    className="min-w-0 flex-1 text-left"
                    onClick={() => switchDiscussion(d.id)}
                  >
                    {editingId === d.id ? (
                      <input
                        autoFocus
                        defaultValue={d.title}
                        className="font-display w-full bg-transparent text-sm text-fg focus-visible:outline-none"
                        onClick={(e) => e.stopPropagation()}
                        onBlur={(e) => {
                          renameDiscussion(d.id, e.currentTarget.value);
                          setEditingId(null);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            renameDiscussion(d.id, e.currentTarget.value);
                            setEditingId(null);
                          }
                          if (e.key === "Escape") setEditingId(null);
                        }}
                      />
                    ) : (
                      <p
                        className="font-display truncate text-sm text-fg"
                        onDoubleClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setEditingId(d.id);
                        }}
                      >
                        {d.title}
                      </p>
                    )}
                    <p className="mt-0.5 text-xs text-subtle">
                      {d.thoughts.length} 句 ·{" "}
                      {formatDistanceToNow(d.updatedAt, {
                        addSuffix: true,
                        locale: zhCN,
                      })}
                    </p>
                  </button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="opacity-70 group-hover:opacity-100"
                    aria-label={`删除 ${d.title}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (
                        window.confirm(
                          `删除「${d.title}」？此讨论中的脉络会一并消失。`,
                        )
                      ) {
                        deleteDiscussion(d.id);
                      }
                    }}
                  >
                    <Trash2 />
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      </aside>
    </>
  );
}
