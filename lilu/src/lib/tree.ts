import type { EdgeKind, Session, ThoughtEdge, ThoughtNode } from "./types";

export interface TreeNode {
  node: ThoughtNode;
  children: TreeNode[];
  incoming: ThoughtEdge[];
  outgoing: ThoughtEdge[];
}

const PARENT_PRIORITY: Record<EdgeKind, number> = {
  answers: 0,
  derives: 1,
  supports: 2,
  opposes: 3,
  qualifies: 4,
  relates: 5,
};

export function buildForest(session: Session): { roots: TreeNode[]; extras: ThoughtEdge[] } {
  const byId = new Map(session.nodes.map((n) => [n.id, n]));
  const incoming = new Map<string, ThoughtEdge[]>();
  const outgoing = new Map<string, ThoughtEdge[]>();

  for (const edge of session.edges) {
    if (!byId.has(edge.from) || !byId.has(edge.to)) continue;
    const ins = incoming.get(edge.to) ?? [];
    ins.push(edge);
    incoming.set(edge.to, ins);
    const outs = outgoing.get(edge.from) ?? [];
    outs.push(edge);
    outgoing.set(edge.from, outs);
  }

  const parentOf = new Map<string, string>();
  const used = new Set<string>();

  const ordered = [...session.nodes];
  for (const node of ordered) {
    const ins = (incoming.get(node.id) ?? [])
      .slice()
      .sort((a, b) => PARENT_PRIORITY[a.kind] - PARENT_PRIORITY[b.kind]);
    for (const edge of ins) {
      if (wouldCycle(parentOf, edge.from, node.id)) continue;
      parentOf.set(node.id, edge.from);
      used.add(edge.id);
      break;
    }
  }

  const wrappers = new Map<string, TreeNode>();
  for (const node of session.nodes) {
    wrappers.set(node.id, {
      node,
      children: [],
      incoming: incoming.get(node.id) ?? [],
      outgoing: outgoing.get(node.id) ?? [],
    });
  }

  const roots: TreeNode[] = [];
  for (const node of session.nodes) {
    const wrap = wrappers.get(node.id)!;
    const parentId = parentOf.get(node.id);
    if (parentId && wrappers.has(parentId)) {
      wrappers.get(parentId)!.children.push(wrap);
    } else {
      roots.push(wrap);
    }
  }

  const extras = session.edges.filter((e) => byId.has(e.from) && byId.has(e.to) && !used.has(e.id));
  return { roots, extras };
}

function wouldCycle(parentOf: Map<string, string>, parentId: string, childId: string): boolean {
  let cursor: string | undefined = parentId;
  const seen = new Set<string>();
  while (cursor) {
    if (cursor === childId) return true;
    if (seen.has(cursor)) return true;
    seen.add(cursor);
    cursor = parentOf.get(cursor);
  }
  return false;
}

export function flattenPreorder(roots: TreeNode[]): ThoughtNode[] {
  const out: ThoughtNode[] = [];
  const walk = (n: TreeNode) => {
    out.push(n.node);
    n.children.forEach(walk);
  };
  roots.forEach(walk);
  return out;
}

export function relatedIds(session: Session, nodeId: string): Set<string> {
  const ids = new Set<string>([nodeId]);
  for (const edge of session.edges) {
    if (edge.from === nodeId) ids.add(edge.to);
    if (edge.to === nodeId) ids.add(edge.from);
  }
  return ids;
}
