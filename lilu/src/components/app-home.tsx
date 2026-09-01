import { List, Plus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Composer } from "@/components/composer";
import { FrameworkTree } from "@/components/framework-tree";
import { SessionDrawer } from "@/components/session-drawer";
import { SpineStrip } from "@/components/spine-strip";
import { appendFromEntry, createBlankSession } from "@/lib/heuristic";
import { organizeThoughts } from "@/lib/organize";
import { activeSession, useLilu } from "@/lib/store";
import type { Session } from "@/lib/types";
import { flattenPreorder, buildForest } from "@/lib/tree";
import { cn } from "@/lib/utils";

/* 离线 APK（Capacitor WebView）里没有服务端，organizeThoughts 会永远挂起。
 * 检测到原生环境时改用本地启发式整理（与 addUtterance 的增量逻辑同一套）。 */
function isNativeApp(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof (window as { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor
      ?.isNativePlatform === "function" &&
    window.Capacitor.isNativePlatform()
  );
}

function reorganizeLocally(target: Session): {
  title: string;
  spine: string;
  nodes: Session["nodes"];
  edges: Session["edges"];
} {
  let rebuilt = createBlankSession();
  rebuilt.title = target.title;
  for (const entry of target.entries) rebuilt = appendFromEntry(rebuilt, entry);
  return {
    title: rebuilt.title,
    spine: rebuilt.spine,
    nodes: rebuilt.nodes,
    edges: rebuilt.edges,
  };
}

export function AppHome() {
  const sessions = useLilu((s) => s.sessions);
  const activeId = useLilu((s) => s.activeId);
  const selectedNodeId = useLilu((s) => s.selectedNodeId);
  const organizing = useLilu((s) => s.organizing);
  const organizeError = useLilu((s) => s.organizeError);
  const justAddedIds = useLilu((s) => s.justAddedIds);
  const session = useLilu(activeSession);

  const [listOpen, setListOpen] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState("");

  useEffect(() => {
    void useLilu.persist.rehydrate();
  }, []);

  useEffect(() => {
    if (justAddedIds.length === 0) return;
    const t = window.setTimeout(() => useLilu.getState().clearJustAdded(), 900);
    return () => window.clearTimeout(t);
  }, [justAddedIds]);

  const orderedNodes = useMemo(() => {
    if (!session) return [];
    return flattenPreorder(buildForest(session).roots);
  }, [session]);

  const refine = async (target: NonNullable<typeof session>) => {
    useLilu.getState().setOrganizing(true);
    if (isNativeApp()) {
      // 离线 App：本地启发式整理，立即完成，不会卡住
      const local = reorganizeLocally(target);
      useLilu.getState().applyOrganize(local);
      return;
    }
    try {
      const result = await organizeThoughts({
        data: {
          title: target.title,
          spine: target.spine,
          entries: target.entries.map((e) => ({ id: e.id, text: e.text })),
          nodes: target.nodes.map((n) => ({
            id: n.id,
            kind: n.kind,
            text: n.text,
            sourceIds: n.sourceIds,
            createdAt: n.createdAt,
          })),
          edges: target.edges.map((e) => ({
            id: e.id,
            from: e.from,
            to: e.to,
            kind: e.kind,
          })),
        },
      });
      if (useLilu.getState().activeId !== target.id) {
        useLilu.getState().setOrganizing(false);
        return;
      }
      if (result.ok) {
        useLilu.getState().applyOrganize({
          title: result.title,
          spine: result.spine,
          nodes: result.nodes,
          edges: result.edges,
        });
      } else {
        useLilu.getState().setOrganizing(false, result.error === "unavailable" ? "unavailable" : "failed");
      }
    } catch {
      useLilu.getState().setOrganizing(false, "failed");
    }
  };

  const onSubmit = (text: string) => {
    const added = useLilu.getState().addUtterance(text);
    if (!added) return;
    void refine(added.session);
  };

  const jump = (id: string) => {
    useLilu.getState().setSelected(id);
    document.getElementById(`node-${id}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  if (!session) {
    return (
      <div className="flex min-h-dvh flex-col bg-bg">
        <header className="flex h-14 items-center justify-center">
          <p className="text-sm tracking-brand text-muted">理路</p>
        </header>
      </div>
    );
  }

  const untitled = !session.title.trim();

  return (
    <div className="flex min-h-dvh flex-col bg-bg text-fg">
      <header className="flex h-14 items-center gap-2 px-2 sm:px-3">
        <button
          type="button"
          aria-label="讨论列表"
          onClick={() => setListOpen(true)}
          className="flex size-11 items-center justify-center text-muted transition-colors hover:text-fg"
        >
          <List className="size-5" strokeWidth={1.5} />
        </button>
        <div className="min-w-0 flex-1 text-center">
          {editingTitle ? (
            <input
              autoFocus
              value={titleDraft}
              aria-label="讨论标题"
              className="w-full bg-transparent text-center font-serif text-base text-fg outline-none"
              onChange={(e) => setTitleDraft(e.target.value)}
              onBlur={() => {
                useLilu.getState().renameSession(titleDraft);
                setEditingTitle(false);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  useLilu.getState().renameSession(titleDraft);
                  setEditingTitle(false);
                }
                if (e.key === "Escape") setEditingTitle(false);
              }}
            />
          ) : (
            <button
              type="button"
              className={cn(
                "max-w-full truncate font-serif text-base",
                untitled ? "text-muted" : "text-fg",
              )}
              onClick={() => {
                setTitleDraft(session.title);
                setEditingTitle(true);
              }}
            >
              {session.title || "新的一段"}
            </button>
          )}
        </div>
        <button
          type="button"
          aria-label="新的一段讨论"
          onClick={() => useLilu.getState().newSession()}
          className="flex size-11 items-center justify-center text-muted transition-colors hover:text-fg"
        >
          <Plus className="size-5" strokeWidth={1.5} />
        </button>
      </header>

      <SpineStrip
        nodes={orderedNodes}
        selectedId={selectedNodeId}
        organizing={organizing}
        onJump={jump}
      />

      <main className="flex min-h-0 flex-1 flex-col overflow-y-auto">
        {session.spine && session.nodes.length > 0 ? (
          <p className="mx-auto max-w-xl px-4 pt-6 pb-2 text-sm leading-relaxed text-pretty text-muted">
            {session.spine}
          </p>
        ) : null}
        <FrameworkTree
          session={session}
          selectedId={selectedNodeId}
          justAddedIds={justAddedIds}
          onSelect={(id) => useLilu.getState().setSelected(id)}
        />
        {session.entries.length >= 2 ? (
          <div className="mx-auto w-full max-w-xl px-4 pb-10">
            <button
              type="button"
              disabled={organizing}
              onClick={() => void refine(session)}
              className="text-sm text-muted transition-colors hover:text-fg disabled:opacity-40"
            >
              重新整理
            </button>
            {organizeError && organizeError !== "unavailable" ? (
              <p className="mt-2 text-xs text-muted">这一段先按字面接上了。</p>
            ) : null}
          </div>
        ) : null}
      </main>

      <Composer organizing={organizing} onSubmit={onSubmit} />

      <SessionDrawer
        open={listOpen}
        sessions={sessions}
        activeId={activeId}
        onClose={() => setListOpen(false)}
        onOpen={(id) => useLilu.getState().openSession(id)}
        onNew={() => useLilu.getState().newSession()}
        onDelete={(id) => useLilu.getState().deleteSession(id)}
      />
    </div>
  );
}
