import { KIND_LABEL, type ThoughtNode } from "@/lib/types";
import { cn } from "@/lib/utils";

type SpineStripProps = {
  nodes: ThoughtNode[];
  selectedId: string | null;
  organizing: boolean;
  onJump: (id: string) => void;
};

export function SpineStrip({ nodes, selectedId, organizing, onJump }: SpineStripProps) {
  if (nodes.length === 0) return null;

  return (
    <div className="border-b border-border">
      <div className="mx-auto flex max-w-xl items-center gap-0 overflow-x-auto px-4 py-2.5">
        {organizing ? (
          <span className="shimmer text-xs tracking-label">整理</span>
        ) : (
          nodes.map((node, i) => (
            <button
              key={node.id}
              type="button"
              onClick={() => onJump(node.id)}
              className={cn(
                "flex items-center gap-0 font-serif text-xs tracking-mark transition-opacity",
                selectedId === node.id ? "text-fg" : "text-subtle hover:text-muted",
              )}
              aria-label={`${KIND_LABEL[node.kind]} ${node.text}`}
            >
              {i > 0 ? <span className="mx-1.5 text-border">·</span> : null}
              {KIND_LABEL[node.kind]}
            </button>
          ))
        )}
      </div>
    </div>
  );
}
