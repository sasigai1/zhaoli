import type { Relation, Thought } from "./types";

export type Box = { x: number; y: number; w: number; h: number };
export type NavDir = "parent" | "child" | "prev" | "next";

export const NODE_WIDTH = 256;
export const NODE_PAD_X = 18;
export const NODE_PAD_Y = 14;
export const LINE_HEIGHT = 22;
export const MAX_LINES = 4;
export const H_GAP = 40;
export const V_GAP = 64;
export const FOREST_GAP = 80;
export const LAYOUT_PAD = 56;

const CHAR_W = 14;

const RELATION_ORDER: Record<Relation, number> = {
  counter: 0,
  question: 1,
  continue: 2,
  branch: 3,
};

export function estimateNodeHeight(text: string): number {
  const contentW = NODE_WIDTH - NODE_PAD_X * 2;
  let lines = 0;
  const paragraphs = text.length === 0 ? [""] : text.split("\n");
  for (const p of paragraphs) {
    const width = Math.max(1, [...p].length) * CHAR_W;
    lines += Math.max(1, Math.ceil(width / contentW));
  }
  lines = Math.min(MAX_LINES, Math.max(1, lines));
  return NODE_PAD_Y * 2 + lines * LINE_HEIGHT;
}

export function childrenOf(
  thoughts: Thought[],
  parentId: string | null,
): Thought[] {
  return thoughts
    .filter((t) => t.parentId === parentId)
    .sort((a, b) => {
      const d = RELATION_ORDER[a.relation] - RELATION_ORDER[b.relation];
      if (d !== 0) return d;
      return a.createdAt - b.createdAt;
    });
}

export function descendantIds(
  thoughts: Thought[],
  rootId: string,
): Set<string> {
  const ids = new Set<string>();
  const walk = (id: string) => {
    for (const child of childrenOf(thoughts, id)) {
      ids.add(child.id);
      walk(child.id);
    }
  };
  walk(rootId);
  return ids;
}

export function pathToRoot(
  thoughts: Thought[],
  id: string | null,
): Thought[] {
  if (!id) return [];
  const byId = new Map(thoughts.map((t) => [t.id, t]));
  const path: Thought[] = [];
  const seen = new Set<string>();
  let cur = byId.get(id);
  while (cur && !seen.has(cur.id)) {
    path.push(cur);
    seen.add(cur.id);
    cur = cur.parentId ? byId.get(cur.parentId) : undefined;
  }
  return path.reverse();
}

export function isDescendant(
  thoughts: Thought[],
  ancestorId: string,
  nodeId: string,
): boolean {
  return descendantIds(thoughts, ancestorId).has(nodeId);
}

export function adjacentThought(
  thoughts: Thought[],
  id: string | null,
  dir: NavDir,
): string | null {
  if (!id) return childrenOf(thoughts, null)[0]?.id ?? null;
  const node = thoughts.find((t) => t.id === id);
  if (!node) return childrenOf(thoughts, null)[0]?.id ?? null;

  if (dir === "parent") return node.parentId;
  if (dir === "child") return childrenOf(thoughts, id)[0]?.id ?? null;

  const siblings = childrenOf(thoughts, node.parentId);
  const i = siblings.findIndex((s) => s.id === id);
  if (i < 0) return null;
  if (dir === "prev") {
    return i > 0 ? siblings[i - 1]!.id : node.parentId;
  }
  if (i < siblings.length - 1) return siblings[i + 1]!.id;
  return childrenOf(thoughts, id)[0]?.id ?? null;
}

export function layoutThoughts(
  thoughts: Thought[],
  collapsedIds: Set<string>,
): { boxes: Record<string, Box>; width: number; height: number } {
  const boxes: Record<string, Box> = {};
  const roots = childrenOf(thoughts, null);

  const layoutNode = (
    node: Thought,
    left: number,
    top: number,
  ): { width: number; height: number } => {
    const h = estimateNodeHeight(node.text);
    const w = NODE_WIDTH;
    const collapsed = collapsedIds.has(node.id);
    const kids = collapsed ? [] : childrenOf(thoughts, node.id);

    if (kids.length === 0) {
      boxes[node.id] = { x: left, y: top, w, h };
      return { width: w, height: h };
    }

    let childLeft = left;
    let maxChildH = 0;
    for (const child of kids) {
      const size = layoutNode(child, childLeft, top + h + V_GAP);
      childLeft += size.width + H_GAP;
      maxChildH = Math.max(maxChildH, size.height);
    }

    const childrenWidth = childLeft - left - H_GAP;
    const totalWidth = Math.max(w, childrenWidth);
    const nodeX = left + (totalWidth - w) / 2;
    boxes[node.id] = { x: nodeX, y: top, w, h };

    return { width: totalWidth, height: h + V_GAP + maxChildH };
  };

  let x = LAYOUT_PAD;
  let maxH = 0;
  for (const root of roots) {
    const size = layoutNode(root, x, LAYOUT_PAD);
    x += size.width + FOREST_GAP;
    maxH = Math.max(maxH, size.height);
  }

  const width = Math.max(
    NODE_WIDTH + LAYOUT_PAD * 2,
    x - FOREST_GAP + LAYOUT_PAD,
  );
  const height = Math.max(
    estimateNodeHeight(" ") + LAYOUT_PAD * 2,
    maxH + LAYOUT_PAD * 2,
  );

  return { boxes, width, height };
}

export function cubicEdge(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
): string {
  const dy = Math.max(28, Math.abs(y2 - y1) * 0.45);
  return `M ${x1} ${y1} C ${x1} ${y1 + dy}, ${x2} ${y2 - dy}, ${x2} ${y2}`;
}

export function arcEdge(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
): string {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const cx = (x1 + x2) / 2 - dy * 0.22;
  const cy = (y1 + y2) / 2 + dx * 0.22;
  return `M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`;
}

export function midpointOnCubic(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
): { x: number; y: number } {
  const dy = Math.max(28, Math.abs(y2 - y1) * 0.45);
  const t = 0.5;
  const p1y = y1 + dy;
  const p2y = y2 - dy;
  const u = 1 - t;
  return {
    x: u * u * u * x1 + 3 * u * u * t * x1 + 3 * u * t * t * x2 + t * t * t * x2,
    y:
      u * u * u * y1 +
      3 * u * u * t * p1y +
      3 * u * t * t * p2y +
      t * t * t * y2,
  };
}
