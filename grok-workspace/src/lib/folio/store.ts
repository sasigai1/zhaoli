import { create } from "zustand";
import {
  DayRecord,
  DayRecordSchema,
  LedgerFileSchema,
  buildSeed,
  completeness,
  emptyRecord,
  localIsoDate,
  normalizeRecord,
} from "./schema";

const STORAGE_KEY = "folio-ledger-v1";

type Persisted = {
  records: Record<string, DayRecord>;
  onboarded: boolean;
  initialized: boolean;
};

type LedgerState = Persisted & {
  patch: (id: string, partial: Partial<DayRecord>) => void;
  file: (id: string) => boolean;
  reopen: (id: string) => void;
  voidDay: (id: string) => void;
  completeOnboarding: () => void;
  replaceAll: (records: Record<string, DayRecord>) => void;
};

function coerceRecords(raw: unknown): Record<string, DayRecord> {
  if (!raw || typeof raw !== "object") return {};
  const out: Record<string, DayRecord> = {};
  for (const value of Object.values(raw as Record<string, unknown>)) {
    const parsed = DayRecordSchema.safeParse(value);
    if (parsed.success) out[parsed.data.id] = parsed.data;
  }
  return out;
}

function readStorage(): Persisted | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    const rec = parsed as Record<string, unknown>;
    return {
      records: coerceRecords(rec.records),
      onboarded: Boolean(rec.onboarded),
      initialized: Boolean(rec.initialized),
    };
  } catch {
    return null;
  }
}

function writeStorage(state: Persisted) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        records: state.records,
        onboarded: state.onboarded,
        initialized: state.initialized,
      }),
    );
  } catch {
    /* quota */
  }
}

export const useLedger = create<LedgerState>((set, get) => ({
  records: {},
  onboarded: false,
  initialized: false,
  patch: (id, partial) => {
    const current = get().records[id] ?? emptyRecord(id);
    if (current.status === "filed") return;
    const next: DayRecord = {
      ...current,
      ...partial,
      id,
      status: "draft",
      updatedAt: new Date().toISOString(),
    };
    set((s) => ({ records: { ...s.records, [id]: next } }));
  },
  file: (id) => {
    const current = get().records[id] ?? emptyRecord(id);
    const normalized = normalizeRecord(current);
    if (!completeness(normalized).ready) return false;
    const now = new Date().toISOString();
    const next: DayRecord = {
      ...normalized,
      status: "filed",
      updatedAt: now,
      filedAt: now,
    };
    set((s) => ({ records: { ...s.records, [id]: next } }));
    return true;
  },
  reopen: (id) => {
    const current = get().records[id];
    if (!current || current.status !== "filed") return;
    set((s) => ({
      records: {
        ...s.records,
        [id]: {
          ...current,
          status: "draft",
          filedAt: null,
          updatedAt: new Date().toISOString(),
        },
      },
    }));
  },
  voidDay: (id) => {
    set((s) => {
      const next = { ...s.records };
      delete next[id];
      return { records: next };
    });
  },
  completeOnboarding: () => set({ onboarded: true }),
  replaceAll: (records) => set({ records, initialized: true }),
}));

if (typeof window !== "undefined") {
  useLedger.subscribe((state) => {
    if (!state.initialized) return;
    writeStorage({
      records: state.records,
      onboarded: state.onboarded,
      initialized: state.initialized,
    });
  });
}

export function hydrateLedger() {
  const stored = readStorage();
  if (stored?.initialized) {
    useLedger.setState({
      records: stored.records,
      onboarded: stored.onboarded,
      initialized: true,
    });
    return;
  }
  useLedger.setState({
    records: buildSeed(new Date()),
    onboarded: stored?.onboarded ?? false,
    initialized: true,
  });
}

export function parseImportedLedger(raw: unknown): Record<string, DayRecord> | null {
  const parsed = LedgerFileSchema.safeParse(raw);
  if (parsed.success) {
    const records: Record<string, DayRecord> = {};
    for (const rec of parsed.data.records) records[rec.id] = rec;
    return records;
  }
  if (Array.isArray(raw)) {
    const records: Record<string, DayRecord> = {};
    for (const item of raw) {
      const r = DayRecordSchema.safeParse(item);
      if (r.success) records[r.data.id] = r.data;
    }
    return Object.keys(records).length ? records : null;
  }
  return null;
}

export function exportPayload(records: Record<string, DayRecord>) {
  return {
    version: 1 as const,
    exportedAt: new Date().toISOString(),
    records: Object.values(records).sort((a, b) => a.id.localeCompare(b.id)),
  };
}

export { localIsoDate };
