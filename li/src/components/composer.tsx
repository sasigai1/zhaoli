import { useEffect, useRef } from "react";
import { CornerDownLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { RELATION_META, RELATIONS } from "@/lib/types";
import { useAppStore, useCurrentDiscussion, useSelectedPath } from "@/lib/store";
import { cn } from "@/lib/utils";

export function Composer() {
  const discussion = useCurrentDiscussion();
  const path = useSelectedPath();
  const text = useAppStore((s) => s.composerText);
  const relation = useAppStore((s) => s.relation);
  const selectedId = useAppStore((s) => s.selectedId);
  const editingId = useAppStore((s) => s.editingId);
  const setComposerText = useAppStore((s) => s.setComposerText);
  const setRelation = useAppStore((s) => s.setRelation);
  const addThought = useAppStore((s) => s.addThought);
  const select = useAppStore((s) => s.select);
  const navigate = useAppStore((s) => s.navigate);
  const ref = useRef<HTMLTextAreaElement>(null);

  const attach = path.length > 0 ? path[path.length - 1] : null;
  const meta = RELATION_META[relation];
  const canSubmit = text.trim().length > 0;
  const showHint = discussion.thoughts.length < 4;
  const relationsEnabled = Boolean(selectedId) || discussion.thoughts.length === 0;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 152)}px`;
  }, [text]);

  useEffect(() => {
    if (editingId) return;
    if (typeof window === "undefined") return;
    if (window.matchMedia("(pointer: fine)").matches) {
      ref.current?.focus();
    }
  }, [selectedId, editingId]);

  const submit = () => {
    if (!canSubmit) return;
    addThought();
    ref.current?.focus();
  };

  return (
    <footer className="bg-bg/95 relative z-20 shrink-0 border-t border-border/70 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-sm md:px-6">
      {path.length > 0 ? (
        <nav
          className="mb-2 flex max-w-3xl items-center gap-1 overflow-x-auto text-xs text-muted"
          aria-label="当前脉络"
        >
          {path.map((node, i) => (
            <span key={node.id} className="flex shrink-0 items-center gap-1">
              {i > 0 ? <span className="text-subtle">/</span> : null}
              <button
                type="button"
                className={cn(
                  "max-w-36 truncate rounded-sm px-1 py-1 hover:text-fg",
                  i === path.length - 1 && "text-fg",
                )}
                onClick={() => select(node.id)}
              >
                {node.text.replace(/\s+/g, " ")}
              </button>
            </span>
          ))}
          <button
            type="button"
            className="ml-2 shrink-0 py-1 text-subtle hover:text-muted"
            onClick={() => select(null)}
          >
            新起点
          </button>
        </nav>
      ) : (
        <p className="mb-2 text-xs text-muted">
          {discussion.thoughts.length === 0
            ? "第一句会成为这次讨论的起点"
            : "未点选 · 下一句将作为新的起点"}
        </p>
      )}

      <div className="mx-auto flex max-w-3xl flex-col gap-2">
        <div
          className="flex items-center gap-0.5"
          role="radiogroup"
          aria-label="接续方式"
        >
          {RELATIONS.map((r) => {
            const m = RELATION_META[r];
            const active = relation === r;
            return (
              <button
                key={r}
                type="button"
                role="radio"
                aria-checked={active}
                disabled={!relationsEnabled}
                onClick={() => setRelation(r)}
                className={cn(
                  "h-11 min-w-11 rounded-md px-3 text-sm transition-colors duration-quick ease-smooth",
                  active ? "bg-surface-2 text-fg" : "text-muted hover:text-fg",
                  !relationsEnabled && "opacity-40",
                )}
                title={m.hint}
              >
                <span className="font-display">{m.label}</span>
                <span className="ml-1 hidden text-xs text-subtle sm:inline">
                  {m.hint}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex items-end gap-3">
          <label className="sr-only" htmlFor="lilu-composer">
            写下这一步的想法
          </label>
          <Textarea
            id="lilu-composer"
            ref={ref}
            rows={1}
            value={text}
            placeholder={
              attach ? meta.placeholder : "写下你正在想的第一件事…"
            }
            onChange={(e) => setComposerText(e.target.value)}
            onKeyDown={(e) => {
              if (e.nativeEvent.isComposing || e.keyCode === 229) return;
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                submit();
                return;
              }
              if (text.trim().length > 0) return;
              if (e.key === "ArrowUp") {
                e.preventDefault();
                navigate("parent");
              } else if (e.key === "ArrowDown") {
                e.preventDefault();
                navigate("child");
              } else if (e.key === "ArrowLeft") {
                e.preventDefault();
                navigate("prev");
              } else if (e.key === "ArrowRight") {
                e.preventDefault();
                navigate("next");
              }
            }}
            className="font-display min-h-11 flex-1 py-2.5 text-base leading-normal"
          />
          <Button
            type="button"
            variant="accent"
            className="mb-0.5 h-11 shrink-0 rounded-lg px-4"
            disabled={!canSubmit}
            onClick={submit}
            aria-label="记入"
          >
            记入
            <CornerDownLeft className="hidden sm:block" />
          </Button>
        </div>

        {showHint ? (
          <p className="text-xs text-subtle">
            Enter 记入 · 点选节点接上 · 往上翻看脉络
          </p>
        ) : (
          <p className="hidden text-xs text-subtle sm:block">
            拖动想法改挂接 · 用「连」把两个角度关联起来
          </p>
        )}
      </div>
    </footer>
  );
}
