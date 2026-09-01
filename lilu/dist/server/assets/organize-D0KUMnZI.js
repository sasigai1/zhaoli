import { n as TSS_SERVER_FUNCTION, t as createServerFn } from "../server.js";
import { i as isNodeKind, r as isEdgeKind } from "./types-BWtpnAqn.js";
//#region node_modules/@tanstack/start-server-core/dist/esm/createServerRpc.js
var createServerRpc = (serverFnMeta, splitImportFn) => {
	const url = "/_serverFn/" + serverFnMeta.id;
	return Object.assign(splitImportFn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
//#endregion
//#region src/lib/organize.ts?tss-serverfn-split
var ORGANIZE_SYSTEM_PROMPT = `你是「理路」的整理者。把用户的自我讨论整理成论证脉络图。只依据用户原话，不发明新观点。

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
function buildCompactPayload(data) {
	return {
		title: data.title,
		spine: data.spine,
		entries: data.entries.slice(-24).map((e) => ({
			id: e.id,
			text: e.text.slice(0, 800)
		})),
		nodes: data.nodes.slice(0, 64).map(({ id, kind, text, sourceIds }) => ({
			id,
			kind,
			text,
			sourceIds
		})),
		edges: data.edges.slice(0, 80)
	};
}
function normalizeModelResult(parsed, data) {
	const now = Date.now();
	const existing = new Map(data.nodes.map((n) => [n.id, n]));
	const entryIds = new Set(data.entries.map((e) => e.id));
	const nodes = [];
	if (Array.isArray(parsed.nodes)) for (const item of parsed.nodes) {
		if (!item || typeof item !== "object") continue;
		const rec = item;
		const id = typeof rec.id === "string" && rec.id ? rec.id : `n_${nodes.length}`;
		const kind = typeof rec.kind === "string" && isNodeKind(rec.kind) ? rec.kind : "claim";
		const text = typeof rec.text === "string" ? rec.text.trim() : "";
		if (!text) continue;
		const sourceIds = Array.isArray(rec.sourceIds) ? rec.sourceIds.filter((s) => typeof s === "string" && entryIds.has(s)) : existing.get(id)?.sourceIds ?? [];
		nodes.push({
			id,
			kind,
			text: text.slice(0, 80),
			sourceIds: sourceIds.length ? sourceIds : existing.get(id)?.sourceIds ?? [],
			createdAt: existing.get(id)?.createdAt ?? now
		});
	}
	if (nodes.length === 0) return {
		ok: false,
		error: "empty"
	};
	const nodeIds = new Set(nodes.map((n) => n.id));
	const edges = [];
	if (Array.isArray(parsed.edges)) for (const item of parsed.edges) {
		if (!item || typeof item !== "object") continue;
		const rec = item;
		const from = typeof rec.from === "string" ? rec.from : "";
		const to = typeof rec.to === "string" ? rec.to : "";
		if (!nodeIds.has(from) || !nodeIds.has(to) || from === to) continue;
		const kind = typeof rec.kind === "string" && isEdgeKind(rec.kind) ? rec.kind : "relates";
		edges.push({
			id: typeof rec.id === "string" && rec.id ? rec.id : `e_${edges.length}`,
			from,
			to,
			kind
		});
	}
	return {
		ok: true,
		title: typeof parsed.title === "string" && parsed.title.trim() ? parsed.title.trim().slice(0, 18) : data.title,
		spine: typeof parsed.spine === "string" && parsed.spine.trim() ? parsed.spine.trim().slice(0, 80) : data.spine,
		nodes,
		edges
	};
}
var organizeThoughts_createServerFn_handler = createServerRpc({
	id: "f7efc3551147c5883d381298d1619fc731b8a4f278b28bd51b830a342e97bed5",
	name: "organizeThoughts",
	filename: "src/lib/organize.ts"
}, (opts) => organizeThoughts.__executeServer(opts));
var organizeThoughts = createServerFn({ method: "POST" }).validator((input) => input).handler(organizeThoughts_createServerFn_handler, async ({ data }) => {
	const apiKey = process.env["XAI_API_KEY"];
	if (!apiKey) return {
		ok: false,
		error: "unavailable"
	};
	const res = await fetch("https://api.x.ai/v1/chat/completions", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${apiKey}`
		},
		body: JSON.stringify({
			model: "grok-4.5",
			temperature: .2,
			max_tokens: 2200,
			response_format: { type: "json_object" },
			messages: [{
				role: "system",
				content: ORGANIZE_SYSTEM_PROMPT
			}, {
				role: "user",
				content: JSON.stringify(buildCompactPayload(data))
			}]
		})
	});
	if (!res.ok) return {
		ok: false,
		error: `xAI API error ${res.status}`
	};
	const parsed = parseModelJson((await res.json()).choices?.[0]?.message?.content ?? "");
	if (!parsed) return {
		ok: false,
		error: "bad json"
	};
	return normalizeModelResult(parsed, data);
});
function parseModelJson(raw) {
	const trimmed = raw.trim();
	const candidate = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/)?.[1] ?? trimmed;
	const start = candidate.indexOf("{");
	const end = candidate.lastIndexOf("}");
	if (start < 0 || end <= start) return null;
	try {
		return JSON.parse(candidate.slice(start, end + 1));
	} catch {
		return null;
	}
}
//#endregion
export { organizeThoughts_createServerFn_handler };
