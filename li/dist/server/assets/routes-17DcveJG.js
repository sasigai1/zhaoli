import * as React from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { ChevronsDownUp, CornerDownLeft, Expand, Link2, List, Pencil, Plus, Trash2, X } from "lucide-react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { formatDistanceToNow } from "date-fns";
import { zhCN } from "date-fns/locale";
//#region src/lib/utils.ts
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
function uid() {
	return crypto.randomUUID();
}
//#endregion
//#region src/components/ui/tooltip.tsx
var TooltipProvider = TooltipPrimitive.Provider;
var Tooltip = TooltipPrimitive.Root;
var TooltipTrigger = TooltipPrimitive.Trigger;
var TooltipContent = React.forwardRef(({ className, sideOffset = 6, ...props }, ref) => /* @__PURE__ */ jsx(TooltipPrimitive.Portal, { children: /* @__PURE__ */ jsx(TooltipPrimitive.Content, {
	ref,
	sideOffset,
	className: cn("z-50 overflow-hidden rounded-md bg-fg px-2 py-1 text-xs text-bg shadow-paper", "animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0", className),
	...props
}) }));
TooltipContent.displayName = TooltipPrimitive.Content.displayName;
//#endregion
//#region src/components/ui/button.tsx
var buttonVariants = cva("inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-[color,background-color,box-shadow,opacity,transform] duration-quick ease-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 disabled:pointer-events-none disabled:opacity-40 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:not-disabled:scale-[0.96]", {
	variants: {
		variant: {
			default: "bg-primary text-primary-fg hover:bg-primary/90",
			accent: "bg-accent text-accent-fg hover:bg-accent/90",
			ghost: "bg-transparent text-muted hover:bg-surface-2 hover:text-fg",
			outline: "bg-transparent text-fg shadow-paper hover:shadow-paper-hover"
		},
		size: {
			default: "h-10 px-4",
			sm: "h-8 px-3 text-xs",
			icon: "size-11",
			"icon-sm": "size-8"
		}
	},
	defaultVariants: {
		variant: "default",
		size: "default"
	}
});
var Button = React.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
	return /* @__PURE__ */ jsx(asChild ? Slot : "button", {
		className: cn(buttonVariants({
			variant,
			size,
			className
		})),
		ref,
		...props
	});
});
Button.displayName = "Button";
//#endregion
//#region src/components/ui/input.tsx
var Input = React.forwardRef(({ className, type, ...props }, ref) => {
	return /* @__PURE__ */ jsx("input", {
		type,
		className: cn("flex h-10 w-full bg-transparent px-0 py-0 text-base text-fg placeholder:text-subtle focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50", className),
		ref,
		...props
	});
});
Input.displayName = "Input";
//#endregion
//#region src/components/ui/textarea.tsx
var Textarea = React.forwardRef(({ className, ...props }, ref) => {
	return /* @__PURE__ */ jsx("textarea", {
		className: cn("flex min-h-16 w-full resize-none bg-transparent px-0 py-0 text-base text-fg leading-normal placeholder:text-subtle focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50", className),
		ref,
		...props
	});
});
Textarea.displayName = "Textarea";
//#endregion
//#region src/lib/types.ts
var RELATIONS = [
	"continue",
	"branch",
	"counter",
	"question"
];
var RELATION_META = {
	continue: {
		label: "续",
		hint: "接着往下",
		placeholder: "接着刚才的想法…"
	},
	branch: {
		label: "分",
		hint: "另一个角度",
		placeholder: "换一个角度看…"
	},
	counter: {
		label: "反",
		hint: "反过来想",
		placeholder: "可是，反过来想…"
	},
	question: {
		label: "问",
		hint: "追问",
		placeholder: "这里有个问题…"
	}
};
var CHAR_W = 14;
var RELATION_ORDER = {
	counter: 0,
	question: 1,
	continue: 2,
	branch: 3
};
function estimateNodeHeight(text) {
	const contentW = 220;
	let lines = 0;
	const paragraphs = text.length === 0 ? [""] : text.split("\n");
	for (const p of paragraphs) {
		const width = Math.max(1, [...p].length) * CHAR_W;
		lines += Math.max(1, Math.ceil(width / contentW));
	}
	lines = Math.min(4, Math.max(1, lines));
	return 28 + lines * 22;
}
function childrenOf(thoughts, parentId) {
	return thoughts.filter((t) => t.parentId === parentId).sort((a, b) => {
		const d = RELATION_ORDER[a.relation] - RELATION_ORDER[b.relation];
		if (d !== 0) return d;
		return a.createdAt - b.createdAt;
	});
}
function descendantIds(thoughts, rootId) {
	const ids = /* @__PURE__ */ new Set();
	const walk = (id) => {
		for (const child of childrenOf(thoughts, id)) {
			ids.add(child.id);
			walk(child.id);
		}
	};
	walk(rootId);
	return ids;
}
function pathToRoot(thoughts, id) {
	if (!id) return [];
	const byId = new Map(thoughts.map((t) => [t.id, t]));
	const path = [];
	const seen = /* @__PURE__ */ new Set();
	let cur = byId.get(id);
	while (cur && !seen.has(cur.id)) {
		path.push(cur);
		seen.add(cur.id);
		cur = cur.parentId ? byId.get(cur.parentId) : void 0;
	}
	return path.reverse();
}
function isDescendant(thoughts, ancestorId, nodeId) {
	return descendantIds(thoughts, ancestorId).has(nodeId);
}
function adjacentThought(thoughts, id, dir) {
	if (!id) return childrenOf(thoughts, null)[0]?.id ?? null;
	const node = thoughts.find((t) => t.id === id);
	if (!node) return childrenOf(thoughts, null)[0]?.id ?? null;
	if (dir === "parent") return node.parentId;
	if (dir === "child") return childrenOf(thoughts, id)[0]?.id ?? null;
	const siblings = childrenOf(thoughts, node.parentId);
	const i = siblings.findIndex((s) => s.id === id);
	if (i < 0) return null;
	if (dir === "prev") return i > 0 ? siblings[i - 1].id : node.parentId;
	if (i < siblings.length - 1) return siblings[i + 1].id;
	return childrenOf(thoughts, id)[0]?.id ?? null;
}
function layoutThoughts(thoughts, collapsedIds) {
	const boxes = {};
	const roots = childrenOf(thoughts, null);
	const layoutNode = (node, left, top) => {
		const h = estimateNodeHeight(node.text);
		const w = 256;
		const kids = collapsedIds.has(node.id) ? [] : childrenOf(thoughts, node.id);
		if (kids.length === 0) {
			boxes[node.id] = {
				x: left,
				y: top,
				w,
				h
			};
			return {
				width: w,
				height: h
			};
		}
		let childLeft = left;
		let maxChildH = 0;
		for (const child of kids) {
			const size = layoutNode(child, childLeft, top + h + 64);
			childLeft += size.width + 40;
			maxChildH = Math.max(maxChildH, size.height);
		}
		const childrenWidth = childLeft - left - 40;
		const totalWidth = Math.max(w, childrenWidth);
		const nodeX = left + (totalWidth - w) / 2;
		boxes[node.id] = {
			x: nodeX,
			y: top,
			w,
			h
		};
		return {
			width: totalWidth,
			height: h + 64 + maxChildH
		};
	};
	let x = 56;
	let maxH = 0;
	for (const root of roots) {
		const size = layoutNode(root, x, 56);
		x += size.width + 80;
		maxH = Math.max(maxH, size.height);
	}
	return {
		boxes,
		width: Math.max(368, x - 80 + 56),
		height: Math.max(estimateNodeHeight(" ") + 112, maxH + 112)
	};
}
function cubicEdge(x1, y1, x2, y2) {
	const dy = Math.max(28, Math.abs(y2 - y1) * .45);
	return `M ${x1} ${y1} C ${x1} ${y1 + dy}, ${x2} ${y2 - dy}, ${x2} ${y2}`;
}
function arcEdge(x1, y1, x2, y2) {
	const dx = x2 - x1;
	const dy = y2 - y1;
	return `M ${x1} ${y1} Q ${(x1 + x2) / 2 - dy * .22} ${(y1 + y2) / 2 + dx * .22} ${x2} ${y2}`;
}
function midpointOnCubic(x1, y1, x2, y2) {
	const dy = Math.max(28, Math.abs(y2 - y1) * .45);
	const t = .5;
	const p1y = y1 + dy;
	const p2y = y2 - dy;
	const u = .5;
	return {
		x: u * u * u * x1 + 3 * u * u * t * x1 + 3 * u * t * t * x2 + t * t * t * x2,
		y: u * u * u * y1 + 3 * u * u * t * p1y + 3 * u * t * t * p2y + t * t * t * y2
	};
}
//#endregion
//#region src/lib/sample.ts
var T0 = 17567004e5;
function t(id, text, parentId, relation, offset) {
	return {
		id,
		text,
		parentId,
		relation,
		createdAt: T0 + offset * 6e4
	};
}
function createSampleDiscussion() {
	return {
		id: "disc-sample",
		title: "什么是真正的简单",
		createdAt: T0,
		updatedAt: 175670112e4,
		links: [{
			id: "link-sample-1",
			fromId: "t-6",
			toId: "t-9",
			relation: "continue"
		}],
		collapsedIds: [],
		view: {
			x: 0,
			y: 0,
			scale: 0
		},
		thoughts: [
			t("t-1", "简单不是少，而是恰好。", null, "continue", 0),
			t("t-2", "少，是在做删减。恰好，是结构对了。", "t-1", "branch", 1),
			t("t-3", "结构一对准，再多的细节也会自己安静下来。", "t-2", "continue", 2),
			t("t-4", "可是很多所谓的简单，只是把复杂藏到了别处。", "t-3", "counter", 3),
			t("t-5", "那怎么分辨「恰好」和「藏起来」？", "t-4", "question", 4),
			t("t-6", "往回看的时候，脉络还在不在。还在，就是恰好。", "t-5", "continue", 5),
			t("t-7", "界面上的简单，常常把选择交给了使用者的记忆。", "t-1", "branch", 6),
			t("t-8", "真正的简单不需要记忆。", "t-7", "counter", 7),
			t("t-9", "所以这个工具不该教我怎么想，只该把我想过的形状留下来。", "t-8", "continue", 8),
			t("t-10", "那自我讨论为什么会乱？", "t-1", "question", 9),
			t("t-11", "因为想法是线性冒出来的，而道理是有分叉的。", "t-10", "continue", 10),
			t("t-12", "乱，不是想错了，是形状还没被看见。", "t-11", "continue", 11)
		]
	};
}
function createBlankDiscussion(title = "新的讨论") {
	const now = Date.now();
	return {
		id: crypto.randomUUID(),
		title,
		createdAt: now,
		updatedAt: now,
		thoughts: [],
		links: [],
		collapsedIds: [],
		view: {
			x: 0,
			y: 0,
			scale: 0
		}
	};
}
//#endregion
//#region src/lib/store.ts
var sample = createSampleDiscussion();
function patchCurrent(discussions, currentId, patch) {
	return discussions.map((d) => d.id === currentId ? patch({
		...d,
		updatedAt: Date.now()
	}) : d);
}
function lastThoughtId(d) {
	if (d.thoughts.length === 0) return null;
	return d.thoughts.reduce((a, b) => a.createdAt >= b.createdAt ? a : b).id;
}
function noopStorage() {
	return {
		getItem: () => null,
		setItem: () => {},
		removeItem: () => {}
	};
}
var useAppStore = create()(persist((set, get) => ({
	discussions: [sample],
	currentId: sample.id,
	selectedId: "t-12",
	editingId: null,
	linkMode: false,
	composerText: "",
	relation: "continue",
	panelOpen: false,
	hydrated: false,
	justAddedId: null,
	fitNonce: 0,
	current: () => {
		const { discussions, currentId } = get();
		return discussions.find((d) => d.id === currentId) ?? discussions[0];
	},
	setComposerText: (text) => set({ composerText: text }),
	setRelation: (relation) => set({ relation }),
	cycleRelation: (delta) => {
		const { relation } = get();
		const next = RELATIONS[(RELATIONS.indexOf(relation) + delta + RELATIONS.length) % RELATIONS.length];
		set({ relation: next });
	},
	select: (id) => set({
		selectedId: id,
		linkMode: false,
		editingId: null
	}),
	setEditing: (id) => set({
		editingId: id,
		linkMode: false
	}),
	setLinkMode: (on) => set({ linkMode: on }),
	setPanelOpen: (open) => set({ panelOpen: open }),
	requestFit: () => set((s) => ({ fitNonce: s.fitNonce + 1 })),
	navigate: (dir) => {
		const s = get();
		const next = adjacentThought(s.current().thoughts, s.selectedId, dir);
		if (!next) return;
		set({
			selectedId: next,
			linkMode: false,
			editingId: null
		});
	},
	addThought: () => {
		const text = get().composerText.trim();
		if (!text) return null;
		const id = uid();
		const { currentId, selectedId, relation } = get();
		const now = Date.now();
		set((s) => {
			const cur = s.discussions.find((d) => d.id === currentId) ?? s.discussions[0];
			const parentId = selectedId !== null && cur.thoughts.some((t) => t.id === selectedId) ? selectedId : null;
			const thought = {
				id,
				text,
				parentId,
				relation: parentId ? relation : "continue",
				createdAt: now
			};
			const title = (cur.title === "新的讨论" || cur.title === "未命名") && cur.thoughts.length === 0 ? text.replace(/\s+/g, " ").slice(0, 16) : cur.title;
			const collapsedIds = parentId ? cur.collapsedIds.filter((c) => c !== parentId) : cur.collapsedIds;
			return {
				composerText: "",
				selectedId: id,
				justAddedId: id,
				discussions: patchCurrent(s.discussions, cur.id, (d) => ({
					...d,
					title,
					thoughts: [...d.thoughts, thought],
					collapsedIds
				}))
			};
		});
		window.setTimeout(() => {
			if (get().justAddedId === id) set({ justAddedId: null });
		}, 700);
		return id;
	},
	updateThought: (id, text) => {
		const trimmed = text.trim();
		if (!trimmed) return;
		set((s) => ({
			editingId: s.editingId === id ? null : s.editingId,
			discussions: patchCurrent(s.discussions, s.currentId, (d) => ({
				...d,
				thoughts: d.thoughts.map((t) => t.id === id ? {
					...t,
					text: trimmed
				} : t)
			}))
		}));
	},
	deleteThought: (id) => {
		set((s) => {
			const cur = s.discussions.find((d) => d.id === s.currentId) ?? s.discussions[0];
			const removed = new Set(descendantIds(cur.thoughts, id));
			removed.add(id);
			const parentId = cur.thoughts.find((t) => t.id === id)?.parentId ?? null;
			const thoughts = cur.thoughts.filter((t) => !removed.has(t.id));
			const links = cur.links.filter((l) => !removed.has(l.fromId) && !removed.has(l.toId));
			return {
				selectedId: s.selectedId && removed.has(s.selectedId) ? parentId : s.selectedId,
				editingId: s.editingId && removed.has(s.editingId) ? null : s.editingId,
				discussions: patchCurrent(s.discussions, s.currentId, (d) => ({
					...d,
					thoughts,
					links,
					collapsedIds: d.collapsedIds.filter((c) => !removed.has(c))
				}))
			};
		});
	},
	reparent: (id, parentId, relation) => {
		set((s) => {
			const cur = s.discussions.find((d) => d.id === s.currentId) ?? s.discussions[0];
			if (parentId === id) return s;
			if (parentId && isDescendant(cur.thoughts, id, parentId)) return s;
			if (parentId && !cur.thoughts.some((t) => t.id === parentId)) return s;
			return { discussions: patchCurrent(s.discussions, s.currentId, (d) => ({
				...d,
				thoughts: d.thoughts.map((t) => t.id === id ? {
					...t,
					parentId,
					relation: relation ?? t.relation
				} : t),
				collapsedIds: parentId ? d.collapsedIds.filter((c) => c !== parentId) : d.collapsedIds
			})) };
		});
	},
	addLink: (fromId, toId, relation) => {
		if (fromId === toId) return;
		set((s) => {
			const cur = s.discussions.find((d) => d.id === s.currentId) ?? s.discussions[0];
			const exists = cur.links.some((l) => l.fromId === fromId && l.toId === toId || l.fromId === toId && l.toId === fromId);
			const treeExists = cur.thoughts.some((t) => t.id === toId && t.parentId === fromId || t.id === fromId && t.parentId === toId);
			if (exists || treeExists) return { linkMode: false };
			const link = {
				id: uid(),
				fromId,
				toId,
				relation: relation ?? s.relation
			};
			return {
				linkMode: false,
				discussions: patchCurrent(s.discussions, s.currentId, (d) => ({
					...d,
					links: [...d.links, link]
				}))
			};
		});
	},
	removeLink: (id) => {
		set((s) => ({ discussions: patchCurrent(s.discussions, s.currentId, (d) => ({
			...d,
			links: d.links.filter((l) => l.id !== id)
		})) }));
	},
	toggleCollapse: (id) => {
		set((s) => ({ discussions: patchCurrent(s.discussions, s.currentId, (d) => {
			const has = d.collapsedIds.includes(id);
			return {
				...d,
				collapsedIds: has ? d.collapsedIds.filter((c) => c !== id) : [...d.collapsedIds, id]
			};
		}) }));
	},
	setView: (view) => {
		set((s) => ({ discussions: s.discussions.map((d) => d.id === s.currentId ? {
			...d,
			view
		} : d) }));
	},
	newDiscussion: () => {
		const d = createBlankDiscussion();
		set((s) => ({
			discussions: [d, ...s.discussions],
			currentId: d.id,
			selectedId: null,
			editingId: null,
			linkMode: false,
			composerText: "",
			relation: "continue",
			panelOpen: false
		}));
	},
	switchDiscussion: (id) => {
		const d = get().discussions.find((x) => x.id === id);
		if (!d) return;
		set({
			currentId: id,
			selectedId: lastThoughtId(d),
			editingId: null,
			linkMode: false,
			composerText: "",
			panelOpen: false
		});
	},
	renameDiscussion: (id, title) => {
		const next = title.trim() || "未命名";
		set((s) => ({ discussions: s.discussions.map((d) => d.id === id ? {
			...d,
			title: next,
			updatedAt: Date.now()
		} : d) }));
	},
	deleteDiscussion: (id) => {
		set((s) => {
			let discussions = s.discussions.filter((d) => d.id !== id);
			if (discussions.length === 0) discussions = [createBlankDiscussion()];
			const currentId = s.currentId === id ? discussions[0].id : s.currentId;
			const cur = discussions.find((d) => d.id === currentId);
			return {
				discussions,
				currentId,
				selectedId: lastThoughtId(cur),
				editingId: null,
				panelOpen: discussions.length > 0 && s.panelOpen
			};
		});
	},
	finishHydration: () => {
		set((s) => {
			const discussions = s.discussions.length > 0 ? s.discussions : [createSampleDiscussion()];
			const current = discussions.find((d) => d.id === s.currentId) ?? discussions[0];
			return {
				discussions,
				currentId: current.id,
				selectedId: s.selectedId ?? lastThoughtId(current),
				hydrated: true
			};
		});
	}
}), {
	name: "lilu-v1",
	skipHydration: true,
	storage: createJSONStorage(() => typeof window === "undefined" ? noopStorage() : localStorage),
	partialize: (s) => ({
		discussions: s.discussions,
		currentId: s.currentId
	}),
	onRehydrateStorage: () => (state) => {
		state?.finishHydration();
	}
}));
function useCurrentDiscussion() {
	return useAppStore((s) => {
		return s.discussions.find((d) => d.id === s.currentId) ?? s.discussions[0];
	});
}
function useSelectedPath() {
	const discussion = useCurrentDiscussion();
	const selectedId = useAppStore((s) => s.selectedId);
	return pathToRoot(discussion.thoughts, selectedId);
}
//#endregion
//#region src/components/composer.tsx
function Composer() {
	const discussion = useCurrentDiscussion();
	const path = useSelectedPath();
	const text = useAppStore((s) => s.composerText);
	const relation = useAppStore((s) => s.relation);
	const selectedId = useAppStore((s) => s.selectedId);
	const editingId = useAppStore((s) => s.editingId);
	const setComposerText = useAppStore((s) => s.setComposerText);
	const setRelation = useAppStore((s) => s.setRelation);
	const addThought = useAppStore((s) => s.addThought);
	const select = useAppStore((s) => s.select);
	const navigate = useAppStore((s) => s.navigate);
	const ref = useRef(null);
	const attach = path.length > 0 ? path[path.length - 1] : null;
	const meta = RELATION_META[relation];
	const canSubmit = text.trim().length > 0;
	const showHint = discussion.thoughts.length < 4;
	const relationsEnabled = Boolean(selectedId) || discussion.thoughts.length === 0;
	useEffect(() => {
		const el = ref.current;
		if (!el) return;
		el.style.height = "auto";
		el.style.height = `${Math.min(el.scrollHeight, 152)}px`;
	}, [text]);
	useEffect(() => {
		if (editingId) return;
		if (typeof window === "undefined") return;
		if (window.matchMedia("(pointer: fine)").matches) ref.current?.focus();
	}, [selectedId, editingId]);
	const submit = () => {
		if (!canSubmit) return;
		addThought();
		ref.current?.focus();
	};
	return /* @__PURE__ */ jsxs("footer", {
		className: "bg-bg/95 relative z-20 shrink-0 border-t border-border/70 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-sm md:px-6",
		children: [path.length > 0 ? /* @__PURE__ */ jsxs("nav", {
			className: "mb-2 flex max-w-3xl items-center gap-1 overflow-x-auto text-xs text-muted",
			"aria-label": "当前脉络",
			children: [path.map((node, i) => /* @__PURE__ */ jsxs("span", {
				className: "flex shrink-0 items-center gap-1",
				children: [i > 0 ? /* @__PURE__ */ jsx("span", {
					className: "text-subtle",
					children: "/"
				}) : null, /* @__PURE__ */ jsx("button", {
					type: "button",
					className: cn("max-w-36 truncate rounded-sm px-1 py-1 hover:text-fg", i === path.length - 1 && "text-fg"),
					onClick: () => select(node.id),
					children: node.text.replace(/\s+/g, " ")
				})]
			}, node.id)), /* @__PURE__ */ jsx("button", {
				type: "button",
				className: "ml-2 shrink-0 py-1 text-subtle hover:text-muted",
				onClick: () => select(null),
				children: "新起点"
			})]
		}) : /* @__PURE__ */ jsx("p", {
			className: "mb-2 text-xs text-muted",
			children: discussion.thoughts.length === 0 ? "第一句会成为这次讨论的起点" : "未点选 · 下一句将作为新的起点"
		}), /* @__PURE__ */ jsxs("div", {
			className: "mx-auto flex max-w-3xl flex-col gap-2",
			children: [
				/* @__PURE__ */ jsx("div", {
					className: "flex items-center gap-0.5",
					role: "radiogroup",
					"aria-label": "接续方式",
					children: RELATIONS.map((r) => {
						const m = RELATION_META[r];
						const active = relation === r;
						return /* @__PURE__ */ jsxs("button", {
							type: "button",
							role: "radio",
							"aria-checked": active,
							disabled: !relationsEnabled,
							onClick: () => setRelation(r),
							className: cn("h-11 min-w-11 rounded-md px-3 text-sm transition-colors duration-quick ease-smooth", active ? "bg-surface-2 text-fg" : "text-muted hover:text-fg", !relationsEnabled && "opacity-40"),
							title: m.hint,
							children: [/* @__PURE__ */ jsx("span", {
								className: "font-display",
								children: m.label
							}), /* @__PURE__ */ jsx("span", {
								className: "ml-1 hidden text-xs text-subtle sm:inline",
								children: m.hint
							})]
						}, r);
					})
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "flex items-end gap-3",
					children: [
						/* @__PURE__ */ jsx("label", {
							className: "sr-only",
							htmlFor: "lilu-composer",
							children: "写下这一步的想法"
						}),
						/* @__PURE__ */ jsx(Textarea, {
							id: "lilu-composer",
							ref,
							rows: 1,
							value: text,
							placeholder: attach ? meta.placeholder : "写下你正在想的第一件事…",
							onChange: (e) => setComposerText(e.target.value),
							onKeyDown: (e) => {
								if (e.nativeEvent.isComposing || e.keyCode === 229) return;
								if (e.key === "Enter" && !e.shiftKey) {
									e.preventDefault();
									submit();
									return;
								}
								if (text.trim().length > 0) return;
								if (e.key === "ArrowUp") {
									e.preventDefault();
									navigate("parent");
								} else if (e.key === "ArrowDown") {
									e.preventDefault();
									navigate("child");
								} else if (e.key === "ArrowLeft") {
									e.preventDefault();
									navigate("prev");
								} else if (e.key === "ArrowRight") {
									e.preventDefault();
									navigate("next");
								}
							},
							className: "font-display min-h-11 flex-1 py-2.5 text-base leading-normal"
						}),
						/* @__PURE__ */ jsxs(Button, {
							type: "button",
							variant: "accent",
							className: "mb-0.5 h-11 shrink-0 rounded-lg px-4",
							disabled: !canSubmit,
							onClick: submit,
							"aria-label": "记入",
							children: ["记入", /* @__PURE__ */ jsx(CornerDownLeft, { className: "hidden sm:block" })]
						})
					]
				}),
				showHint ? /* @__PURE__ */ jsx("p", {
					className: "text-xs text-subtle",
					children: "Enter 记入 · 点选节点接上 · 往上翻看脉络"
				}) : /* @__PURE__ */ jsx("p", {
					className: "hidden text-xs text-subtle sm:block",
					children: "拖动想法改挂接 · 用「连」把两个角度关联起来"
				})
			]
		})]
	});
}
//#endregion
//#region src/components/session-panel.tsx
function SessionPanel() {
	const open = useAppStore((s) => s.panelOpen);
	const discussions = useAppStore((s) => s.discussions);
	const currentId = useAppStore((s) => s.currentId);
	const setPanelOpen = useAppStore((s) => s.setPanelOpen);
	const switchDiscussion = useAppStore((s) => s.switchDiscussion);
	const newDiscussion = useAppStore((s) => s.newDiscussion);
	const deleteDiscussion = useAppStore((s) => s.deleteDiscussion);
	const renameDiscussion = useAppStore((s) => s.renameDiscussion);
	const [editingId, setEditingId] = useState(null);
	return /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("div", {
		className: cn("fixed inset-0 z-40 bg-fg/20 transition-opacity duration-fast ease-smooth", open ? "opacity-100" : "pointer-events-none opacity-0"),
		onClick: () => setPanelOpen(false),
		"aria-hidden": "true"
	}), /* @__PURE__ */ jsxs("aside", {
		className: cn("fixed top-0 left-0 z-50 flex h-full w-80 max-w-[86vw] flex-col bg-surface shadow-paper-hover", "transition-transform duration-fast ease-smooth", open ? "translate-x-0" : "-translate-x-full"),
		"aria-hidden": !open,
		"aria-label": "讨论列表",
		children: [
			/* @__PURE__ */ jsxs("div", {
				className: "flex items-center justify-between px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-3",
				children: [/* @__PURE__ */ jsx("span", {
					className: "font-display text-lg text-fg",
					children: "讨论"
				}), /* @__PURE__ */ jsx(Button, {
					variant: "ghost",
					size: "icon-sm",
					"aria-label": "关闭",
					onClick: () => setPanelOpen(false),
					children: /* @__PURE__ */ jsx(X, {})
				})]
			}),
			/* @__PURE__ */ jsx("div", {
				className: "px-3 pb-3",
				children: /* @__PURE__ */ jsxs(Button, {
					variant: "outline",
					className: "h-11 w-full justify-start rounded-lg",
					onClick: newDiscussion,
					children: [/* @__PURE__ */ jsx(Plus, {}), "新的讨论"]
				})
			}),
			/* @__PURE__ */ jsx("ul", {
				className: "min-h-0 flex-1 overflow-y-auto px-2 pb-8",
				children: discussions.map((d) => {
					const active = d.id === currentId;
					return /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsxs("div", {
						className: cn("group flex items-start gap-1 rounded-lg px-2 py-2.5", active ? "bg-surface-2" : "hover:bg-bg"),
						children: [/* @__PURE__ */ jsxs("button", {
							type: "button",
							className: "min-w-0 flex-1 text-left",
							onClick: () => switchDiscussion(d.id),
							children: [editingId === d.id ? /* @__PURE__ */ jsx("input", {
								autoFocus: true,
								defaultValue: d.title,
								className: "font-display w-full bg-transparent text-sm text-fg focus-visible:outline-none",
								onClick: (e) => e.stopPropagation(),
								onBlur: (e) => {
									renameDiscussion(d.id, e.currentTarget.value);
									setEditingId(null);
								},
								onKeyDown: (e) => {
									if (e.key === "Enter") {
										renameDiscussion(d.id, e.currentTarget.value);
										setEditingId(null);
									}
									if (e.key === "Escape") setEditingId(null);
								}
							}) : /* @__PURE__ */ jsx("p", {
								className: "font-display truncate text-sm text-fg",
								onDoubleClick: (e) => {
									e.preventDefault();
									e.stopPropagation();
									setEditingId(d.id);
								},
								children: d.title
							}), /* @__PURE__ */ jsxs("p", {
								className: "mt-0.5 text-xs text-subtle",
								children: [
									d.thoughts.length,
									" 句 ·",
									" ",
									formatDistanceToNow(d.updatedAt, {
										addSuffix: true,
										locale: zhCN
									})
								]
							})]
						}), /* @__PURE__ */ jsx(Button, {
							variant: "ghost",
							size: "icon-sm",
							className: "opacity-70 group-hover:opacity-100",
							"aria-label": `删除 ${d.title}`,
							onClick: (e) => {
								e.stopPropagation();
								if (window.confirm(`删除「${d.title}」？此讨论中的脉络会一并消失。`)) deleteDiscussion(d.id);
							},
							children: /* @__PURE__ */ jsx(Trash2, {})
						})]
					}) }, d.id);
				})
			})
		]
	})] });
}
//#endregion
//#region src/components/thought-edges.tsx
function dash(relation) {
	if (relation === "branch") return "7 6";
	if (relation === "question") return "2.5 4.5";
}
function treeEdges(thoughts, boxes) {
	const edges = [];
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
			y2: to.y
		});
	}
	return edges;
}
function ThoughtEdges({ thoughts, links, boxes, selectedId, selectedPath, width, height, scale, dragLine, onRemoveLink }) {
	const edges = treeEdges(thoughts, boxes);
	const showLabels = scale >= .55;
	return /* @__PURE__ */ jsxs("svg", {
		className: "pointer-events-none absolute top-0 left-0 overflow-visible",
		width,
		height,
		"aria-hidden": "true",
		children: [
			links.map((link) => {
				const from = boxes[link.fromId];
				const to = boxes[link.toId];
				if (!from || !to) return null;
				const x1 = from.x + from.w / 2;
				const y1 = from.y + from.h / 2;
				const x2 = to.x + to.w / 2;
				const y2 = to.y + to.h / 2;
				const mx = (x1 + x2) / 2;
				const my = (y1 + y2) / 2;
				return /* @__PURE__ */ jsxs("g", {
					className: "pointer-events-auto",
					children: [
						/* @__PURE__ */ jsx("path", {
							d: arcEdge(x1, y1, x2, y2),
							fill: "none",
							stroke: "currentColor",
							className: "text-accent/40",
							strokeWidth: 1.1,
							strokeDasharray: "3 5"
						}),
						/* @__PURE__ */ jsx("circle", {
							cx: mx,
							cy: my,
							r: 8,
							className: "fill-bg stroke-accent/50 cursor-pointer",
							strokeWidth: 1,
							onClick: (e) => {
								e.stopPropagation();
								onRemoveLink(link.id);
							},
							children: /* @__PURE__ */ jsx("title", { children: "移除这条联想" })
						}),
						/* @__PURE__ */ jsx("text", {
							x: mx,
							y: my,
							textAnchor: "middle",
							dominantBaseline: "central",
							className: "fill-accent pointer-events-none font-display",
							fontSize: 10,
							children: "联"
						})
					]
				}, link.id);
			}),
			edges.map((e) => {
				const onPath = selectedPath.has(e.id) || selectedId !== null && e.parentId === selectedId;
				const d = cubicEdge(e.x1, e.y1, e.x2, e.y2);
				const mid = midpointOnCubic(e.x1, e.y1, e.x2, e.y2);
				const isCounter = e.relation === "counter";
				const label = RELATION_META[e.relation].label;
				return /* @__PURE__ */ jsxs("g", { children: [/* @__PURE__ */ jsx("path", {
					d,
					fill: "none",
					stroke: "currentColor",
					className: cn("transition-colors duration-fast ease-smooth", isCounter ? onPath ? "text-accent/80" : "text-accent/35" : onPath ? "text-ink-mid" : "text-ink-faint"),
					strokeWidth: onPath ? 1.7 : 1.1,
					strokeDasharray: dash(e.relation),
					strokeLinecap: "round"
				}), showLabels && onPath ? /* @__PURE__ */ jsxs("g", {
					transform: `translate(${mid.x}, ${mid.y})`,
					children: [/* @__PURE__ */ jsx("rect", {
						x: -8,
						y: -8,
						width: 16,
						height: 16,
						rx: 8,
						className: "fill-bg"
					}), /* @__PURE__ */ jsx("text", {
						textAnchor: "middle",
						dominantBaseline: "central",
						className: cn("font-display", isCounter ? "fill-accent" : "fill-fg"),
						fontSize: 11,
						children: label
					})]
				}) : null] }, e.id);
			}),
			dragLine ? /* @__PURE__ */ jsx("path", {
				d: cubicEdge(dragLine.x1, dragLine.y1, dragLine.x2, dragLine.y2),
				fill: "none",
				stroke: "currentColor",
				className: "text-accent",
				strokeWidth: 1.4,
				strokeDasharray: "4 4",
				strokeLinecap: "round"
			}) : null
		]
	});
}
//#endregion
//#region src/components/thought-node.tsx
function ThoughtNode({ thought, box, thoughts, selected, dimmed, collapsed, justAdded, linkMode, dropTarget, compact, onSelect, onEdit, onDelete, onToggleCollapse, onStartLink, onDragPointerDown, editing, onCommitEdit, onCancelEdit }) {
	const childCount = childrenOf(thoughts, thought.id).length;
	const [draft, setDraft] = useState(thought.text);
	const textareaRef = useRef(null);
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
	return /* @__PURE__ */ jsxs("article", {
		"data-node-id": thought.id,
		className: cn("absolute origin-top select-none", "transition-opacity duration-fast ease-smooth", justAdded && "animate-node-in", dimmed && "opacity-30"),
		style: {
			left: box.x,
			top: box.y,
			width: box.w
		},
		children: [selected && !editing ? /* @__PURE__ */ jsxs("div", {
			className: "absolute -top-9 right-0 z-20 flex rounded-md bg-surface shadow-paper",
			onPointerDown: (e) => e.stopPropagation(),
			children: [
				/* @__PURE__ */ jsxs(Tooltip, { children: [/* @__PURE__ */ jsx(TooltipTrigger, {
					asChild: true,
					children: /* @__PURE__ */ jsx(Button, {
						variant: "ghost",
						size: "icon-sm",
						"aria-label": "编辑",
						onClick: onEdit,
						children: /* @__PURE__ */ jsx(Pencil, {})
					})
				}), /* @__PURE__ */ jsx(TooltipContent, { children: "编辑" })] }),
				/* @__PURE__ */ jsxs(Tooltip, { children: [/* @__PURE__ */ jsx(TooltipTrigger, {
					asChild: true,
					children: /* @__PURE__ */ jsx(Button, {
						variant: "ghost",
						size: "icon-sm",
						"aria-label": "连接到另一个想法",
						onClick: onStartLink,
						children: /* @__PURE__ */ jsx(Link2, {})
					})
				}), /* @__PURE__ */ jsx(TooltipContent, { children: "连到另一处" })] }),
				childCount > 0 ? /* @__PURE__ */ jsxs(Tooltip, { children: [/* @__PURE__ */ jsx(TooltipTrigger, {
					asChild: true,
					children: /* @__PURE__ */ jsx(Button, {
						variant: "ghost",
						size: "icon-sm",
						"aria-label": collapsed ? "展开分叉" : "收起分叉",
						onClick: onToggleCollapse,
						children: /* @__PURE__ */ jsx(ChevronsDownUp, {})
					})
				}), /* @__PURE__ */ jsx(TooltipContent, { children: collapsed ? "展开" : "收起" })] }) : null,
				/* @__PURE__ */ jsxs(Tooltip, { children: [/* @__PURE__ */ jsx(TooltipTrigger, {
					asChild: true,
					children: /* @__PURE__ */ jsx(Button, {
						variant: "ghost",
						size: "icon-sm",
						"aria-label": "删除",
						onClick: onDelete,
						children: /* @__PURE__ */ jsx(Trash2, {})
					})
				}), /* @__PURE__ */ jsx(TooltipContent, { children: "删除这条脉络" })] })
			]
		}) : null, /* @__PURE__ */ jsxs("div", {
			className: cn("relative rounded-md px-4 py-3.5 text-left", "transition-[box-shadow,background-color,opacity] duration-quick ease-smooth", selected ? "bg-surface shadow-ink" : "hover:bg-surface/80", dropTarget && "bg-surface shadow-drop", linkMode && "cursor-alias", !linkMode && "cursor-pointer"),
			onPointerDown: (e) => {
				if (e.button !== 0) return;
				e.stopPropagation();
				onSelect();
				if (editing || linkMode) return;
				onDragPointerDown(e);
			},
			onDoubleClick: (e) => {
				e.stopPropagation();
				onEdit();
			},
			children: [editing ? /* @__PURE__ */ jsx("textarea", {
				ref: textareaRef,
				value: draft,
				onChange: (e) => setDraft(e.target.value),
				onPointerDown: (e) => e.stopPropagation(),
				onKeyDown: (e) => {
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
				},
				onBlur: commit,
				className: "font-display w-full resize-none bg-transparent text-sm leading-normal break-words text-fg focus-visible:outline-none",
				rows: Math.min(4, Math.max(2, draft.split("\n").length)),
				"aria-label": "编辑想法"
			}) : /* @__PURE__ */ jsx("p", {
				className: cn("font-display text-sm leading-normal break-words text-fg", compact ? "line-clamp-1" : "line-clamp-4"),
				children: thought.text
			}), collapsed && childCount > 0 ? /* @__PURE__ */ jsxs("span", {
				className: "mt-2 inline-block text-xs tabular-nums text-muted",
				children: [childCount, " 条分叉"]
			}) : null]
		})]
	});
}
//#endregion
//#region src/components/thought-canvas.tsx
var MIN_SCALE = .22;
var MAX_SCALE = 2.1;
function clamp(n, a, b) {
	return Math.max(a, Math.min(b, n));
}
function ThoughtCanvas() {
	const discussion = useCurrentDiscussion();
	const selectedId = useAppStore((s) => s.selectedId);
	const editingId = useAppStore((s) => s.editingId);
	const linkMode = useAppStore((s) => s.linkMode);
	const justAddedId = useAppStore((s) => s.justAddedId);
	const fitNonce = useAppStore((s) => s.fitNonce);
	const select = useAppStore((s) => s.select);
	const setEditing = useAppStore((s) => s.setEditing);
	const setLinkMode = useAppStore((s) => s.setLinkMode);
	const addLink = useAppStore((s) => s.addLink);
	const removeLink = useAppStore((s) => s.removeLink);
	const reparent = useAppStore((s) => s.reparent);
	const updateThought = useAppStore((s) => s.updateThought);
	const deleteThought = useAppStore((s) => s.deleteThought);
	const toggleCollapse = useAppStore((s) => s.toggleCollapse);
	const persistView = useAppStore((s) => s.setView);
	const hydrated = useAppStore((s) => s.hydrated);
	const viewportRef = useRef(null);
	const [size, setSize] = useState({
		w: 0,
		h: 0
	});
	const [dragLine, setDragLine] = useState(null);
	const [hoverId, setHoverId] = useState(null);
	const [panning, setPanning] = useState(false);
	const [view, setViewState] = useState(discussion.view);
	const viewRef = useRef(view);
	viewRef.current = view;
	const persistTimer = useRef(0);
	const fittedFor = useRef(null);
	const updateView = useCallback((next) => {
		viewRef.current = next;
		setViewState(next);
		window.clearTimeout(persistTimer.current);
		persistTimer.current = window.setTimeout(() => persistView(next), 400);
	}, [persistView]);
	useEffect(() => {
		return () => {
			window.clearTimeout(persistTimer.current);
			persistView(viewRef.current);
		};
	}, [persistView]);
	const discussionId = discussion.id;
	useEffect(() => {
		const stored = useAppStore.getState().current().view;
		if (stored.scale > 0) {
			setViewState(stored);
			fittedFor.current = discussionId;
			return;
		}
		if (viewRef.current.scale > 0 && fittedFor.current === discussionId) return;
		setViewState({
			x: 0,
			y: 0,
			scale: 0
		});
		fittedFor.current = null;
	}, [discussionId, hydrated]);
	const collapsed = useMemo(() => new Set(discussion.collapsedIds), [discussion.collapsedIds]);
	const { boxes, width, height } = useMemo(() => layoutThoughts(discussion.thoughts, collapsed), [discussion.thoughts, collapsed]);
	const boxesRef = useRef(boxes);
	boxesRef.current = boxes;
	const thoughtsRef = useRef(discussion.thoughts);
	thoughtsRef.current = discussion.thoughts;
	const selectedPath = useMemo(() => {
		const path = pathToRoot(discussion.thoughts, selectedId);
		return new Set(path.map((t) => t.id));
	}, [discussion.thoughts, selectedId]);
	useEffect(() => {
		const el = viewportRef.current;
		if (!el) return;
		const ro = new ResizeObserver((entries) => {
			const cr = entries[0]?.contentRect;
			if (!cr) return;
			setSize({
				w: cr.width,
				h: cr.height
			});
		});
		ro.observe(el);
		return () => ro.disconnect();
	}, []);
	const fitView = useCallback(() => {
		const el = viewportRef.current;
		if (!el) return;
		const vw = el.clientWidth;
		const vh = el.clientHeight;
		if (vw < 40 || vh < 40) return;
		const pad = 40;
		const scale = clamp(Math.min((vw - 80) / Math.max(width, 1), (vh - 80) / Math.max(height, 1)), MIN_SCALE, 1);
		const x = (vw - width * scale) / 2;
		const y = Math.max(pad, (vh - height * scale) / 3.6);
		updateView({
			x,
			y,
			scale
		});
	}, [
		width,
		height,
		updateView
	]);
	useEffect(() => {
		if (size.w < 40) return;
		if (fittedFor.current === discussion.id) return;
		if (viewRef.current.scale > 0) {
			fittedFor.current = discussion.id;
			return;
		}
		fitView();
		fittedFor.current = discussion.id;
	}, [
		discussion.id,
		size.w,
		size.h,
		fitView
	]);
	useEffect(() => {
		fittedFor.current = null;
	}, [discussion.id]);
	useEffect(() => {
		if (fitNonce === 0) return;
		fitView();
	}, [fitNonce, fitView]);
	useEffect(() => {
		if (!justAddedId) return;
		const box = boxes[justAddedId];
		const el = viewportRef.current;
		if (!box || !el) return;
		const { x, y, scale } = viewRef.current;
		if (scale <= 0) return;
		const vw = el.clientWidth;
		const vh = el.clientHeight;
		const targetSX = vw / 2;
		const targetSY = vh * .74;
		const sx = x + (box.x + box.w / 2) * scale;
		const sy = y + (box.y + box.h) * scale;
		updateView({
			x: x + (targetSX - sx),
			y: y + (targetSY - sy),
			scale
		});
	}, [
		justAddedId,
		boxes,
		updateView
	]);
	const prevSelected = useRef(void 0);
	useEffect(() => {
		prevSelected.current = void 0;
	}, [discussion.id]);
	useEffect(() => {
		if (prevSelected.current === void 0) {
			prevSelected.current = selectedId;
			return;
		}
		if (prevSelected.current === selectedId) return;
		prevSelected.current = selectedId;
		if (!selectedId || justAddedId) return;
		const box = boxes[selectedId];
		const el = viewportRef.current;
		if (!box || !el) return;
		const { x, y, scale } = viewRef.current;
		if (scale <= 0) return;
		const vw = el.clientWidth;
		const vh = el.clientHeight;
		const sx = x + (box.x + box.w / 2) * scale;
		const sy = y + (box.y + box.h / 2) * scale;
		const margin = 56;
		let nx = x;
		let ny = y;
		if (sx < margin) nx += margin - sx;
		if (sx > vw - margin) nx -= sx - (vw - margin);
		if (sy < margin) ny += margin - sy;
		if (sy > vh - margin) ny -= sy - (vh - margin);
		if (nx !== x || ny !== y) updateView({
			x: nx,
			y: ny,
			scale
		});
	}, [
		selectedId,
		justAddedId,
		boxes,
		updateView
	]);
	const screenToWorld = useCallback((clientX, clientY) => {
		const el = viewportRef.current;
		if (!el) return {
			x: 0,
			y: 0
		};
		const rect = el.getBoundingClientRect();
		const { x, y, scale } = viewRef.current;
		const s = scale || 1;
		return {
			x: (clientX - rect.left - x) / s,
			y: (clientY - rect.top - y) / s
		};
	}, []);
	const hitNode = useCallback((worldX, worldY) => {
		const map = boxesRef.current;
		for (const t of thoughtsRef.current) {
			const b = map[t.id];
			if (!b) continue;
			if (worldX >= b.x && worldX <= b.x + b.w && worldY >= b.y && worldY <= b.y + b.h) return t.id;
		}
		return null;
	}, []);
	useEffect(() => {
		const el = viewportRef.current;
		if (!el) return;
		const onWheel = (e) => {
			e.preventDefault();
			const { x, y, scale } = viewRef.current;
			const s = scale || 1;
			if (e.ctrlKey || e.metaKey) {
				const rect = el.getBoundingClientRect();
				const cx = e.clientX - rect.left;
				const cy = e.clientY - rect.top;
				const wx = (cx - x) / s;
				const wy = (cy - y) / s;
				const next = clamp(s * (e.deltaY > 0 ? .94 : 1.06), MIN_SCALE, MAX_SCALE);
				updateView({
					x: cx - wx * next,
					y: cy - wy * next,
					scale: next
				});
				return;
			}
			updateView({
				x: x - e.deltaX,
				y: y - e.deltaY,
				scale: s
			});
		};
		el.addEventListener("wheel", onWheel, { passive: false });
		return () => el.removeEventListener("wheel", onWheel);
	}, [updateView]);
	useEffect(() => {
		const el = viewportRef.current;
		if (!el) return;
		let startDist = 0;
		let startScale = 1;
		const distance = (touches) => {
			const a = touches.item(0);
			const b = touches.item(1);
			if (!a || !b) return 0;
			return Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
		};
		const onStart = (e) => {
			if (e.touches.length === 2) {
				startDist = distance(e.touches) || 1;
				startScale = viewRef.current.scale || 1;
			}
		};
		const onMove = (e) => {
			if (e.touches.length !== 2) return;
			e.preventDefault();
			const a = e.touches.item(0);
			const b = e.touches.item(1);
			if (!a || !b) return;
			const rect = el.getBoundingClientRect();
			const cx = (a.clientX + b.clientX) / 2 - rect.left;
			const cy = (a.clientY + b.clientY) / 2 - rect.top;
			const { x, y, scale } = viewRef.current;
			const s = scale || 1;
			const next = clamp(startScale * (distance(e.touches) / startDist), MIN_SCALE, MAX_SCALE);
			const wx = (cx - x) / s;
			const wy = (cy - y) / s;
			updateView({
				x: cx - wx * next,
				y: cy - wy * next,
				scale: next
			});
		};
		el.addEventListener("touchstart", onStart, { passive: true });
		el.addEventListener("touchmove", onMove, { passive: false });
		return () => {
			el.removeEventListener("touchstart", onStart);
			el.removeEventListener("touchmove", onMove);
		};
	}, [updateView]);
	const onPointerDownBg = (e) => {
		if (e.button !== 0) return;
		if (e.target.closest("[data-node-id]")) return;
		if (linkMode) {
			setLinkMode(false);
			return;
		}
		e.preventDefault();
		setPanning(true);
		const originX = e.clientX;
		const originY = e.clientY;
		const start = { ...viewRef.current };
		const move = (ev) => {
			updateView({
				x: start.x + (ev.clientX - originX),
				y: start.y + (ev.clientY - originY),
				scale: start.scale || 1
			});
		};
		const up = () => {
			setPanning(false);
			window.removeEventListener("pointermove", move);
			window.removeEventListener("pointerup", up);
		};
		window.addEventListener("pointermove", move);
		window.addEventListener("pointerup", up);
	};
	const startNodeDrag = (id, e) => {
		e.stopPropagation();
		const box = boxes[id];
		if (!box) return;
		const originX = e.clientX;
		const originY = e.clientY;
		const x1 = box.x + box.w / 2;
		const y1 = box.y + box.h / 2;
		let dragging = false;
		const move = (ev) => {
			if (!dragging) {
				if (Math.hypot(ev.clientX - originX, ev.clientY - originY) < 8) return;
				dragging = true;
			}
			const w = screenToWorld(ev.clientX, ev.clientY);
			setHoverId(hitNode(w.x, w.y));
			setDragLine({
				fromId: id,
				x1,
				y1,
				x2: w.x,
				y2: w.y
			});
		};
		const up = (ev) => {
			if (dragging) {
				const w = screenToWorld(ev.clientX, ev.clientY);
				const target = hitNode(w.x, w.y);
				if (target && target !== id) reparent(id, target);
			}
			setDragLine(null);
			setHoverId(null);
			window.removeEventListener("pointermove", move);
			window.removeEventListener("pointerup", up);
		};
		window.addEventListener("pointermove", move);
		window.addEventListener("pointerup", up);
	};
	const onNodeClick = (id) => {
		if (linkMode && selectedId && selectedId !== id) {
			addLink(selectedId, id);
			return;
		}
		select(id);
	};
	const { x, y, scale } = view.scale > 0 ? view : {
		x: 0,
		y: 80,
		scale: 1
	};
	const compact = scale < .6;
	const empty = discussion.thoughts.length === 0;
	return /* @__PURE__ */ jsxs("div", {
		ref: viewportRef,
		"data-canvas": "lilu",
		className: cn("relative min-h-0 flex-1 touch-none overflow-hidden overscroll-none", panning ? "cursor-grabbing" : "cursor-grab", linkMode && "cursor-alias"),
		onPointerDown: onPointerDownBg,
		children: [
			/* @__PURE__ */ jsxs("div", {
				className: "absolute top-0 left-0 origin-top-left will-change-transform",
				style: {
					width,
					height,
					transform: `translate(${x}px, ${y}px) scale(${scale})`
				},
				children: [/* @__PURE__ */ jsx(ThoughtEdges, {
					thoughts: discussion.thoughts,
					links: discussion.links,
					boxes,
					selectedId,
					selectedPath,
					width,
					height,
					scale,
					dragLine: dragLine ? {
						x1: dragLine.x1,
						y1: dragLine.y1,
						x2: dragLine.x2,
						y2: dragLine.y2
					} : null,
					onRemoveLink: removeLink
				}), discussion.thoughts.map((t) => {
					const box = boxes[t.id];
					if (!box) return null;
					const onPath = selectedPath.size === 0 || selectedPath.has(t.id);
					const isChildOfSelected = selectedId !== null && t.parentId === selectedId;
					return /* @__PURE__ */ jsx(ThoughtNode, {
						thought: t,
						box,
						thoughts: discussion.thoughts,
						selected: selectedId === t.id,
						dimmed: Boolean(selectedId) && !onPath && !isChildOfSelected,
						collapsed: collapsed.has(t.id),
						justAdded: justAddedId === t.id,
						linkMode,
						dropTarget: hoverId === t.id && dragLine !== null,
						compact,
						onSelect: () => onNodeClick(t.id),
						onEdit: () => setEditing(t.id),
						onDelete: () => deleteThought(t.id),
						onToggleCollapse: () => toggleCollapse(t.id),
						onStartLink: () => {
							select(t.id);
							setLinkMode(true);
						},
						onDragPointerDown: (ev) => startNodeDrag(t.id, ev),
						editing: editingId === t.id,
						onCommitEdit: (text) => updateThought(t.id, text),
						onCancelEdit: () => setEditing(null)
					}, t.id);
				})]
			}),
			empty ? /* @__PURE__ */ jsx("div", {
				className: "pointer-events-none absolute inset-0 flex items-center justify-center px-8",
				children: /* @__PURE__ */ jsx("p", {
					className: "font-display max-w-xs text-center text-lg text-muted",
					children: "从下面写下第一句"
				})
			}) : null,
			linkMode ? /* @__PURE__ */ jsx("div", {
				className: "pointer-events-none absolute top-3 left-1/2 -translate-x-1/2 rounded-md bg-fg px-3 py-1.5 text-xs text-bg",
				children: "点另一个想法，把它们连起来"
			}) : null
		]
	});
}
function FitViewButton({ className, children, ...props }) {
	const requestFit = useAppStore((s) => s.requestFit);
	return /* @__PURE__ */ jsx(Button, {
		type: "button",
		variant: "ghost",
		className,
		onClick: requestFit,
		...props,
		children: children ?? "看全貌"
	});
}
//#endregion
//#region src/components/app-shell.tsx
function AppShell() {
	const discussion = useCurrentDiscussion();
	const setPanelOpen = useAppStore((s) => s.setPanelOpen);
	const newDiscussion = useAppStore((s) => s.newDiscussion);
	const renameDiscussion = useAppStore((s) => s.renameDiscussion);
	const finishHydration = useAppStore((s) => s.finishHydration);
	const [editingTitle, setEditingTitle] = useState(false);
	const [titleDraft, setTitleDraft] = useState(discussion.title);
	useEffect(() => {
		useAppStore.persist.rehydrate();
		const t = window.setTimeout(() => {
			if (!useAppStore.getState().hydrated) finishHydration();
		}, 80);
		return () => window.clearTimeout(t);
	}, [finishHydration]);
	useEffect(() => {
		setTitleDraft(discussion.title);
		setEditingTitle(false);
	}, [discussion.id, discussion.title]);
	useEffect(() => {
		const onKey = (e) => {
			if (e.key !== "Escape") return;
			const s = useAppStore.getState();
			if (s.editingId) s.setEditing(null);
			else if (s.linkMode) s.setLinkMode(false);
			else if (s.panelOpen) s.setPanelOpen(false);
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, []);
	const commitTitle = () => {
		renameDiscussion(discussion.id, titleDraft);
		setEditingTitle(false);
	};
	return /* @__PURE__ */ jsxs("div", {
		className: "paper-grain flex h-dvh flex-col overflow-hidden",
		children: [
			/* @__PURE__ */ jsxs("header", {
				className: "relative z-20 flex shrink-0 items-center gap-2 px-2 pt-[max(0.5rem,env(safe-area-inset-top))] pb-1 md:px-4",
				children: [
					/* @__PURE__ */ jsx(Button, {
						variant: "ghost",
						size: "icon",
						"aria-label": "打开讨论列表",
						onClick: () => setPanelOpen(true),
						children: /* @__PURE__ */ jsx(List, {})
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "min-w-0 flex-1",
						children: [/* @__PURE__ */ jsx("p", {
							className: "font-display text-xs tracking-mark text-muted",
							children: "理路"
						}), editingTitle ? /* @__PURE__ */ jsx(Input, {
							autoFocus: true,
							value: titleDraft,
							onChange: (e) => setTitleDraft(e.target.value),
							onBlur: commitTitle,
							onKeyDown: (e) => {
								if (e.key === "Enter") commitTitle();
								if (e.key === "Escape") {
									setTitleDraft(discussion.title);
									setEditingTitle(false);
								}
							},
							className: "font-display h-8 text-lg leading-tight text-fg",
							"aria-label": "讨论标题"
						}) : /* @__PURE__ */ jsx("button", {
							type: "button",
							className: "font-display block max-w-full truncate text-left text-lg leading-tight text-fg",
							onClick: () => setEditingTitle(true),
							children: discussion.title
						})]
					}),
					/* @__PURE__ */ jsx(FitViewButton, {
						className: "hidden h-11 items-center gap-1.5 rounded-md px-3 text-sm text-muted hover:bg-surface-2 hover:text-fg sm:inline-flex",
						children: "看全貌"
					}),
					/* @__PURE__ */ jsx(FitViewButton, {
						size: "icon",
						className: "text-muted sm:hidden",
						"aria-label": "看全貌",
						children: /* @__PURE__ */ jsx(Expand, {})
					}),
					/* @__PURE__ */ jsx(Button, {
						variant: "ghost",
						size: "icon",
						"aria-label": "新的讨论",
						onClick: newDiscussion,
						children: /* @__PURE__ */ jsx(Plus, {})
					})
				]
			}),
			/* @__PURE__ */ jsx(ThoughtCanvas, {}),
			/* @__PURE__ */ jsx(Composer, {}),
			/* @__PURE__ */ jsx(SessionPanel, {})
		]
	});
}
//#endregion
//#region src/routes/index.tsx?tsr-split=component
function Home() {
	return /* @__PURE__ */ jsx(TooltipProvider, {
		delayDuration: 400,
		children: /* @__PURE__ */ jsx(AppShell, {})
	});
}
//#endregion
export { Home as component };
