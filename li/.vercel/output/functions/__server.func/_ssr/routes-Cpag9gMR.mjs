import { i as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { a as Pencil, c as Expand, i as Plus, l as CornerDownLeft, o as List, r as Trash2, s as Link2, t as X, u as ChevronsDownUp } from "../_libs/lucide-react.mjs";
import { i as Slot } from "../_libs/@radix-ui/react-dismissable-layer+[...].mjs";
import { a as Trigger, i as Root3, n as Portal, r as Provider, t as Content2 } from "../_libs/@radix-ui/react-tooltip+[...].mjs";
import { n as clsx, t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
import { n as persist, r as create, t as createJSONStorage } from "../_libs/zustand.mjs";
import { n as formatDistanceToNow, t as zhCN } from "../_libs/date-fns.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-Cpag9gMR.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
function uid() {
	return crypto.randomUUID();
}
var TooltipProvider = Provider;
var Tooltip = Root3;
var TooltipTrigger = Trigger;
var TooltipContent = import_react.forwardRef(({ className, sideOffset = 6, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Portal, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Content2, {
	ref,
	sideOffset,
	className: cn("z-50 overflow-hidden rounded-md bg-fg px-2 py-1 text-xs text-bg shadow-paper", "animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0", className),
	...props
}) }));
TooltipContent.displayName = Content2.displayName;
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
var Button = import_react.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(asChild ? Slot : "button", {
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
var Input = import_react.forwardRef(({ className, type, ...props }, ref) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
		type,
		className: cn("flex h-10 w-full bg-transparent px-0 py-0 text-base text-fg placeholder:text-subtle focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50", className),
		ref,
		...props
	});
});
Input.displayName = "Input";
var Textarea = import_react.forwardRef(({ className, ...props }, ref) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
		className: cn("flex min-h-16 w-full resize-none bg-transparent px-0 py-0 text-base text-fg leading-normal placeholder:text-subtle focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50", className),
		ref,
		...props
	});
});
Textarea.displayName = "Textarea";
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
var CHAR_W = 15;
function estimateNodeHeight(text) {
	const contentW = 200;
	let lines = 0;
	const paragraphs = text.length === 0 ? [""] : text.split("\n");
	for (const p of paragraphs) {
		const width = Math.max(1, [...p].length) * CHAR_W;
		lines += Math.max(1, Math.ceil(width / contentW));
	}
	lines = Math.min(5, Math.max(1, lines));
	return 28 + lines * 23;
}
function childrenOf(thoughts, parentId) {
	return thoughts.filter((t) => t.parentId === parentId).sort((a, b) => a.createdAt - b.createdAt);
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
function layoutThoughts(thoughts, collapsedIds) {
	const boxes = {};
	const roots = childrenOf(thoughts, null);
	const layoutNode = (node, left, top) => {
		const h = estimateNodeHeight(node.text);
		const w = 232;
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
		const childSizes = [];
		for (const child of kids) {
			const size = layoutNode(child, childLeft, top + h + 58);
			childLeft += size.width + 44;
			maxChildH = Math.max(maxChildH, size.height);
			childSizes.push(size);
		}
		const childrenWidth = childLeft - left - 44;
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
			height: h + 58 + maxChildH
		};
	};
	let x = 48;
	let maxH = 0;
	for (const root of roots) {
		const size = layoutNode(root, x, 48);
		x += size.width + 72;
		maxH = Math.max(maxH, size.height);
	}
	return {
		boxes,
		width: Math.max(328, x - 72 + 48),
		height: Math.max(estimateNodeHeight(" ") + 96, maxH + 96)
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
		}, 600);
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
function Composer() {
	const discussion = useCurrentDiscussion();
	const path = useSelectedPath();
	const text = useAppStore((s) => s.composerText);
	const relation = useAppStore((s) => s.relation);
	const selectedId = useAppStore((s) => s.selectedId);
	const setComposerText = useAppStore((s) => s.setComposerText);
	const setRelation = useAppStore((s) => s.setRelation);
	const addThought = useAppStore((s) => s.addThought);
	const select = useAppStore((s) => s.select);
	const ref = (0, import_react.useRef)(null);
	const attach = path.length > 0 ? path[path.length - 1] : null;
	const meta = RELATION_META[relation];
	const canSubmit = text.trim().length > 0;
	const showHint = discussion.thoughts.length < 3;
	const submit = () => {
		if (!canSubmit) return;
		addThought();
		ref.current?.focus();
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("footer", {
		className: "bg-bg/95 relative z-20 shrink-0 border-t border-border/80 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-sm md:px-6",
		children: [path.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("nav", {
			className: "mb-2.5 flex max-w-3xl items-center gap-1 overflow-x-auto text-xs text-muted",
			"aria-label": "当前脉络",
			children: [path.map((node, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "flex shrink-0 items-center gap-1",
				children: [i > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-subtle",
					children: "/"
				}) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: cn("max-w-40 truncate rounded-sm px-1 py-0.5 hover:text-fg", i === path.length - 1 && "text-fg"),
					onClick: () => select(node.id),
					children: node.text.replace(/\s+/g, " ")
				})]
			}, node.id)), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				className: "ml-2 shrink-0 text-subtle hover:text-muted",
				onClick: () => select(null),
				children: "作为新起点"
			})]
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mb-2.5 text-xs text-muted",
			children: discussion.thoughts.length === 0 ? "第一句会成为这次讨论的起点" : "未点选节点 · 下一句将作为新的起点"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto flex max-w-3xl flex-col gap-2",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex items-center gap-1",
					role: "tablist",
					"aria-label": "接续方式",
					children: RELATIONS.map((r) => {
						const m = RELATION_META[r];
						const active = relation === r;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							role: "tab",
							"aria-selected": active,
							disabled: !selectedId && discussion.thoughts.length > 0,
							onClick: () => setRelation(r),
							className: cn("h-9 min-w-11 rounded-md px-3 text-sm transition-colors duration-quick ease-smooth", active ? "bg-surface-2 text-fg" : "text-muted hover:text-fg", !selectedId && discussion.thoughts.length > 0 && "opacity-40"),
							title: m.hint,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-display",
								children: m.label
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "ml-1 hidden text-xs text-subtle sm:inline",
								children: m.hint
							})]
						}, r);
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-end gap-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
							className: "sr-only",
							htmlFor: "lilu-composer",
							children: "写下这一步的想法"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
							id: "lilu-composer",
							ref,
							rows: 2,
							value: text,
							placeholder: attach ? meta.placeholder : "写下你正在想的第一件事…",
							onChange: (e) => setComposerText(e.target.value),
							onKeyDown: (e) => {
								if (e.nativeEvent.isComposing || e.keyCode === 229) return;
								if (e.key === "Enter" && !e.shiftKey) {
									e.preventDefault();
									submit();
								}
							},
							className: "font-display min-h-14 flex-1 text-base leading-normal"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							type: "button",
							variant: "accent",
							className: "mb-0.5 h-11 shrink-0 rounded-lg px-4",
							disabled: !canSubmit,
							onClick: submit,
							"aria-label": "记入",
							children: ["记入", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CornerDownLeft, { className: "hidden sm:block" })]
						})
					]
				}),
				showHint ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-subtle",
					children: "Enter 记入 · Shift+Enter 换行 · 点选节点以接上 · 滚轮往上翻看全貌"
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-subtle",
					children: "拖动节点下方圆点，接到另一处 · 连线可把两个角度关联起来"
				})
			]
		})]
	});
}
function SessionPanel() {
	const open = useAppStore((s) => s.panelOpen);
	const discussions = useAppStore((s) => s.discussions);
	const currentId = useAppStore((s) => s.currentId);
	const setPanelOpen = useAppStore((s) => s.setPanelOpen);
	const switchDiscussion = useAppStore((s) => s.switchDiscussion);
	const newDiscussion = useAppStore((s) => s.newDiscussion);
	const deleteDiscussion = useAppStore((s) => s.deleteDiscussion);
	const renameDiscussion = useAppStore((s) => s.renameDiscussion);
	const [editingId, setEditingId] = (0, import_react.useState)(null);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("fixed inset-0 z-40 bg-fg/20 transition-opacity duration-fast ease-smooth", open ? "opacity-100" : "pointer-events-none opacity-0"),
		onClick: () => setPanelOpen(false),
		"aria-hidden": "true"
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
		className: cn("fixed top-0 left-0 z-50 flex h-full w-80 max-w-[86vw] flex-col bg-surface shadow-paper-hover", "transition-transform duration-fast ease-smooth", open ? "translate-x-0" : "-translate-x-full"),
		"aria-hidden": !open,
		"aria-label": "讨论列表",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-display text-lg text-fg",
					children: "讨论"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "ghost",
					size: "icon-sm",
					"aria-label": "关闭",
					onClick: () => setPanelOpen(false),
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, {})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "px-3 pb-3",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					variant: "outline",
					className: "h-11 w-full justify-start rounded-lg",
					onClick: newDiscussion,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, {}), "新的讨论"]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "min-h-0 flex-1 overflow-y-auto px-2 pb-8",
				children: discussions.map((d) => {
					const active = d.id === currentId;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: cn("group flex items-start gap-1 rounded-lg px-2 py-2.5", active ? "bg-surface-2" : "hover:bg-bg"),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							className: "min-w-0 flex-1 text-left",
							onClick: () => switchDiscussion(d.id),
							children: [editingId === d.id ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
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
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-display truncate text-sm text-fg",
								onDoubleClick: (e) => {
									e.preventDefault();
									e.stopPropagation();
									setEditingId(d.id);
								},
								children: d.title
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
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
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "ghost",
							size: "icon-sm",
							className: "opacity-70 group-hover:opacity-100",
							"aria-label": `删除 ${d.title}`,
							onClick: (e) => {
								e.stopPropagation();
								if (window.confirm(`删除「${d.title}」？此讨论中的脉络会一并消失。`)) deleteDiscussion(d.id);
							},
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, {})
						})]
					}) }, d.id);
				})
			})
		]
	})] });
}
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
			relation: t.relation,
			x1: from.x + from.w / 2,
			y1: from.y + from.h,
			x2: to.x + to.w / 2,
			y2: to.y,
			onPath: false
		});
	}
	return edges;
}
function ThoughtEdges({ thoughts, links, boxes, selectedPath, width, height, dragLine, onRemoveLink }) {
	const edges = treeEdges(thoughts, boxes).map((e) => ({
		...e,
		onPath: selectedPath.has(e.id)
	}));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
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
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", {
					className: "pointer-events-auto",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
						d: arcEdge(x1, y1, x2, y2),
						fill: "none",
						stroke: "currentColor",
						className: "text-accent/45",
						strokeWidth: 1.15,
						strokeDasharray: "3 5"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
						cx: (x1 + x2) / 2,
						cy: (y1 + y2) / 2,
						r: 7,
						className: "fill-bg stroke-accent/50 cursor-pointer",
						strokeWidth: 1,
						onClick: (e) => {
							e.stopPropagation();
							onRemoveLink(link.id);
						},
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("title", { children: "移除这条联想" })
					})]
				}, link.id);
			}),
			edges.map((e) => {
				const d = cubicEdge(e.x1, e.y1, e.x2, e.y2);
				const mid = midpointOnCubic(e.x1, e.y1, e.x2, e.y2);
				const label = RELATION_META[e.relation].label;
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
					d,
					fill: "none",
					stroke: "currentColor",
					className: cn("transition-colors duration-fast ease-smooth", e.onPath ? "text-fg/70" : "text-fg/28"),
					strokeWidth: e.onPath ? 1.6 : 1.15,
					strokeDasharray: dash(e.relation),
					strokeLinecap: "round"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", {
					transform: `translate(${mid.x}, ${mid.y})`,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
						x: -8,
						y: -8,
						width: 16,
						height: 16,
						rx: 8,
						className: "fill-bg"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
						textAnchor: "middle",
						dominantBaseline: "central",
						className: cn("font-display", e.onPath ? "fill-fg" : "fill-muted"),
						fontSize: 11,
						children: label
					})]
				})] }, e.id);
			}),
			dragLine ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
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
function ThoughtNode({ thought, box, thoughts, selected, dimmed, collapsed, justAdded, linkMode, dropTarget, onSelect, onEdit, onDelete, onToggleCollapse, onStartLink, onHandlePointerDown, editing, onCommitEdit, onCancelEdit }) {
	const childCount = childrenOf(thoughts, thought.id).length;
	const [draft, setDraft] = (0, import_react.useState)(thought.text);
	const [confirmDelete, setConfirmDelete] = (0, import_react.useState)(false);
	const textareaRef = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		setDraft(thought.text);
	}, [thought.text, editing]);
	(0, import_react.useEffect)(() => {
		setConfirmDelete(false);
	}, [selected, thought.id]);
	(0, import_react.useEffect)(() => {
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
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
		"data-node-id": thought.id,
		className: cn("group/node absolute origin-top", "transition-[opacity,transform] duration-fast ease-smooth", justAdded && "animate-node-in", dimmed && "opacity-35"),
		style: {
			left: box.x,
			top: box.y,
			width: box.w
		},
		children: [
			selected && !editing ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "absolute -top-9 right-0 z-20 flex items-center rounded-md bg-surface shadow-paper",
				onPointerDown: (e) => e.stopPropagation(),
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tooltip, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipTrigger, {
						asChild: true,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "ghost",
							size: "icon-sm",
							"aria-label": "编辑",
							onClick: onEdit,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, {})
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipContent, { children: "编辑 · 双击" })] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tooltip, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipTrigger, {
						asChild: true,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "ghost",
							size: "icon-sm",
							"aria-label": "连接到另一个想法",
							onClick: onStartLink,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link2, {})
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipContent, { children: "连到另一处" })] }),
					childCount > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tooltip, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipTrigger, {
						asChild: true,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "ghost",
							size: "icon-sm",
							"aria-label": collapsed ? "展开分叉" : "收起分叉",
							onClick: onToggleCollapse,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronsDownUp, {})
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipContent, { children: collapsed ? "展开" : "收起" })] }) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tooltip, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipTrigger, {
						asChild: true,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "ghost",
							size: "icon-sm",
							"aria-label": confirmDelete ? "确认删除" : "删除",
							onClick: () => {
								if (confirmDelete) onDelete();
								else setConfirmDelete(true);
							},
							className: confirmDelete ? "text-accent" : void 0,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, {})
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipContent, { children: confirmDelete ? "再点一次确认删除" : "删除这条脉络" })] })
				]
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: cn("relative rounded-lg px-4 py-3.5 text-left", "transition-[box-shadow,background-color] duration-quick ease-smooth", selected ? "bg-surface shadow-[0_0_0_1px_var(--color-fg)]" : "bg-surface/80 shadow-paper hover:shadow-paper-hover", dropTarget && "shadow-[0_0_0_1.5px_var(--color-accent)]", linkMode && "cursor-alias"),
				onPointerDown: (e) => {
					e.stopPropagation();
					onSelect();
				},
				onDoubleClick: (e) => {
					e.stopPropagation();
					onEdit();
				},
				children: [editing ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
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
					className: "font-display w-full resize-none bg-transparent text-sm leading-normal text-fg focus-visible:outline-none",
					rows: Math.min(5, Math.max(2, draft.split("\n").length)),
					"aria-label": "编辑想法"
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-display line-clamp-5 text-sm leading-normal text-fg",
					children: thought.text
				}), collapsed && childCount > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "mt-2 inline-block font-sans text-xs tabular-nums text-muted",
					children: [childCount, " 条分叉"]
				}) : null]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				"aria-label": "拖到另一个想法上，改变接续关系",
				className: cn("absolute left-1/2 z-10 size-6 -translate-x-1/2 rounded-full", "border border-border bg-surface shadow-paper", "opacity-0 transition-opacity duration-quick ease-smooth", "hover:border-fg/40 group-hover/node:opacity-100", selected && "opacity-100"),
				style: { bottom: -14 },
				onPointerDown: onHandlePointerDown,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "bg-accent mx-auto block size-1.5 rounded-full" })
			})
		]
	});
}
var MIN_SCALE = .35;
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
	const setView = useAppStore((s) => s.setView);
	const viewportRef = (0, import_react.useRef)(null);
	const [size, setSize] = (0, import_react.useState)({
		w: 0,
		h: 0
	});
	const [dragLine, setDragLine] = (0, import_react.useState)(null);
	const [hoverId, setHoverId] = (0, import_react.useState)(null);
	const [panning, setPanning] = (0, import_react.useState)(false);
	const viewRef = (0, import_react.useRef)(discussion.view);
	viewRef.current = discussion.view;
	const collapsed = (0, import_react.useMemo)(() => new Set(discussion.collapsedIds), [discussion.collapsedIds]);
	const { boxes, width, height } = (0, import_react.useMemo)(() => layoutThoughts(discussion.thoughts, collapsed), [discussion.thoughts, collapsed]);
	const boxesRef = (0, import_react.useRef)(boxes);
	boxesRef.current = boxes;
	const thoughtsRef = (0, import_react.useRef)(discussion.thoughts);
	thoughtsRef.current = discussion.thoughts;
	const selectedPath = (0, import_react.useMemo)(() => {
		const path = pathToRoot(discussion.thoughts, selectedId);
		return new Set(path.map((t) => t.id));
	}, [discussion.thoughts, selectedId]);
	(0, import_react.useEffect)(() => {
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
	const fitView = (0, import_react.useCallback)(() => {
		const el = viewportRef.current;
		if (!el) return;
		const vw = el.clientWidth;
		const vh = el.clientHeight;
		if (vw < 40 || vh < 40) return;
		const pad = 48;
		const scale = clamp((vw - 96) / Math.max(width, 1), MIN_SCALE, 1);
		const x = (vw - width * scale) / 2;
		const contentH = height * scale;
		const y = contentH + pad < vh ? Math.max(pad, (vh - contentH) / 3.2) : pad;
		setView({
			x,
			y,
			scale
		});
	}, [
		width,
		height,
		setView
	]);
	const fittedFor = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		if (size.w < 40) return;
		if (fittedFor.current === discussion.id) return;
		if (discussion.view.scale > 0) {
			fittedFor.current = discussion.id;
			return;
		}
		fitView();
		fittedFor.current = discussion.id;
	}, [
		discussion.id,
		discussion.view.scale,
		size.w,
		size.h,
		fitView
	]);
	(0, import_react.useEffect)(() => {
		fittedFor.current = null;
	}, [discussion.id]);
	(0, import_react.useEffect)(() => {
		if (fitNonce === 0) return;
		fitView();
	}, [fitNonce, fitView]);
	(0, import_react.useEffect)(() => {
		if (!justAddedId) return;
		const box = boxes[justAddedId];
		const el = viewportRef.current;
		if (!box || !el) return;
		const { x, y, scale } = viewRef.current;
		if (scale <= 0) return;
		const vw = el.clientWidth;
		const vh = el.clientHeight;
		const sx = x + (box.x + box.w / 2) * scale;
		const sy = y + (box.y + box.h) * scale;
		const marginX = 48;
		let nx = x;
		let ny = y;
		if (sx < marginX) nx += marginX - sx;
		if (sx > vw - marginX) nx -= sx - (vw - marginX);
		if (sy < 68) ny += 68 - sy;
		if (sy > vh - 24) ny -= sy - (vh - 24);
		if (nx !== x || ny !== y) setView({
			x: nx,
			y: ny,
			scale
		});
	}, [
		justAddedId,
		boxes,
		setView
	]);
	const screenToWorld = (0, import_react.useCallback)((clientX, clientY) => {
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
	const hitNode = (0, import_react.useCallback)((worldX, worldY) => {
		const map = boxesRef.current;
		for (const t of thoughtsRef.current) {
			const b = map[t.id];
			if (!b) continue;
			if (worldX >= b.x && worldX <= b.x + b.w && worldY >= b.y && worldY <= b.y + b.h) return t.id;
		}
		return null;
	}, []);
	(0, import_react.useEffect)(() => {
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
				setView({
					x: cx - wx * next,
					y: cy - wy * next,
					scale: next
				});
				return;
			}
			setView({
				x: x - e.deltaX,
				y: y - e.deltaY,
				scale: s
			});
		};
		el.addEventListener("wheel", onWheel, { passive: false });
		return () => el.removeEventListener("wheel", onWheel);
	}, [setView]);
	(0, import_react.useEffect)(() => {
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
			setView({
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
	}, [setView]);
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
			setView({
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
	const startHandleDrag = (id, e) => {
		e.stopPropagation();
		e.preventDefault();
		const box = boxes[id];
		if (!box) return;
		const x1 = box.x + box.w / 2;
		const y1 = box.y + box.h;
		const world = screenToWorld(e.clientX, e.clientY);
		setDragLine({
			fromId: id,
			x1,
			y1,
			x2: world.x,
			y2: world.y
		});
		select(id);
		const move = (ev) => {
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
			const w = screenToWorld(ev.clientX, ev.clientY);
			const target = hitNode(w.x, w.y);
			if (target && target !== id) {
				if (ev.shiftKey) addLink(id, target);
				else reparent(id, target);
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
	const { x, y, scale } = discussion.view.scale > 0 ? discussion.view : {
		x: 0,
		y: 80,
		scale: 1
	};
	const empty = discussion.thoughts.length === 0;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		ref: viewportRef,
		"data-canvas": "lilu",
		className: cn("relative min-h-0 flex-1 touch-none overflow-hidden", panning ? "cursor-grabbing" : "cursor-grab", linkMode && "cursor-alias"),
		onPointerDown: onPointerDownBg,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "absolute top-0 left-0 origin-top-left will-change-transform",
				style: {
					width,
					height,
					transform: `translate(${x}px, ${y}px) scale(${scale})`
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ThoughtEdges, {
					thoughts: discussion.thoughts,
					links: discussion.links,
					boxes,
					selectedPath,
					width,
					height,
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
					return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ThoughtNode, {
						thought: t,
						box,
						thoughts: discussion.thoughts,
						selected: selectedId === t.id,
						dimmed: Boolean(selectedId) && !onPath && !isChildOfSelected,
						collapsed: collapsed.has(t.id),
						justAdded: justAddedId === t.id,
						linkMode,
						dropTarget: hoverId === t.id && dragLine !== null,
						onSelect: () => onNodeClick(t.id),
						onEdit: () => setEditing(t.id),
						onDelete: () => deleteThought(t.id),
						onToggleCollapse: () => toggleCollapse(t.id),
						onStartLink: () => {
							select(t.id);
							setLinkMode(true);
						},
						onHandlePointerDown: (ev) => startHandleDrag(t.id, ev),
						editing: editingId === t.id,
						onCommitEdit: (text) => updateThought(t.id, text),
						onCancelEdit: () => setEditing(null)
					}, t.id);
				})]
			}),
			empty ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "pointer-events-none absolute inset-0 flex items-center justify-center px-8",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "max-w-sm text-center",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-display text-xl text-fg",
						children: "还没有形状"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 text-sm leading-normal text-muted",
						children: "从下方写下第一句。它会成为这次讨论的起点，之后每一句都接到你点选的想法上。"
					})]
				})
			}) : null,
			linkMode ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "pointer-events-none absolute top-3 left-1/2 -translate-x-1/2 rounded-md bg-fg px-3 py-1.5 text-xs text-bg",
				children: "点另一个想法，把它们连起来"
			}) : null
		]
	});
}
function FitViewButton({ className, children, ...props }) {
	const requestFit = useAppStore((s) => s.requestFit);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		className,
		onClick: requestFit,
		...props,
		children: children ?? "看全貌"
	});
}
function AppShell() {
	const discussion = useCurrentDiscussion();
	const setPanelOpen = useAppStore((s) => s.setPanelOpen);
	const newDiscussion = useAppStore((s) => s.newDiscussion);
	const renameDiscussion = useAppStore((s) => s.renameDiscussion);
	const finishHydration = useAppStore((s) => s.finishHydration);
	const [editingTitle, setEditingTitle] = (0, import_react.useState)(false);
	const [titleDraft, setTitleDraft] = (0, import_react.useState)(discussion.title);
	(0, import_react.useEffect)(() => {
		useAppStore.persist.rehydrate();
		const t = window.setTimeout(() => {
			if (!useAppStore.getState().hydrated) finishHydration();
		}, 80);
		return () => window.clearTimeout(t);
	}, [finishHydration]);
	(0, import_react.useEffect)(() => {
		setTitleDraft(discussion.title);
		setEditingTitle(false);
	}, [discussion.id, discussion.title]);
	(0, import_react.useEffect)(() => {
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
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "paper-grain flex h-dvh flex-col overflow-hidden",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "relative z-20 flex shrink-0 items-center gap-2 px-2 pt-[max(0.5rem,env(safe-area-inset-top))] pb-1 md:px-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "ghost",
						size: "icon",
						"aria-label": "打开讨论列表",
						onClick: () => setPanelOpen(true),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(List, {})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0 flex-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-display text-[0.7rem] tracking-[0.28em] text-muted",
							children: "理路"
						}), editingTitle ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
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
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "font-display block max-w-full truncate text-left text-lg leading-tight text-fg",
							onClick: () => setEditingTitle(true),
							children: discussion.title
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FitViewButton, { className: cn("hidden h-11 items-center gap-1.5 rounded-md px-3 text-sm text-muted", "hover:bg-surface-2 hover:text-fg sm:inline-flex") }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FitViewButton, {
						className: "inline-flex size-11 items-center justify-center rounded-md text-muted hover:bg-surface-2 hover:text-fg sm:hidden",
						"aria-label": "看全貌",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Expand, { className: "size-4" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "ghost",
						size: "icon",
						"aria-label": "新的讨论",
						onClick: newDiscussion,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, {})
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ThoughtCanvas, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Composer, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SessionPanel, {})
		]
	});
}
function Home() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipProvider, {
		delayDuration: 400,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, {})
	});
}
//#endregion
export { Home as component };
