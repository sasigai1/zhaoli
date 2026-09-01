import { createServerFn } from "@tanstack/react-start";
import {
  isEdgeKind,
  isNodeKind,
  type EdgeKind,
  type NodeKind,
  type ThoughtEdge,
  type ThoughtNode,
} from "./types";

export type OrganizePayload = {
  title: string;
  spine: string;
  entries: { id: string; text: string }[];
  nodes: { id: string; kind: NodeKind; text: string; sourceIds: string[]; createdAt: number }[];
  edges: { id: string; from: string; to: string; kind: EdgeKind }[];
};

export type OrganizeResult =
  | {
      ok: true;
      title: string;
      spine: string;
      nodes: ThoughtNode[];
      edges: ThoughtEdge[];
    }
  | { ok: false; error: string };

type ModelJson = {
  title?: unknown;
  spine?: unknown;
  nodes?: unknown;
  edges?: unknown;
};

export const ORGANIZE_SYSTEM_PROMPT = `你是「理路」的整理者。把用户的自我讨论整理成论证脉络图。只依据用户原话，不发明新观点。

节点 kind 只能是: question, claim, evidence, objection, tension, synthesis, aside
边 kind 只能是: supports, opposes, answers, derives, qualifies, relates

规则：
- 每个节点 text 是压缩后的一句思想，不超过 36 个汉字
- 保留已有节点 id；可改 kind/text；可新增节点（id 用 n1、n2 这种短名亦可）
- sourceIds 必须来自给定 entries 的 id
- 用边把不同角度连起来：支持、反驳、推出、限定、相关
- 找准真正的问题（question）与当前收敛（synthesis）
- spine 用一句话写出当前骨架：问题 → 目前的收敛
- title 不超过 12 字

只返回 JSON：
{"title":"","spine":"","nodes":[{"id":"","kind":"","text":"","sourceIds":[]}],"edges":[{"id":"","from":"","to":"","kind":""}]}`;

export function buildCompactPayload(data: OrganizePayload) {
  return {
    title: data.title,
    spine: data.spine,
    entries: data.entries.slice(-24).map((e) => ({ id: e.id, text: e.text.slice(0, 800) })),
    nodes: data.nodes.slice(0, 64).map(({ id, kind, text, sourceIds }) => ({
      id,
      kind,
      text,
      sourceIds,
    })),
    edges: data.edges.slice(0, 80),
  };
}

/** 校验并归一化模型返回的 JSON（服务端与 App 直连共用）。 */
export function normalizeModelResult(parsed: ModelJson, data: OrganizePayload): OrganizeResult {
  const now = Date.now();
  const existing = new Map(data.nodes.map((n) => [n.id, n]));
  const entryIds = new Set(data.entries.map((e) => e.id));

  const nodes: ThoughtNode[] = [];
  if (Array.isArray(parsed.nodes)) {
    for (const item of parsed.nodes) {
      if (!item || typeof item !== "object") continue;
      const rec = item as Record<string, unknown>;
      const id = typeof rec.id === "string" && rec.id ? rec.id : `n_${nodes.length}`;
      const kind = typeof rec.kind === "string" && isNodeKind(rec.kind) ? rec.kind : "claim";
      const text = typeof rec.text === "string" ? rec.text.trim() : "";
      if (!text) continue;
      const sourceIds = Array.isArray(rec.sourceIds)
        ? rec.sourceIds.filter((s): s is string => typeof s === "string" && entryIds.has(s))
        : (existing.get(id)?.sourceIds ?? []);
      nodes.push({
        id,
        kind,
        text: text.slice(0, 80),
        sourceIds: sourceIds.length ? sourceIds : existing.get(id)?.sourceIds ?? [],
        createdAt: existing.get(id)?.createdAt ?? now,
      });
    }
  }

  if (nodes.length === 0) return { ok: false, error: "empty" };

  const nodeIds = new Set(nodes.map((n) => n.id));
  const edges: ThoughtEdge[] = [];
  if (Array.isArray(parsed.edges)) {
    for (const item of parsed.edges) {
      if (!item || typeof item !== "object") continue;
      const rec = item as Record<string, unknown>;
      const from = typeof rec.from === "string" ? rec.from : "";
      const to = typeof rec.to === "string" ? rec.to : "";
      if (!nodeIds.has(from) || !nodeIds.has(to) || from === to) continue;
      const kind = typeof rec.kind === "string" && isEdgeKind(rec.kind) ? rec.kind : "relates";
      edges.push({
        id: typeof rec.id === "string" && rec.id ? rec.id : `e_${edges.length}`,
        from,
        to,
        kind,
      });
    }
  }

  const title =
    typeof parsed.title === "string" && parsed.title.trim()
      ? parsed.title.trim().slice(0, 18)
      : data.title;
  const spine =
    typeof parsed.spine === "string" && parsed.spine.trim()
      ? parsed.spine.trim().slice(0, 80)
      : data.spine;

  return { ok: true, title, spine, nodes, edges };
}

export const organizeThoughts = createServerFn({ method: "POST" })
  .validator((input: OrganizePayload) => input)
  .handler(async ({ data }): Promise<OrganizeResult> => {
    const apiKey = process.env["XAI_API_KEY"];
    if (!apiKey) return { ok: false, error: "unavailable" };

    const res = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "grok-4.5",
        temperature: 0.2,
        max_tokens: 2200,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: ORGANIZE_SYSTEM_PROMPT },
          {
            role: "user",
            content: JSON.stringify(buildCompactPayload(data)),
          },
        ],
      }),
    });

    if (!res.ok) {
      return { ok: false, error: `xAI API error ${res.status}` };
    }

    const body = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const raw = body.choices?.[0]?.message?.content ?? "";
    const parsed = parseModelJson(raw);
    if (!parsed) return { ok: false, error: "bad json" };
    return normalizeModelResult(parsed, data);
  });

export function parseModelJson(raw: string): ModelJson | null {
  const trimmed = raw.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  const candidate = fenced?.[1] ?? trimmed;
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start < 0 || end <= start) return null;
  try {
    return JSON.parse(candidate.slice(start, end + 1)) as ModelJson;
  } catch {
    return null;
  }
}
