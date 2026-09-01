export const NODE_KINDS = [
  "question",
  "claim",
  "evidence",
  "objection",
  "tension",
  "synthesis",
  "aside",
] as const;

export type NodeKind = (typeof NODE_KINDS)[number];

export const EDGE_KINDS = [
  "supports",
  "opposes",
  "answers",
  "derives",
  "qualifies",
  "relates",
] as const;

export type EdgeKind = (typeof EDGE_KINDS)[number];

export const KIND_LABEL: Record<NodeKind, string> = {
  question: "问",
  claim: "立",
  evidence: "据",
  objection: "驳",
  tension: "折",
  synthesis: "合",
  aside: "旁",
};

export const EDGE_LABEL: Record<EdgeKind, string> = {
  supports: "支持",
  opposes: "反驳",
  answers: "回应",
  derives: "推出",
  qualifies: "限定",
  relates: "相关",
};

export interface ThoughtNode {
  id: string;
  kind: NodeKind;
  text: string;
  sourceIds: string[];
  createdAt: number;
}

export interface ThoughtEdge {
  id: string;
  from: string;
  to: string;
  kind: EdgeKind;
}

export interface Entry {
  id: string;
  text: string;
  createdAt: number;
}

export interface Session {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  entries: Entry[];
  nodes: ThoughtNode[];
  edges: ThoughtEdge[];
  spine: string;
}

export function isNodeKind(value: string): value is NodeKind {
  return (NODE_KINDS as readonly string[]).includes(value);
}

export function isEdgeKind(value: string): value is EdgeKind {
  return (EDGE_KINDS as readonly string[]).includes(value);
}
