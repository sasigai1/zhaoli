import { n as TSS_SERVER_FUNCTION, r as getServerFnById, t as createServerFn } from "../server.js";
import { n as KIND_LABEL, t as EDGE_LABEL } from "./types-BWtpnAqn.js";
import { useEffect, useMemo, useRef, useState } from "react";
import { jsx, jsxs } from "react/jsx-runtime";
import { ArrowUp, List, Plus } from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
//#region src/lib/utils.ts
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
function uid(prefix = "id") {
	return `${prefix}_${Math.random().toString(36).slice(2, 8)}${Date.now().toString(36).slice(-4)}`;
}
//#endregion
//#region src/components/composer.tsx
function Composer({ organizing, onSubmit }) {
	const [value, setValue] = useState("");
	const [coarse, setCoarse] = useState(false);
	const composing = useRef(false);
	const ref = useRef(null);
	useEffect(() => {
		const mq = window.matchMedia("(pointer: coarse)");
		const sync = () => setCoarse(mq.matches);
		sync();
		mq.addEventListener("change", sync);
		return () => mq.removeEventListener("change", sync);
	}, []);
	useEffect(() => {
		const el = ref.current;
		if (!el) return;
		el.style.height = "auto";
		el.style.height = `${Math.min(el.scrollHeight, 196)}px`;
	}, [value]);
	const send = () => {
		const text = value.trim();
		if (!text) return;
		onSubmit(text);
		setValue("");
		requestAnimationFrame(() => ref.current?.focus());
	};
	return /* @__PURE__ */ jsxs("form", {
		className: "composer-pad border-t border-border bg-bg/95 px-4 pt-3",
		onSubmit: (e) => {
			e.preventDefault();
			send();
		},
		children: [/* @__PURE__ */ jsxs("div", {
			className: "mx-auto flex max-w-xl items-end gap-2 rounded-lg bg-surface px-3 py-2 shadow-hairline",
			children: [/* @__PURE__ */ jsx("textarea", {
				ref,
				rows: 1,
				value,
				placeholder: "写下这一段…",
				"aria-label": "写下这一段思考",
				className: cn("max-h-48 min-h-11 flex-1 resize-none bg-transparent py-2.5 text-base leading-relaxed text-fg", "placeholder:text-subtle focus:outline-none"),
				onChange: (e) => setValue(e.target.value),
				onCompositionStart: () => {
					composing.current = true;
				},
				onCompositionEnd: () => {
					composing.current = false;
				},
				onKeyDown: (e) => {
					if (e.key !== "Enter") return;
					if (e.shiftKey || coarse) return;
					if (composing.current || e.nativeEvent.isComposing) return;
					e.preventDefault();
					send();
				}
			}), /* @__PURE__ */ jsx("button", {
				type: "submit",
				disabled: value.trim().length === 0,
				"aria-label": "放入脉络",
				className: "mb-0.5 flex size-11 shrink-0 items-center justify-center rounded-sm bg-accent text-accent-fg transition-opacity duration-150 enabled:active:scale-[0.96] disabled:opacity-30",
				children: /* @__PURE__ */ jsx(ArrowUp, {
					className: "size-4",
					strokeWidth: 1.75
				})
			})]
		}), /* @__PURE__ */ jsx("p", {
			className: "mx-auto mt-2 max-w-xl text-center text-xs tracking-wide text-subtle",
			children: organizing ? "正在把这一段织进脉络" : coarse ? "写完点箭头" : "Enter 放入 · Shift+Enter 换行"
		})]
	});
}
//#endregion
//#region src/lib/tree.ts
var PARENT_PRIORITY = {
	answers: 0,
	derives: 1,
	supports: 2,
	opposes: 3,
	qualifies: 4,
	relates: 5
};
function buildForest(session) {
	const byId = new Map(session.nodes.map((n) => [n.id, n]));
	const incoming = /* @__PURE__ */ new Map();
	const outgoing = /* @__PURE__ */ new Map();
	for (const edge of session.edges) {
		if (!byId.has(edge.from) || !byId.has(edge.to)) continue;
		const ins = incoming.get(edge.to) ?? [];
		ins.push(edge);
		incoming.set(edge.to, ins);
		const outs = outgoing.get(edge.from) ?? [];
		outs.push(edge);
		outgoing.set(edge.from, outs);
	}
	const parentOf = /* @__PURE__ */ new Map();
	const used = /* @__PURE__ */ new Set();
	const ordered = [...session.nodes];
	for (const node of ordered) {
		const ins = (incoming.get(node.id) ?? []).slice().sort((a, b) => PARENT_PRIORITY[a.kind] - PARENT_PRIORITY[b.kind]);
		for (const edge of ins) {
			if (wouldCycle(parentOf, edge.from, node.id)) continue;
			parentOf.set(node.id, edge.from);
			used.add(edge.id);
			break;
		}
	}
	const wrappers = /* @__PURE__ */ new Map();
	for (const node of session.nodes) wrappers.set(node.id, {
		node,
		children: [],
		incoming: incoming.get(node.id) ?? [],
		outgoing: outgoing.get(node.id) ?? []
	});
	const roots = [];
	for (const node of session.nodes) {
		const wrap = wrappers.get(node.id);
		const parentId = parentOf.get(node.id);
		if (parentId && wrappers.has(parentId)) wrappers.get(parentId).children.push(wrap);
		else roots.push(wrap);
	}
	return {
		roots,
		extras: session.edges.filter((e) => byId.has(e.from) && byId.has(e.to) && !used.has(e.id))
	};
}
function wouldCycle(parentOf, parentId, childId) {
	let cursor = parentId;
	const seen = /* @__PURE__ */ new Set();
	while (cursor) {
		if (cursor === childId) return true;
		if (seen.has(cursor)) return true;
		seen.add(cursor);
		cursor = parentOf.get(cursor);
	}
	return false;
}
function flattenPreorder(roots) {
	const out = [];
	const walk = (n) => {
		out.push(n.node);
		n.children.forEach(walk);
	};
	roots.forEach(walk);
	return out;
}
function relatedIds(session, nodeId) {
	const ids = /* @__PURE__ */ new Set([nodeId]);
	for (const edge of session.edges) {
		if (edge.from === nodeId) ids.add(edge.to);
		if (edge.to === nodeId) ids.add(edge.from);
	}
	return ids;
}
//#endregion
//#region src/components/framework-tree.tsx
var KIND_CLASS = {
	question: "text-fg",
	claim: "text-kind",
	evidence: "text-muted",
	objection: "kind-oppose",
	tension: "kind-oppose",
	synthesis: "text-fg",
	aside: "text-subtle"
};
function FrameworkTree({ session, selectedId, justAddedIds, onSelect }) {
	const { roots, extras } = buildForest(session);
	const related = selectedId ? relatedIds(session, selectedId) : /* @__PURE__ */ new Set();
	const byId = new Map(session.nodes.map((n) => [n.id, n]));
	const extraByNode = /* @__PURE__ */ new Map();
	for (const edge of extras) {
		const list = extraByNode.get(edge.to) ?? [];
		list.push(edge);
		extraByNode.set(edge.to, list);
	}
	if (roots.length === 0) return /* @__PURE__ */ jsxs("div", {
		className: "flex flex-1 flex-col items-center justify-center px-8 py-16 text-center",
		children: [/* @__PURE__ */ jsx("p", {
			className: "font-serif text-xl font-medium text-balance text-fg",
			children: "从一句问开始"
		}), /* @__PURE__ */ jsx("p", {
			className: "mt-3 max-w-xs text-sm leading-relaxed text-pretty text-muted",
			children: "把还没理清的话写在下面。脉络会在上方慢慢长出来。"
		})]
	});
	return /* @__PURE__ */ jsx("div", {
		className: "mx-auto w-full max-w-xl px-4 pb-8 pt-2",
		children: roots.map((root) => /* @__PURE__ */ jsx(Branch, {
			tree: root,
			depth: 0,
			session,
			selectedId,
			related,
			justAddedIds,
			extraByNode,
			byId,
			onSelect
		}, root.node.id))
	});
}
function Branch({ tree, depth, session, selectedId, related, justAddedIds, extraByNode, byId, onSelect }) {
	const selected = selectedId === tree.node.id;
	const dimmed = selectedId !== null && !related.has(tree.node.id);
	const extras = extraByNode.get(tree.node.id) ?? [];
	return /* @__PURE__ */ jsxs("div", {
		className: "relative",
		children: [/* @__PURE__ */ jsx(NodeRow, {
			node: tree.node,
			depth,
			selected,
			dimmed,
			fresh: justAddedIds.includes(tree.node.id),
			session,
			extras,
			byId,
			onSelect
		}), tree.children.length > 0 ? /* @__PURE__ */ jsx("div", {
			className: "ml-5 border-l border-border pl-4 sm:ml-7 sm:pl-5",
			children: tree.children.map((child) => /* @__PURE__ */ jsx(Branch, {
				tree: child,
				depth: depth + 1,
				session,
				selectedId,
				related,
				justAddedIds,
				extraByNode,
				byId,
				onSelect
			}, child.node.id))
		}) : null]
	});
}
function NodeRow({ node, depth, selected, dimmed, fresh, session, extras, byId, onSelect }) {
	const sources = node.sourceIds.map((id) => session.entries.find((e) => e.id === id)).filter((e) => Boolean(e));
	return /* @__PURE__ */ jsxs("article", {
		id: `node-${node.id}`,
		className: cn("relative py-3 transition-opacity duration-300 ease-out", fresh && "node-enter", dimmed && "opacity-35"),
		children: [
			depth > 0 ? /* @__PURE__ */ jsx("span", {
				"aria-hidden": true,
				className: "absolute top-6 -left-4 h-px w-4 bg-border sm:-left-5 sm:w-5"
			}) : null,
			/* @__PURE__ */ jsxs("button", {
				type: "button",
				onClick: () => onSelect(selected ? null : node.id),
				className: "flex w-full items-start gap-3 text-left",
				children: [/* @__PURE__ */ jsx("span", {
					className: cn("mt-0.5 w-5 shrink-0 font-serif text-sm tracking-mark", KIND_CLASS[node.kind]),
					children: KIND_LABEL[node.kind]
				}), /* @__PURE__ */ jsx("span", {
					className: cn("min-w-0 flex-1 font-serif leading-relaxed text-pretty", node.kind === "question" || node.kind === "synthesis" ? "text-lg font-medium text-fg" : "text-base text-fg/90", selected && "text-fg"),
					children: node.text
				})]
			}),
			selected ? /* @__PURE__ */ jsxs("div", {
				className: "mt-3 ml-8 space-y-2",
				children: [extras.map((edge) => {
					const target = byId.get(edge.from);
					if (!target) return null;
					return /* @__PURE__ */ jsxs("button", {
						type: "button",
						onClick: () => onSelect(target.id),
						className: "block text-left text-sm text-muted transition-colors hover:text-fg",
						children: [
							EDGE_LABEL[edge.kind],
							" · ",
							KIND_LABEL[target.kind],
							" ",
							target.text
						]
					}, edge.id);
				}), sources.map((entry) => /* @__PURE__ */ jsx("p", {
					className: "text-sm leading-relaxed text-pretty text-muted",
					children: entry.text
				}, entry.id))]
			}) : null
		]
	});
}
//#endregion
//#region src/components/session-drawer.tsx
function SessionDrawer({ open, sessions, activeId, onClose, onOpen, onNew, onDelete }) {
	useEffect(() => {
		if (!open) return;
		const onKey = (e) => {
			if (e.key === "Escape") onClose();
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [open, onClose]);
	if (!open) return null;
	return /* @__PURE__ */ jsxs("div", {
		className: "fixed inset-0 z-40",
		children: [/* @__PURE__ */ jsx("button", {
			type: "button",
			"aria-label": "关闭讨论列表",
			className: "absolute inset-0 bg-bg/70",
			onClick: onClose
		}), /* @__PURE__ */ jsxs("aside", {
			className: "absolute inset-y-0 left-0 flex w-full max-w-sm flex-col bg-surface shadow-hairline",
			children: [/* @__PURE__ */ jsxs("div", {
				className: "flex items-center justify-between px-5 pt-5 pb-3",
				children: [/* @__PURE__ */ jsx("p", {
					className: "text-sm tracking-label text-muted",
					children: "讨论"
				}), /* @__PURE__ */ jsx("button", {
					type: "button",
					onClick: () => {
						onNew();
						onClose();
					},
					className: "h-11 px-2 text-sm text-fg transition-opacity hover:opacity-70",
					children: "新的一段"
				})]
			}), /* @__PURE__ */ jsx("ul", {
				className: "flex-1 overflow-y-auto px-2 pb-8",
				children: sessions.map((session) => {
					const active = session.id === activeId;
					return /* @__PURE__ */ jsxs("li", {
						className: "relative",
						children: [/* @__PURE__ */ jsxs("button", {
							type: "button",
							onClick: () => {
								onOpen(session.id);
								onClose();
							},
							className: cn("flex w-full flex-col items-start gap-1 rounded-md px-3 py-3 pr-14 text-left transition-colors", active ? "bg-fg/5" : "hover:bg-fg/5"),
							children: [
								/* @__PURE__ */ jsx("span", {
									className: "font-serif text-base text-fg",
									children: session.title || "新的一段"
								}),
								/* @__PURE__ */ jsx("span", {
									className: "line-clamp-2 text-sm leading-relaxed text-muted",
									children: session.spine || "还没有脉络"
								}),
								/* @__PURE__ */ jsx("span", {
									className: "text-xs tabular-nums text-subtle",
									children: formatWhen(session.updatedAt)
								})
							]
						}), /* @__PURE__ */ jsx("button", {
							type: "button",
							onClick: () => onDelete(session.id),
							className: "absolute top-2 right-2 h-11 px-2 text-xs text-subtle transition-colors hover:text-oppose",
							children: "删除"
						})]
					}, session.id);
				})
			})]
		})]
	});
}
function formatWhen(ts) {
	const d = new Date(ts);
	const now = /* @__PURE__ */ new Date();
	if (d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate()) return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
	return `${d.getMonth() + 1}月${d.getDate()}日`;
}
//#endregion
//#region src/components/spine-strip.tsx
function SpineStrip({ nodes, selectedId, organizing, onJump }) {
	if (nodes.length === 0) return null;
	return /* @__PURE__ */ jsx("div", {
		className: "border-b border-border",
		children: /* @__PURE__ */ jsx("div", {
			className: "mx-auto flex max-w-xl items-center gap-0 overflow-x-auto px-4 py-2.5",
			children: organizing ? /* @__PURE__ */ jsx("span", {
				className: "shimmer text-xs tracking-label",
				children: "整理"
			}) : nodes.map((node, i) => /* @__PURE__ */ jsxs("button", {
				type: "button",
				onClick: () => onJump(node.id),
				className: cn("flex items-center gap-0 font-serif text-xs tracking-mark transition-opacity", selectedId === node.id ? "text-fg" : "text-subtle hover:text-muted"),
				"aria-label": `${KIND_LABEL[node.kind]} ${node.text}`,
				children: [i > 0 ? /* @__PURE__ */ jsx("span", {
					className: "mx-1.5 text-border",
					children: "·"
				}) : null, KIND_LABEL[node.kind]]
			}, node.id))
		})
	});
}
//#endregion
//#region node_modules/@tanstack/start-server-core/dist/esm/createSsrRpc.js
var createSsrRpc = (functionId) => {
	const url = "/_serverFn/" + functionId;
	const serverFnMeta = { id: functionId };
	const fn = async (...args) => {
		return (await getServerFnById(functionId, { origin: "server" }))(...args);
	};
	return Object.assign(fn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
//#endregion
//#region src/lib/organize.ts
var organizeThoughts = createServerFn({ method: "POST" }).validator((input) => input).handler(createSsrRpc("f7efc3551147c5883d381298d1619fc731b8a4f278b28bd51b830a342e97bed5"));
//#endregion
//#region src/lib/heuristic.ts
function splitClauses(text) {
	return text.split(/\n+|(?<=[。！？；;!?])\s*/).map((s) => s.trim()).filter((s) => s.length > 1);
}
function classifyClause(text) {
	const t = text.trim();
	const isQuestion = /[?？]/.test(t) || /^(是不是|为什么|为何|如何|怎么|难道|该不该|要不要|是否|究竟)/.test(t);
	const isObjection = /^(但是|可是|然而|不过|偏偏|只是|话虽如此|反过来说|问题是)/.test(t) || /^(but|however|yet)\b/i.test(t);
	if (isObjection && !isQuestion) return "objection";
	if (isQuestion) return "question";
	if (isObjection) return "objection";
	if (/^(所以|因此|于是|可见|总之|综上|换句话说|真正的问题)/.test(t) || /^(so|therefore|thus|hence)\b/i.test(t)) return "synthesis";
	if (/^(因为|由于|毕竟|原因是|证据是|具体来说)/.test(t) || /^(because|since)\b/i.test(t)) return "evidence";
	if (/矛盾|冲突|一方面|另一方面|既想|又怕|张力/.test(t)) return "tension";
	if (/^(如果|假如|或许|也许|万一|假设|先不)/.test(t) || /^(if|maybe|perhaps)\b/i.test(t)) return "aside";
	return "claim";
}
function lastMatching(nodes, kinds) {
	for (let i = nodes.length - 1; i >= 0; i--) if (kinds.includes(nodes[i].kind)) return nodes[i];
	return nodes.at(-1);
}
function linkKindFor(nodeKind) {
	switch (nodeKind) {
		case "evidence": return "supports";
		case "objection": return "opposes";
		case "synthesis": return "derives";
		case "question": return "relates";
		case "tension": return "qualifies";
		case "aside": return "qualifies";
		default: return "answers";
	}
}
function parentFor(kind, nodes) {
	if (nodes.length === 0) return void 0;
	switch (kind) {
		case "evidence": return lastMatching(nodes, [
			"claim",
			"objection",
			"synthesis",
			"question"
		]);
		case "objection": return lastMatching(nodes, [
			"claim",
			"synthesis",
			"question"
		]);
		case "synthesis": return lastMatching(nodes, [
			"question",
			"claim",
			"objection",
			"tension"
		]);
		case "claim": return lastMatching(nodes, [
			"question",
			"claim",
			"synthesis"
		]);
		case "aside": return lastMatching(nodes, [
			"question",
			"claim",
			"synthesis",
			"objection"
		]);
		case "tension": return lastMatching(nodes, ["question", "claim"]);
		default: return lastMatching(nodes, [
			"claim",
			"synthesis",
			"question"
		]);
	}
}
function makeSpine(nodes) {
	if (nodes.length === 0) return "";
	const question = nodes.find((n) => n.kind === "question");
	const synthesis = [...nodes].reverse().find((n) => n.kind === "synthesis");
	if (question && synthesis && question.id !== synthesis.id) return `${question.text} → ${synthesis.text}`;
	if (question) return question.text;
	if (synthesis) return synthesis.text;
	return nodes[0].text;
}
function makeTitle(session) {
	const current = session.title.trim();
	if (current && current !== "未命名") return current;
	const compact = (session.nodes.find((n) => n.kind === "question")?.text ?? session.nodes[0]?.text ?? session.entries[0]?.text ?? "").replace(/\s+/g, " ").replace(/[。！？!?]$/, "");
	if (!compact) return "";
	return compact.length > 18 ? `${compact.slice(0, 18)}…` : compact;
}
function appendFromEntry(session, entry) {
	const clauses = splitClauses(entry.text);
	const pieces = clauses.length > 0 ? clauses : [entry.text.trim()].filter(Boolean);
	const nodes = [...session.nodes];
	const edges = [...session.edges];
	for (const piece of pieces) {
		const kind = classifyClause(piece);
		const node = {
			id: uid("n"),
			kind,
			text: piece.replace(/[。；;]$/, ""),
			sourceIds: [entry.id],
			createdAt: entry.createdAt
		};
		const parent = parentFor(kind, nodes);
		nodes.push(node);
		if (parent) {
			const edge = {
				id: uid("e"),
				from: parent.id,
				to: node.id,
				kind: parent.kind === "question" && kind === "claim" ? "answers" : linkKindFor(kind)
			};
			edges.push(edge);
		}
	}
	const next = {
		...session,
		nodes,
		edges,
		entries: [...session.entries, entry],
		updatedAt: entry.createdAt
	};
	next.spine = makeSpine(next.nodes);
	next.title = makeTitle(next);
	return next;
}
function createBlankSession() {
	const now = Date.now();
	return {
		id: uid("s"),
		title: "",
		createdAt: now,
		updatedAt: now,
		entries: [],
		nodes: [],
		edges: [],
		spine: ""
	};
}
//#endregion
//#region src/lib/sample.ts
var T = Date.parse("2026-08-31T22:18:00+08:00");
var SAMPLE_SESSION = {
	id: "sample-work",
	title: "要不要换工作",
	createdAt: T,
	updatedAt: T + 216e4,
	spine: "我还愿不愿意把自己放进一个会失败的位置 → 先给自己一个失败的沙盘",
	entries: [
		{
			id: "e1",
			createdAt: T,
			text: "我最近一直在想要不要换工作。现在的岗位已经很熟了，工资也不算低，可是每天上班都有一种说不清的闷。"
		},
		{
			id: "e2",
			createdAt: T + 36e4,
			text: "说是闷，其实是觉得自己不再被需要成长，只是被需要产出。去年到现在几乎没有新的问题要解决。"
		},
		{
			id: "e3",
			createdAt: T + 84e4,
			text: "但是一想到辞职，就害怕。房贷、父母、以及那种「你已经不年轻了」的声音。稳定本身也是一种能力。"
		},
		{
			id: "e4",
			createdAt: T + 126e4,
			text: "如果只是为了稳定留下，三年后的我会不会更难走？那时候熟练变成惯性，惯性变成退路消失。"
		},
		{
			id: "e5",
			createdAt: T + 168e4,
			text: "所以真正的问题也许不是「要不要换」，而是「我还愿不愿意把自己放进一个会失败的位置」。"
		},
		{
			id: "e6",
			createdAt: T + 216e4,
			text: "我可以先不辞职。内部转岗，或者业余做一件必须从零开始的事，给自己一个失败的沙盘。如果连这个都迈不出，辞职大概率也只是换一个闷法。"
		}
	],
	nodes: [
		{
			id: "n1",
			kind: "question",
			text: "要不要换工作？",
			sourceIds: ["e1"],
			createdAt: T
		},
		{
			id: "n2",
			kind: "claim",
			text: "岗位已熟、薪水尚可，但每天有一种说不清的闷",
			sourceIds: ["e1"],
			createdAt: T
		},
		{
			id: "n3",
			kind: "claim",
			text: "不再被需要成长，只是被需要产出",
			sourceIds: ["e2"],
			createdAt: T + 36e4
		},
		{
			id: "n4",
			kind: "evidence",
			text: "一年几乎没有新的问题要解决",
			sourceIds: ["e2"],
			createdAt: T + 36e4
		},
		{
			id: "n5",
			kind: "objection",
			text: "辞职意味着房贷、父母与「已经不年轻」的压力",
			sourceIds: ["e3"],
			createdAt: T + 84e4
		},
		{
			id: "n6",
			kind: "claim",
			text: "稳定本身也是一种能力",
			sourceIds: ["e3"],
			createdAt: T + 84e4
		},
		{
			id: "n7",
			kind: "aside",
			text: "若只为稳定留下，三年后熟练会变成失去退路的惯性",
			sourceIds: ["e4"],
			createdAt: T + 126e4
		},
		{
			id: "n8",
			kind: "synthesis",
			text: "真正的问题是：我还愿不愿意把自己放进一个会失败的位置",
			sourceIds: ["e5"],
			createdAt: T + 168e4
		},
		{
			id: "n9",
			kind: "synthesis",
			text: "先给自己一个失败的沙盘，而不是立刻辞职",
			sourceIds: ["e6"],
			createdAt: T + 216e4
		}
	],
	edges: [
		{
			id: "x1",
			from: "n1",
			to: "n2",
			kind: "answers"
		},
		{
			id: "x2",
			from: "n2",
			to: "n3",
			kind: "derives"
		},
		{
			id: "x3",
			from: "n3",
			to: "n4",
			kind: "supports"
		},
		{
			id: "x4",
			from: "n1",
			to: "n5",
			kind: "opposes"
		},
		{
			id: "x5",
			from: "n5",
			to: "n6",
			kind: "derives"
		},
		{
			id: "x6",
			from: "n6",
			to: "n7",
			kind: "qualifies"
		},
		{
			id: "x7",
			from: "n1",
			to: "n8",
			kind: "derives"
		},
		{
			id: "x8",
			from: "n8",
			to: "n9",
			kind: "derives"
		},
		{
			id: "x9",
			from: "n7",
			to: "n8",
			kind: "relates"
		},
		{
			id: "x10",
			from: "n3",
			to: "n8",
			kind: "relates"
		}
	]
};
//#endregion
//#region src/lib/store.ts
function ensureSessions(sessions, activeId) {
	if (sessions.length === 0) return {
		sessions: [SAMPLE_SESSION],
		activeId: SAMPLE_SESSION.id
	};
	if (!sessions.some((s) => s.id === activeId)) return {
		sessions,
		activeId: sessions[0].id
	};
	return {
		sessions,
		activeId
	};
}
var useLilu = create()(persist((set, get) => ({
	sessions: [SAMPLE_SESSION],
	activeId: SAMPLE_SESSION.id,
	selectedNodeId: null,
	organizing: false,
	organizeError: null,
	justAddedIds: [],
	setSelected: (id) => set({ selectedNodeId: id }),
	newSession: () => {
		const session = createBlankSession();
		set((state) => ({
			sessions: [session, ...state.sessions],
			activeId: session.id,
			selectedNodeId: null,
			organizeError: null,
			justAddedIds: []
		}));
	},
	openSession: (id) => {
		if (!get().sessions.some((s) => s.id === id)) return;
		set({
			activeId: id,
			selectedNodeId: null,
			organizeError: null
		});
	},
	deleteSession: (id) => {
		set((state) => {
			const remaining = state.sessions.filter((s) => s.id !== id);
			const next = remaining.length > 0 ? remaining : [createBlankSession()];
			return {
				sessions: next,
				activeId: state.activeId === id ? next[0].id : state.activeId,
				selectedNodeId: null
			};
		});
	},
	renameSession: (title) => {
		const trimmed = title.trim().slice(0, 24);
		if (!trimmed) return;
		set((state) => ({ sessions: state.sessions.map((s) => s.id === state.activeId ? {
			...s,
			title: trimmed,
			updatedAt: Date.now()
		} : s) }));
	},
	addUtterance: (text) => {
		const trimmed = text.replace(/\s+/g, " ").trim();
		if (!trimmed) return null;
		const entry = {
			id: uid("e"),
			text: trimmed.slice(0, 2e3),
			createdAt: Date.now()
		};
		let result = null;
		set((state) => {
			const current = state.sessions.find((s) => s.id === state.activeId);
			if (!current) return state;
			const before = new Set(current.nodes.map((n) => n.id));
			const session = appendFromEntry(current, entry);
			const newNodeIds = session.nodes.filter((n) => !before.has(n.id)).map((n) => n.id);
			result = {
				session,
				newNodeIds
			};
			return {
				sessions: state.sessions.map((s) => s.id === session.id ? session : s),
				justAddedIds: newNodeIds,
				organizeError: null,
				selectedNodeId: newNodeIds.at(-1) ?? state.selectedNodeId
			};
		});
		return result;
	},
	applyOrganize: (patch) => {
		set((state) => ({
			sessions: state.sessions.map((s) => s.id === state.activeId ? {
				...s,
				title: patch.title || s.title,
				spine: patch.spine || s.spine,
				nodes: patch.nodes,
				edges: patch.edges,
				updatedAt: Date.now()
			} : s),
			organizing: false,
			organizeError: null
		}));
	},
	setOrganizing: (value, error = null) => set({
		organizing: value,
		organizeError: error
	}),
	clearJustAdded: () => set({ justAddedIds: [] })
}), {
	name: "lilu-sessions-v1",
	storage: createJSONStorage(() => localStorage),
	partialize: (state) => ({
		sessions: state.sessions,
		activeId: state.activeId
	}),
	skipHydration: true,
	merge: (persisted, current) => {
		const p = persisted;
		const ensured = ensureSessions(p?.sessions ?? current.sessions, p?.activeId ?? current.activeId);
		return {
			...current,
			...ensured
		};
	}
}));
function activeSession(state) {
	return state.sessions.find((s) => s.id === state.activeId);
}
//#endregion
//#region src/components/app-home.tsx
function AppHome() {
	const sessions = useLilu((s) => s.sessions);
	const activeId = useLilu((s) => s.activeId);
	const selectedNodeId = useLilu((s) => s.selectedNodeId);
	const organizing = useLilu((s) => s.organizing);
	const organizeError = useLilu((s) => s.organizeError);
	const justAddedIds = useLilu((s) => s.justAddedIds);
	const session = useLilu(activeSession);
	const [listOpen, setListOpen] = useState(false);
	const [editingTitle, setEditingTitle] = useState(false);
	const [titleDraft, setTitleDraft] = useState("");
	useEffect(() => {
		useLilu.persist.rehydrate();
	}, []);
	useEffect(() => {
		if (justAddedIds.length === 0) return;
		const t = window.setTimeout(() => useLilu.getState().clearJustAdded(), 900);
		return () => window.clearTimeout(t);
	}, [justAddedIds]);
	const orderedNodes = useMemo(() => {
		if (!session) return [];
		return flattenPreorder(buildForest(session).roots);
	}, [session]);
	const refine = async (target) => {
		useLilu.getState().setOrganizing(true);
		try {
			const result = await organizeThoughts({ data: {
				title: target.title,
				spine: target.spine,
				entries: target.entries.map((e) => ({
					id: e.id,
					text: e.text
				})),
				nodes: target.nodes.map((n) => ({
					id: n.id,
					kind: n.kind,
					text: n.text,
					sourceIds: n.sourceIds,
					createdAt: n.createdAt
				})),
				edges: target.edges.map((e) => ({
					id: e.id,
					from: e.from,
					to: e.to,
					kind: e.kind
				}))
			} });
			if (useLilu.getState().activeId !== target.id) {
				useLilu.getState().setOrganizing(false);
				return;
			}
			if (result.ok) useLilu.getState().applyOrganize({
				title: result.title,
				spine: result.spine,
				nodes: result.nodes,
				edges: result.edges
			});
			else useLilu.getState().setOrganizing(false, result.error === "unavailable" ? "unavailable" : "failed");
		} catch {
			useLilu.getState().setOrganizing(false, "failed");
		}
	};
	const onSubmit = (text) => {
		const added = useLilu.getState().addUtterance(text);
		if (!added) return;
		refine(added.session);
	};
	const jump = (id) => {
		useLilu.getState().setSelected(id);
		document.getElementById(`node-${id}`)?.scrollIntoView({
			behavior: "smooth",
			block: "center"
		});
	};
	if (!session) return /* @__PURE__ */ jsx("div", {
		className: "flex min-h-dvh flex-col bg-bg",
		children: /* @__PURE__ */ jsx("header", {
			className: "flex h-14 items-center justify-center",
			children: /* @__PURE__ */ jsx("p", {
				className: "text-sm tracking-brand text-muted",
				children: "理路"
			})
		})
	});
	const untitled = !session.title.trim();
	return /* @__PURE__ */ jsxs("div", {
		className: "flex min-h-dvh flex-col bg-bg text-fg",
		children: [
			/* @__PURE__ */ jsxs("header", {
				className: "flex h-14 items-center gap-2 px-2 sm:px-3",
				children: [
					/* @__PURE__ */ jsx("button", {
						type: "button",
						"aria-label": "讨论列表",
						onClick: () => setListOpen(true),
						className: "flex size-11 items-center justify-center text-muted transition-colors hover:text-fg",
						children: /* @__PURE__ */ jsx(List, {
							className: "size-5",
							strokeWidth: 1.5
						})
					}),
					/* @__PURE__ */ jsx("div", {
						className: "min-w-0 flex-1 text-center",
						children: editingTitle ? /* @__PURE__ */ jsx("input", {
							autoFocus: true,
							value: titleDraft,
							"aria-label": "讨论标题",
							className: "w-full bg-transparent text-center font-serif text-base text-fg outline-none",
							onChange: (e) => setTitleDraft(e.target.value),
							onBlur: () => {
								useLilu.getState().renameSession(titleDraft);
								setEditingTitle(false);
							},
							onKeyDown: (e) => {
								if (e.key === "Enter") {
									useLilu.getState().renameSession(titleDraft);
									setEditingTitle(false);
								}
								if (e.key === "Escape") setEditingTitle(false);
							}
						}) : /* @__PURE__ */ jsx("button", {
							type: "button",
							className: cn("max-w-full truncate font-serif text-base", untitled ? "text-muted" : "text-fg"),
							onClick: () => {
								setTitleDraft(session.title);
								setEditingTitle(true);
							},
							children: session.title || "新的一段"
						})
					}),
					/* @__PURE__ */ jsx("button", {
						type: "button",
						"aria-label": "新的一段讨论",
						onClick: () => useLilu.getState().newSession(),
						className: "flex size-11 items-center justify-center text-muted transition-colors hover:text-fg",
						children: /* @__PURE__ */ jsx(Plus, {
							className: "size-5",
							strokeWidth: 1.5
						})
					})
				]
			}),
			/* @__PURE__ */ jsx(SpineStrip, {
				nodes: orderedNodes,
				selectedId: selectedNodeId,
				organizing,
				onJump: jump
			}),
			/* @__PURE__ */ jsxs("main", {
				className: "flex min-h-0 flex-1 flex-col overflow-y-auto",
				children: [
					session.spine && session.nodes.length > 0 ? /* @__PURE__ */ jsx("p", {
						className: "mx-auto max-w-xl px-4 pt-6 pb-2 text-sm leading-relaxed text-pretty text-muted",
						children: session.spine
					}) : null,
					/* @__PURE__ */ jsx(FrameworkTree, {
						session,
						selectedId: selectedNodeId,
						justAddedIds,
						onSelect: (id) => useLilu.getState().setSelected(id)
					}),
					session.entries.length >= 2 ? /* @__PURE__ */ jsxs("div", {
						className: "mx-auto w-full max-w-xl px-4 pb-10",
						children: [/* @__PURE__ */ jsx("button", {
							type: "button",
							disabled: organizing,
							onClick: () => void refine(session),
							className: "text-sm text-muted transition-colors hover:text-fg disabled:opacity-40",
							children: "重新整理"
						}), organizeError && organizeError !== "unavailable" ? /* @__PURE__ */ jsx("p", {
							className: "mt-2 text-xs text-muted",
							children: "这一段先按字面接上了。"
						}) : null]
					}) : null
				]
			}),
			/* @__PURE__ */ jsx(Composer, {
				organizing,
				onSubmit
			}),
			/* @__PURE__ */ jsx(SessionDrawer, {
				open: listOpen,
				sessions,
				activeId,
				onClose: () => setListOpen(false),
				onOpen: (id) => useLilu.getState().openSession(id),
				onNew: () => useLilu.getState().newSession(),
				onDelete: (id) => useLilu.getState().deleteSession(id)
			})
		]
	});
}
//#endregion
//#region src/routes/index.tsx?tsr-split=component
function Home() {
	return /* @__PURE__ */ jsx(AppHome, {});
}
//#endregion
export { Home as component };
