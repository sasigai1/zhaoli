import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import {
  adjacentThought,
  descendantIds,
  isDescendant,
  pathToRoot,
  type NavDir,
} from "./layout";
import { createBlankDiscussion, createSampleDiscussion } from "./sample";
import type { Discussion, ExtraLink, Relation, Thought, ViewState } from "./types";
import { RELATIONS } from "./types";
import { uid } from "./utils";

const sample = createSampleDiscussion();

type AppState = {
  discussions: Discussion[];
  currentId: string;
  selectedId: string | null;
  editingId: string | null;
  linkMode: boolean;
  composerText: string;
  relation: Relation;
  panelOpen: boolean;
  hydrated: boolean;
  justAddedId: string | null;
  fitNonce: number;

  current: () => Discussion;
  setComposerText: (text: string) => void;
  setRelation: (relation: Relation) => void;
  cycleRelation: (delta: number) => void;
  select: (id: string | null) => void;
  setEditing: (id: string | null) => void;
  setLinkMode: (on: boolean) => void;
  setPanelOpen: (open: boolean) => void;
  addThought: () => string | null;
  updateThought: (id: string, text: string) => void;
  deleteThought: (id: string) => void;
  reparent: (id: string, parentId: string | null, relation?: Relation) => void;
  addLink: (fromId: string, toId: string, relation?: Relation) => void;
  removeLink: (id: string) => void;
  toggleCollapse: (id: string) => void;
  setView: (view: ViewState) => void;
  requestFit: () => void;
  navigate: (dir: NavDir) => void;
  newDiscussion: () => void;
  switchDiscussion: (id: string) => void;
  renameDiscussion: (id: string, title: string) => void;
  deleteDiscussion: (id: string) => void;
  finishHydration: () => void;
};

function patchCurrent(
  discussions: Discussion[],
  currentId: string,
  patch: (d: Discussion) => Discussion,
): Discussion[] {
  return discussions.map((d) =>
    d.id === currentId ? patch({ ...d, updatedAt: Date.now() }) : d,
  );
}

function lastThoughtId(d: Discussion): string | null {
  if (d.thoughts.length === 0) return null;
  return d.thoughts.reduce((a, b) => (a.createdAt >= b.createdAt ? a : b)).id;
}

function noopStorage() {
  return {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
  };
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
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
        return discussions.find((d) => d.id === currentId) ?? discussions[0]!;
      },

      setComposerText: (text) => set({ composerText: text }),
      setRelation: (relation) => set({ relation }),
      cycleRelation: (delta) => {
        const { relation } = get();
        const i = RELATIONS.indexOf(relation);
        const next = RELATIONS[(i + delta + RELATIONS.length) % RELATIONS.length]!;
        set({ relation: next });
      },
      select: (id) => set({ selectedId: id, linkMode: false, editingId: null }),
      setEditing: (id) => set({ editingId: id, linkMode: false }),
      setLinkMode: (on) => set({ linkMode: on }),
      setPanelOpen: (open) => set({ panelOpen: open }),
      requestFit: () => set((s) => ({ fitNonce: s.fitNonce + 1 })),

      navigate: (dir) => {
        const s = get();
        const next = adjacentThought(s.current().thoughts, s.selectedId, dir);
        if (!next) return;
        set({ selectedId: next, linkMode: false, editingId: null });
      },

      addThought: () => {
        const text = get().composerText.trim();
        if (!text) return null;
        const id = uid();
        const { currentId, selectedId, relation } = get();
        const now = Date.now();

        set((s) => {
          const cur =
            s.discussions.find((d) => d.id === currentId) ?? s.discussions[0]!;
          const parentExists =
            selectedId !== null && cur.thoughts.some((t) => t.id === selectedId);
          const parentId = parentExists ? selectedId : null;
          const thought: Thought = {
            id,
            text,
            parentId,
            relation: parentId ? relation : "continue",
            createdAt: now,
          };
          const untitled = cur.title === "新的讨论" || cur.title === "未命名";
          const title =
            untitled && cur.thoughts.length === 0
              ? text.replace(/\s+/g, " ").slice(0, 16)
              : cur.title;
          const collapsedIds = parentId
            ? cur.collapsedIds.filter((c) => c !== parentId)
            : cur.collapsedIds;

          return {
            composerText: "",
            selectedId: id,
            justAddedId: id,
            discussions: patchCurrent(s.discussions, cur.id, (d) => ({
              ...d,
              title,
              thoughts: [...d.thoughts, thought],
              collapsedIds,
            })),
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
            thoughts: d.thoughts.map((t) =>
              t.id === id ? { ...t, text: trimmed } : t,
            ),
          })),
        }));
      },

      deleteThought: (id) => {
        set((s) => {
          const cur =
            s.discussions.find((d) => d.id === s.currentId) ?? s.discussions[0]!;
          const removed = new Set(descendantIds(cur.thoughts, id));
          removed.add(id);
          const parentId =
            cur.thoughts.find((t) => t.id === id)?.parentId ?? null;
          const thoughts = cur.thoughts.filter((t) => !removed.has(t.id));
          const links = cur.links.filter(
            (l) => !removed.has(l.fromId) && !removed.has(l.toId),
          );
          const nextSelected =
            s.selectedId && removed.has(s.selectedId)
              ? parentId
              : s.selectedId;
          return {
            selectedId: nextSelected,
            editingId:
              s.editingId && removed.has(s.editingId) ? null : s.editingId,
            discussions: patchCurrent(s.discussions, s.currentId, (d) => ({
              ...d,
              thoughts,
              links,
              collapsedIds: d.collapsedIds.filter((c) => !removed.has(c)),
            })),
          };
        });
      },

      reparent: (id, parentId, relation) => {
        set((s) => {
          const cur =
            s.discussions.find((d) => d.id === s.currentId) ?? s.discussions[0]!;
          if (parentId === id) return s;
          if (parentId && isDescendant(cur.thoughts, id, parentId)) return s;
          if (parentId && !cur.thoughts.some((t) => t.id === parentId)) return s;
          return {
            discussions: patchCurrent(s.discussions, s.currentId, (d) => ({
              ...d,
              thoughts: d.thoughts.map((t) =>
                t.id === id
                  ? {
                      ...t,
                      parentId,
                      relation: relation ?? t.relation,
                    }
                  : t,
              ),
              collapsedIds: parentId
                ? d.collapsedIds.filter((c) => c !== parentId)
                : d.collapsedIds,
            })),
          };
        });
      },

      addLink: (fromId, toId, relation) => {
        if (fromId === toId) return;
        set((s) => {
          const cur =
            s.discussions.find((d) => d.id === s.currentId) ?? s.discussions[0]!;
          const exists = cur.links.some(
            (l) =>
              (l.fromId === fromId && l.toId === toId) ||
              (l.fromId === toId && l.toId === fromId),
          );
          const treeExists = cur.thoughts.some(
            (t) =>
              (t.id === toId && t.parentId === fromId) ||
              (t.id === fromId && t.parentId === toId),
          );
          if (exists || treeExists) return { linkMode: false };
          const link: ExtraLink = {
            id: uid(),
            fromId,
            toId,
            relation: relation ?? s.relation,
          };
          return {
            linkMode: false,
            discussions: patchCurrent(s.discussions, s.currentId, (d) => ({
              ...d,
              links: [...d.links, link],
            })),
          };
        });
      },

      removeLink: (id) => {
        set((s) => ({
          discussions: patchCurrent(s.discussions, s.currentId, (d) => ({
            ...d,
            links: d.links.filter((l) => l.id !== id),
          })),
        }));
      },

      toggleCollapse: (id) => {
        set((s) => ({
          discussions: patchCurrent(s.discussions, s.currentId, (d) => {
            const has = d.collapsedIds.includes(id);
            return {
              ...d,
              collapsedIds: has
                ? d.collapsedIds.filter((c) => c !== id)
                : [...d.collapsedIds, id],
            };
          }),
        }));
      },

      setView: (view) => {
        set((s) => ({
          discussions: s.discussions.map((d) =>
            d.id === s.currentId ? { ...d, view } : d,
          ),
        }));
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
          panelOpen: false,
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
          panelOpen: false,
        });
      },

      renameDiscussion: (id, title) => {
        const next = title.trim() || "未命名";
        set((s) => ({
          discussions: s.discussions.map((d) =>
            d.id === id ? { ...d, title: next, updatedAt: Date.now() } : d,
          ),
        }));
      },

      deleteDiscussion: (id) => {
        set((s) => {
          let discussions = s.discussions.filter((d) => d.id !== id);
          if (discussions.length === 0) {
            discussions = [createBlankDiscussion()];
          }
          const currentId =
            s.currentId === id ? discussions[0]!.id : s.currentId;
          const cur = discussions.find((d) => d.id === currentId)!;
          return {
            discussions,
            currentId,
            selectedId: lastThoughtId(cur),
            editingId: null,
            panelOpen: discussions.length > 0 && s.panelOpen,
          };
        });
      },

      finishHydration: () => {
        set((s) => {
          const discussions =
            s.discussions.length > 0 ? s.discussions : [createSampleDiscussion()];
          const current =
            discussions.find((d) => d.id === s.currentId) ?? discussions[0]!;
          return {
            discussions,
            currentId: current.id,
            selectedId: s.selectedId ?? lastThoughtId(current),
            hydrated: true,
          };
        });
      },
    }),
    {
      name: "lilu-v1",
      skipHydration: true,
      storage: createJSONStorage(() =>
        typeof window === "undefined" ? noopStorage() : localStorage,
      ),
      partialize: (s) => ({
        discussions: s.discussions,
        currentId: s.currentId,
      }),
      onRehydrateStorage: () => (state) => {
        state?.finishHydration();
      },
    },
  ),
);

export function useCurrentDiscussion(): Discussion {
  return useAppStore((s) => {
    return s.discussions.find((d) => d.id === s.currentId) ?? s.discussions[0]!;
  });
}

export function useSelectedPath(): Thought[] {
  const discussion = useCurrentDiscussion();
  const selectedId = useAppStore((s) => s.selectedId);
  return pathToRoot(discussion.thoughts, selectedId);
}
