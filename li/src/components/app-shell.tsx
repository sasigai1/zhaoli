import { useEffect, useState } from "react";
import { Expand, List, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Composer } from "@/components/composer";
import { SessionPanel } from "@/components/session-panel";
import { FitViewButton, ThoughtCanvas } from "@/components/thought-canvas";
import { useAppStore, useCurrentDiscussion } from "@/lib/store";

export function AppShell() {
  const discussion = useCurrentDiscussion();
  const setPanelOpen = useAppStore((s) => s.setPanelOpen);
  const newDiscussion = useAppStore((s) => s.newDiscussion);
  const renameDiscussion = useAppStore((s) => s.renameDiscussion);
  const finishHydration = useAppStore((s) => s.finishHydration);
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState(discussion.title);

  useEffect(() => {
    void useAppStore.persist.rehydrate();
    const t = window.setTimeout(() => {
      if (!useAppStore.getState().hydrated) finishHydration();
    }, 80);
    return () => window.clearTimeout(t);
  }, [finishHydration]);

  useEffect(() => {
    setTitleDraft(discussion.title);
    setEditingTitle(false);
  }, [discussion.id, discussion.title]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      const s = useAppStore.getState();
      if (s.editingId) s.setEditing(null);
      else if (s.linkMode) s.setLinkMode(false);
      else if (s.panelOpen) s.setPanelOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const commitTitle = () => {
    renameDiscussion(discussion.id, titleDraft);
    setEditingTitle(false);
  };

  return (
    <div className="paper-grain flex h-dvh flex-col overflow-hidden">
      <header className="relative z-20 flex shrink-0 items-center gap-2 px-2 pt-[max(0.5rem,env(safe-area-inset-top))] pb-1 md:px-4">
        <Button
          variant="ghost"
          size="icon"
          aria-label="打开讨论列表"
          onClick={() => setPanelOpen(true)}
        >
          <List />
        </Button>

        <div className="min-w-0 flex-1">
          <p className="font-display text-xs tracking-mark text-muted">理路</p>
          {editingTitle ? (
            <Input
              autoFocus
              value={titleDraft}
              onChange={(e) => setTitleDraft(e.target.value)}
              onBlur={commitTitle}
              onKeyDown={(e) => {
                if (e.key === "Enter") commitTitle();
                if (e.key === "Escape") {
                  setTitleDraft(discussion.title);
                  setEditingTitle(false);
                }
              }}
              className="font-display h-8 text-lg leading-tight text-fg"
              aria-label="讨论标题"
            />
          ) : (
            <button
              type="button"
              className="font-display block max-w-full truncate text-left text-lg leading-tight text-fg"
              onClick={() => setEditingTitle(true)}
            >
              {discussion.title}
            </button>
          )}
        </div>

        <FitViewButton
          className="hidden h-11 items-center gap-1.5 rounded-md px-3 text-sm text-muted hover:bg-surface-2 hover:text-fg sm:inline-flex"
        >
          看全貌
        </FitViewButton>
        <FitViewButton
          size="icon"
          className="text-muted sm:hidden"
          aria-label="看全貌"
        >
          <Expand />
        </FitViewButton>
        <Button
          variant="ghost"
          size="icon"
          aria-label="新的讨论"
          onClick={newDiscussion}
        >
          <Plus />
        </Button>
      </header>

      <ThoughtCanvas />
      <Composer />
      <SessionPanel />
    </div>
  );
}
