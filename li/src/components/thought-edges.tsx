import type { Box } from "@/lib/layout";
import { arcEdge, cubicEdge, midpointOnCubic } from "@/lib/layout";
import {
  RELATION_META,
  type ExtraLink,
  type Relation,
  type Thought,
} from "@/lib/types";
import { cn } from "@/lib/utils";

type Props = {
  thoughts: Thought[];
  links: ExtraLink[];
  boxes: Record<string, Box>;
  selectedId: string | null;
  selectedPath: Set<string>;
  width: number;
  height: number;
  scale: number;
  dragLine: { x1: number; y1: number; x2: number; y2: number } | null;
  onRemoveLink: (id: string) => void;
};

function dash(relation: Relation): string | undefined {
  if (relation === "branch") return "7 6";
  if (relation === "question") return "2.5 4.5";
  return undefined;
}

function treeEdges(thoughts: Thought[], boxes: Record<string, Box>) {
  const edges: {
    id: string;
    parentId: string;
    relation: Relation;
    x1: number;
    y1: number;
    x2: number;
    y2: number;
  }[] = [];
  for (const t of thoughts) {
    if (!t.parentId) continue;
    const from = boxes[t.parentId];
    const to = boxes[t.id];
    if (!from || !to) continue;
    edges.push({
      id: t.id,
      parentId: t.parentId,
      relation: t.relation,
      x1: from.x + from.w / 2,
      y1: from.y + from.h,
      x2: to.x + to.w / 2,
      y2: to.y,
    });
  }
  return edges;
}

export function ThoughtEdges({
  thoughts,
  links,
  boxes,
  selectedId,
  selectedPath,
  width,
  height,
  scale,
  dragLine,
  onRemoveLink,
}: Props) {
  const edges = treeEdges(thoughts, boxes);
  const showLabels = scale >= 0.55;

  return (
    <svg
      className="pointer-events-none absolute top-0 left-0 overflow-visible"
      width={width}
      height={height}
      aria-hidden="true"
    >
      {links.map((link) => {
        const from = boxes[link.fromId];
        const to = boxes[link.toId];
        if (!from || !to) return null;
        const x1 = from.x + from.w / 2;
        const y1 = from.y + from.h / 2;
        const x2 = to.x + to.w / 2;
        const y2 = to.y + to.h / 2;
        const mx = (x1 + x2) / 2;
        const my = (y1 + y2) / 2;
        return (
          <g key={link.id} className="pointer-events-auto">
            <path
              d={arcEdge(x1, y1, x2, y2)}
              fill="none"
              stroke="currentColor"
              className="text-accent/40"
              strokeWidth={1.1}
              strokeDasharray="3 5"
            />
            <circle
              cx={mx}
              cy={my}
              r={8}
              className="fill-bg stroke-accent/50 cursor-pointer"
              strokeWidth={1}
              onClick={(e) => {
                e.stopPropagation();
                onRemoveLink(link.id);
              }}
            >
              <title>移除这条联想</title>
            </circle>
            <text
              x={mx}
              y={my}
              textAnchor="middle"
              dominantBaseline="central"
              className="fill-accent pointer-events-none font-display"
              fontSize={10}
            >
              联
            </text>
          </g>
        );
      })}

      {edges.map((e) => {
        const onPath =
          selectedPath.has(e.id) ||
          (selectedId !== null && e.parentId === selectedId);
        const d = cubicEdge(e.x1, e.y1, e.x2, e.y2);
        const mid = midpointOnCubic(e.x1, e.y1, e.x2, e.y2);
        const isCounter = e.relation === "counter";
        const label = RELATION_META[e.relation].label;
        return (
          <g key={e.id}>
            <path
              d={d}
              fill="none"
              stroke="currentColor"
              className={cn(
                "transition-colors duration-fast ease-smooth",
                isCounter
                  ? onPath
                    ? "text-accent/80"
                    : "text-accent/35"
                  : onPath
                    ? "text-ink-mid"
                    : "text-ink-faint",
              )}
              strokeWidth={onPath ? 1.7 : 1.1}
              strokeDasharray={dash(e.relation)}
              strokeLinecap="round"
            />
            {showLabels && onPath ? (
              <g transform={`translate(${mid.x}, ${mid.y})`}>
                <rect
                  x={-8}
                  y={-8}
                  width={16}
                  height={16}
                  rx={8}
                  className="fill-bg"
                />
                <text
                  textAnchor="middle"
                  dominantBaseline="central"
                  className={cn(
                    "font-display",
                    isCounter ? "fill-accent" : "fill-fg",
                  )}
                  fontSize={11}
                >
                  {label}
                </text>
              </g>
            ) : null}
          </g>
        );
      })}

      {dragLine ? (
        <path
          d={cubicEdge(dragLine.x1, dragLine.y1, dragLine.x2, dragLine.y2)}
          fill="none"
          stroke="currentColor"
          className="text-accent"
          strokeWidth={1.4}
          strokeDasharray="4 4"
          strokeLinecap="round"
        />
      ) : null}
    </svg>
  );
}
