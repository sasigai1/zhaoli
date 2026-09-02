import { useEffect, useRef, useState } from "react";
import { ChevronsDownUp, Link2, Pencil, Trash2 } from "lucide-react";
import type { Box } from "@/lib/layout";
import { childrenOf, MAX_LINES } from "@/lib/layout";
import type { Thought } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type Props = {
  thought: Thought;
  box: Box;
  thoughts: Thought[];
  selected: boolean;
  dimmed: boolean;
  collapsed: boolean;
  justAdded: boolean;
  linkMode: boolean;
  dropTarget: boolean;
  compact: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onToggleCollapse: () => void;
  onStartLink: () => void;
  onDragPointerDown: (e: React.PointerEvent) => void;
  editing: boolean;
  onCommitEdit: (text: string) => void;
  onCancelEdit: () => void;
};

export function ThoughtNode({
  thought,
  box,
  thoughts,
  selected,
  dimmed,
  collapsed,
  justAdded,
  linkMode,
  dropTarget,
  compact,
  onSelect,
  onEdit,
  onDelete,
  onToggleCollapse,
  onStartLink,
  onDragPointerDown,
  editing,
  onCommitEdit,
  onCancelEdit,
}: Props) {
  const childCount = childrenOf(thoughts, thought.id).length;
  const [draft, setDraft] = useState(thought.text);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setDraft(thought.text);
  }, [thought.text, editing]);

  useEffect(() => {
    if (!editing) return;
    const el = textareaRef.current;
    if (!el) return;
    el.focus();
    el.setSelectionRange(el.value.length, el.value.length);
  }, [editing]);

  const commit = () => {
    const next = draft.trim();
    if (!next) {
      setDraft(thought.text);
      onCancelEdit();
      return;
    }
    onCommitEdit(next);
  };

  return (
    <article
      data-node-id={thought.id}
      className={cn(
        "absolute origin-top select-none",
        "transition-opacity duration-fast ease-smooth",
        justAdded && "animate-node-in",
        dimmed && "opacity-30",
      )}
      style={{
        left: box.x,
        top: box.y,
        width: box.w,
      }}
    >
      {selected && !editing ? (
        <div
          className="absolute -top-9 right-0 z-20 flex rounded-md bg-surface shadow-paper"
          onPointerDown={(e) => e.stopPropagation()}
        >
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="编辑"
                onClick={onEdit}
              >
                <Pencil />
              </Button>
            </TooltipTrigger>
            <TooltipContent>编辑</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="连接到另一个想法"
                onClick={onStartLink}
              >
                <Link2 />
              </Button>
            </TooltipTrigger>
            <TooltipContent>连到另一处</TooltipContent>
          </Tooltip>
          {childCount > 0 ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label={collapsed ? "展开分叉" : "收起分叉"}
                  onClick={onToggleCollapse}
                >
                  <ChevronsDownUp />
                </Button>
              </TooltipTrigger>
              <TooltipContent>{collapsed ? "展开" : "收起"}</TooltipContent>
            </Tooltip>
          ) : null}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="删除"
                onClick={onDelete}
              >
                <Trash2 />
              </Button>
            </TooltipTrigger>
            <TooltipContent>删除这条脉络</TooltipContent>
          </Tooltip>
        </div>
      ) : null}

      <div
        className={cn(
          "relative rounded-md px-4 py-3.5 text-left",
          "transition-[box-shadow,background-color,opacity] duration-quick ease-smooth",
          selected
            ? "bg-surface shadow-ink"
            : "hover:bg-surface/80",
          dropTarget && "bg-surface shadow-drop",
          linkMode && "cursor-alias",
          !linkMode && "cursor-pointer",
        )}
        onPointerDown={(e) => {
          if (e.button !== 0) return;
          e.stopPropagation();
          onSelect();
          if (editing || linkMode) return;
          onDragPointerDown(e);
        }}
        onDoubleClick={(e) => {
          e.stopPropagation();
          onEdit();
        }}
      >
        {editing ? (
          <textarea
            ref={textareaRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onPointerDown={(e) => e.stopPropagation()}
            onKeyDown={(e) => {
              if (e.nativeEvent.isComposing || e.keyCode === 229) return;
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                commit();
              }
              if (e.key === "Escape") {
                e.preventDefault();
                setDraft(thought.text);
                onCancelEdit();
              }
            }}
            onBlur={commit}
            className="font-display w-full resize-none bg-transparent text-sm leading-normal break-words text-fg focus-visible:outline-none"
            rows={Math.min(MAX_LINES, Math.max(2, draft.split("\n").length))}
            aria-label="编辑想法"
          />
        ) : (
          <p
            className={cn(
              "font-display text-sm leading-normal break-words text-fg",
              compact ? "line-clamp-1" : "line-clamp-4",
            )}
          >
            {thought.text}
          </p>
        )}

        {collapsed && childCount > 0 ? (
          <span className="mt-2 inline-block text-xs tabular-nums text-muted">
            {childCount} 条分叉
          </span>
        ) : null}
      </div>
    </article>
  );
}
