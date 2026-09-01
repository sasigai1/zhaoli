import { List, Plus, Settings2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Composer } from "@/components/composer";
import { FrameworkTree } from "@/components/framework-tree";
import { SessionDrawer } from "@/components/session-drawer";
import { SpineStrip } from "@/components/spine-strip";
import { getAiConfig, organizeWithAi, saveAiConfig } from "@/lib/ai";
import { appendFromEntry, createBlankSession } from "@/lib/heuristic";
import { organizeThoughts } from "@/lib/organize";
import { activeSession, useLilu } from "@/lib/store";
import type { Session } from "@/lib/types";
import { flattenPreorder, buildForest } from "@/lib/tree";
import { cn } from "@/lib/utils";

/* 离线 APK（Capacitor WebView）里没有服务端，organizeThoughts 会永远挂起。
 * 检测到原生环境时改用本地启发式整理（与 addUtterance 的增量逻辑同一套）。 */
function isNativeApp(): boolean {
  if (typeof window === "undefined") return false;
  const cap = (window as { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor;
  return typeof cap?.isNativePlatform === "function" && cap.isNativePlatform();
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
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [keyDraft, setKeyDraft] = useState("");
  const [baseUrlDraft, setBaseUrlDraft] = useState("https://api.x.ai/v1");
  const [modelDraft, setModelDraft] = useState("grok-4.5");

  useEffect(() => {
    if (settingsOpen) {
      const saved = getAiConfig();
      setKeyDraft(saved?.apiKey ?? "");
      setBaseUrlDraft(saved?.baseUrl ?? "https://api.x.ai/v1");
      setModelDraft(saved?.model ?? "grok-4.5");
    }
  }, [settingsOpen]);

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
      // 离线 App：配置了 AI Key 就直连，否则/失败时用本地启发式整理兜底
      const aiConfig = getAiConfig();
      if (aiConfig) {
        try {
          const result = await organizeWithAi(
            {
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
            aiConfig,
          );
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
            return;
          }
          // AI 失败 → 本地兜底，并提示
          const local = reorganizeLocally(target);
          useLilu.getState().applyOrganize(local);
          useLilu.getState().setOrganizing(false, "ai-failed");
          return;
        } catch {
          const local = reorganizeLocally(target);
          useLilu.getState().applyOrganize(local);
          useLilu.getState().setOrganizing(false, "ai-failed");
          return;
        }
      }
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
        {isNativeApp() ? (
          <button
            type="button"
            aria-label="AI 设置"
            onClick={() => setSettingsOpen(true)}
            className="flex size-11 items-center justify-center text-muted transition-colors hover:text-fg"
          >
            <Settings2 className="size-5" strokeWidth={1.5} />
          </button>
        ) : null}
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
            {organizeError === "ai-failed" ? (
              <p className="mt-2 text-xs text-muted">AI 整理失败，已按字面整理。可在右上角设置里检查 Key。</p>
            ) : organizeError && organizeError !== "unavailable" ? (
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

      {isNativeApp() && settingsOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 sm:items-center"
          onClick={() => setSettingsOpen(false)}
        >
          <div
            className="w-full max-w-md border border-border bg-surface p-5 pb-8 sm:rounded-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="font-serif text-base text-fg">AI 整理设置</p>
            <p className="mt-1 text-xs leading-relaxed text-muted">
              填入 OpenAI 兼容接口的 API Key（xAI / DeepSeek / GLM / Kimi 等），整理时将直连 AI。
              留空则使用本地规则整理。Key 只保存在本机。
            </p>
            <label className="mt-4 block text-xs text-muted" htmlFor="ai-base-url">
              接口地址
            </label>
            <input
              id="ai-base-url"
              value={baseUrlDraft}
              onChange={(e) => setBaseUrlDraft(e.target.value)}
              placeholder="https://api.x.ai/v1"
              className="mt-1 w-full rounded border border-border bg-elevated px-3 py-2 text-sm text-fg outline-none focus:border-accent"
            />
            <label className="mt-3 block text-xs text-muted" htmlFor="ai-model">
              模型
            </label>
            <input
              id="ai-model"
              value={modelDraft}
              onChange={(e) => setModelDraft(e.target.value)}
              placeholder="grok-4.5"
              className="mt-1 w-full rounded border border-border bg-elevated px-3 py-2 text-sm text-fg outline-none focus:border-accent"
            />
            <label className="mt-3 block text-xs text-muted" htmlFor="ai-key">
              API Key
            </label>
            <input
              id="ai-key"
              type="password"
              value={keyDraft}
              onChange={(e) => setKeyDraft(e.target.value)}
              placeholder="sk-…"
              className="mt-1 w-full rounded border border-border bg-elevated px-3 py-2 text-sm text-fg outline-none focus:border-accent"
            />
            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setSettingsOpen(false)}
                className="rounded px-4 py-2 text-sm text-muted transition-colors hover:text-fg"
              >
                取消
              </button>
              <button
                type="button"
                onClick={() => {
                  if (keyDraft.trim() && baseUrlDraft.trim() && modelDraft.trim()) {
                    saveAiConfig({
                      apiKey: keyDraft,
                      baseUrl: baseUrlDraft,
                      model: modelDraft,
                    });
                  }
                  setSettingsOpen(false);
                }}
                className="rounded bg-accent px-4 py-2 text-sm text-accent-fg transition-opacity hover:opacity-90"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
