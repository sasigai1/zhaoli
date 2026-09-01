import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { appendFromEntry, createBlankSession } from "./heuristic";
import { SAMPLE_SESSION } from "./sample";
import type { Session } from "./types";
import { uid } from "./utils";

interface LiluState {
  sessions: Session[];
  activeId: string;
  selectedNodeId: string | null;
  organizing: boolean;
  organizeError: string | null;
  justAddedIds: string[];
  setSelected: (id: string | null) => void;
  newSession: () => void;
  openSession: (id: string) => void;
  deleteSession: (id: string) => void;
  renameSession: (title: string) => void;
  addUtterance: (text: string) => { session: Session; newNodeIds: string[] } | null;
  applyOrganize: (patch: Pick<Session, "title" | "spine" | "nodes" | "edges">) => void;
  setOrganizing: (value: boolean, error?: string | null) => void;
  clearJustAdded: () => void;
}

function ensureSessions(sessions: Session[], activeId: string): { sessions: Session[]; activeId: string } {
  if (sessions.length === 0) {
    return { sessions: [SAMPLE_SESSION], activeId: SAMPLE_SESSION.id };
  }
  if (!sessions.some((s) => s.id === activeId)) {
    return { sessions, activeId: sessions[0].id };
  }
  return { sessions, activeId };
}

export const useLilu = create<LiluState>()(
  persist(
    (set, get) => ({
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
          justAddedIds: [],
        }));
      },
      openSession: (id) => {
        if (!get().sessions.some((s) => s.id === id)) return;
        set({ activeId: id, selectedNodeId: null, organizeError: null });
      },
      deleteSession: (id) => {
        set((state) => {
          const remaining = state.sessions.filter((s) => s.id !== id);
          const next = remaining.length > 0 ? remaining : [createBlankSession()];
          const activeId = state.activeId === id ? next[0].id : state.activeId;
          return {
            sessions: next,
            activeId,
            selectedNodeId: null,
          };
        });
      },
      renameSession: (title) => {
        const trimmed = title.trim().slice(0, 24);
        if (!trimmed) return;
        set((state) => ({
          sessions: state.sessions.map((s) =>
            s.id === state.activeId ? { ...s, title: trimmed, updatedAt: Date.now() } : s,
          ),
        }));
      },
      addUtterance: (text) => {
        const trimmed = text.replace(/\s+/g, " ").trim();
        if (!trimmed) return null;
        const entry = { id: uid("e"), text: trimmed.slice(0, 2000), createdAt: Date.now() };
        let result: { session: Session; newNodeIds: string[] } | null = null;
        set((state) => {
          const current = state.sessions.find((s) => s.id === state.activeId);
          if (!current) return state;
          const before = new Set(current.nodes.map((n) => n.id));
          const session = appendFromEntry(current, entry);
          const newNodeIds = session.nodes.filter((n) => !before.has(n.id)).map((n) => n.id);
          result = { session, newNodeIds };
          return {
            sessions: state.sessions.map((s) => (s.id === session.id ? session : s)),
            justAddedIds: newNodeIds,
            organizeError: null,
            selectedNodeId: newNodeIds.at(-1) ?? state.selectedNodeId,
          };
        });
        return result;
      },
      applyOrganize: (patch) => {
        set((state) => ({
          sessions: state.sessions.map((s) =>
            s.id === state.activeId
              ? {
                  ...s,
                  title: patch.title || s.title,
                  spine: patch.spine || s.spine,
                  nodes: patch.nodes,
                  edges: patch.edges,
                  updatedAt: Date.now(),
                }
              : s,
          ),
          organizing: false,
          organizeError: null,
        }));
      },
      setOrganizing: (value, error = null) => set({ organizing: value, organizeError: error }),
      clearJustAdded: () => set({ justAddedIds: [] }),
    }),
    {
      name: "lilu-sessions-v1",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        sessions: state.sessions,
        activeId: state.activeId,
      }),
      skipHydration: true,
      merge: (persisted, current) => {
        const p = persisted as { sessions?: Session[]; activeId?: string } | undefined;
        const ensured = ensureSessions(p?.sessions ?? current.sessions, p?.activeId ?? current.activeId);
        return { ...current, ...ensured };
      },
    },
  ),
);

export function activeSession(state: LiluState): Session | undefined {
  return state.sessions.find((s) => s.id === state.activeId);
}
