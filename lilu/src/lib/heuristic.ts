import type { EdgeKind, Entry, NodeKind, Session, ThoughtEdge, ThoughtNode } from "./types";
import { uid } from "./utils";

export function splitClauses(text: string): string[] {
  return text
    .split(/\n+|(?<=[。！？；;!?])\s*/)
    .map((s) => s.trim())
    .filter((s) => s.length > 1);
}

export function classifyClause(text: string): NodeKind {
  const t = text.trim();
  const isQuestion =
    /[?？]/.test(t) || /^(是不是|为什么|为何|如何|怎么|难道|该不该|要不要|是否|究竟)/.test(t);
  const isObjection =
    /^(但是|可是|然而|不过|偏偏|只是|话虽如此|反过来说|问题是)/.test(t) ||
    /^(but|however|yet)\b/i.test(t);

  if (isObjection && !isQuestion) return "objection";
  if (isQuestion) return "question";
  if (isObjection) return "objection";
  if (
    /^(所以|因此|于是|可见|总之|综上|换句话说|真正的问题)/.test(t) ||
    /^(so|therefore|thus|hence)\b/i.test(t)
  ) {
    return "synthesis";
  }
  if (
    /^(因为|由于|毕竟|原因是|证据是|具体来说)/.test(t) ||
    /^(because|since)\b/i.test(t)
  ) {
    return "evidence";
  }
  if (/矛盾|冲突|一方面|另一方面|既想|又怕|张力/.test(t)) {
    return "tension";
  }
  if (
    /^(如果|假如|或许|也许|万一|假设|先不)/.test(t) ||
    /^(if|maybe|perhaps)\b/i.test(t)
  ) {
    return "aside";
  }
  return "claim";
}

function lastMatching(nodes: ThoughtNode[], kinds: NodeKind[]): ThoughtNode | undefined {
  for (let i = nodes.length - 1; i >= 0; i--) {
    if (kinds.includes(nodes[i].kind)) return nodes[i];
  }
  return nodes.at(-1);
}

function linkKindFor(nodeKind: NodeKind): EdgeKind {
  switch (nodeKind) {
    case "evidence":
      return "supports";
    case "objection":
      return "opposes";
    case "synthesis":
      return "derives";
    case "question":
      return "relates";
    case "tension":
      return "qualifies";
    case "aside":
      return "qualifies";
    default:
      return "answers";
  }
}

function parentFor(kind: NodeKind, nodes: ThoughtNode[]): ThoughtNode | undefined {
  if (nodes.length === 0) return undefined;
  switch (kind) {
    case "evidence":
      return lastMatching(nodes, ["claim", "objection", "synthesis", "question"]);
    case "objection":
      return lastMatching(nodes, ["claim", "synthesis", "question"]);
    case "synthesis":
      return lastMatching(nodes, ["question", "claim", "objection", "tension"]);
    case "claim":
      return lastMatching(nodes, ["question", "claim", "synthesis"]);
    case "aside":
      return lastMatching(nodes, ["question", "claim", "synthesis", "objection"]);
    case "tension":
      return lastMatching(nodes, ["question", "claim"]);
    default:
      return lastMatching(nodes, ["claim", "synthesis", "question"]);
  }
}

export function makeSpine(nodes: ThoughtNode[]): string {
  if (nodes.length === 0) return "";
  const question = nodes.find((n) => n.kind === "question");
  const synthesis = [...nodes].reverse().find((n) => n.kind === "synthesis");
  if (question && synthesis && question.id !== synthesis.id) {
    return `${question.text} → ${synthesis.text}`;
  }
  if (question) return question.text;
  if (synthesis) return synthesis.text;
  return nodes[0].text;
}

export function makeTitle(session: Pick<Session, "title" | "nodes" | "entries">): string {
  const current = session.title.trim();
  if (current && current !== "未命名") return current;
  const question = session.nodes.find((n) => n.kind === "question");
  const source = question?.text ?? session.nodes[0]?.text ?? session.entries[0]?.text ?? "";
  const compact = source.replace(/\s+/g, " ").replace(/[。！？!?]$/, "");
  if (!compact) return "";
  return compact.length > 18 ? `${compact.slice(0, 18)}…` : compact;
}

export function appendFromEntry(session: Session, entry: Entry): Session {
  const clauses = splitClauses(entry.text);
  const pieces = clauses.length > 0 ? clauses : [entry.text.trim()].filter(Boolean);
  const nodes = [...session.nodes];
  const edges = [...session.edges];

  for (const piece of pieces) {
    const kind = classifyClause(piece);
    const node: ThoughtNode = {
      id: uid("n"),
      kind,
      text: piece.replace(/[。；;]$/, ""),
      sourceIds: [entry.id],
      createdAt: entry.createdAt,
    };
    const parent = parentFor(kind, nodes);
    nodes.push(node);
    if (parent) {
      const edge: ThoughtEdge = {
        id: uid("e"),
        from: parent.id,
        to: node.id,
        kind: parent.kind === "question" && kind === "claim" ? "answers" : linkKindFor(kind),
      };
      edges.push(edge);
    }
  }

  const next: Session = {
    ...session,
    nodes,
    edges,
    entries: [...session.entries, entry],
    updatedAt: entry.createdAt,
  };
  next.spine = makeSpine(next.nodes);
  next.title = makeTitle(next);
  return next;
}

export function createBlankSession(): Session {
  const now = Date.now();
  return {
    id: uid("s"),
    title: "",
    createdAt: now,
    updatedAt: now,
    entries: [],
    nodes: [],
    edges: [],
    spine: "",
  };
}
