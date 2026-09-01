import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { addMonths, format, parseISO } from "date-fns";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { FieldBox, Input } from "@/components/ui/field";
import { cn } from "@/lib/utils";
import {
  cellKind,
  completeness,
  fileId,
  filledItems,
  formatDisplayDate,
  glyphCount,
  localIsoDate,
  monthCells,
  padCount,
  weekStarts,
  type CellKind,
} from "@/lib/folio/schema";
import { useLedger } from "@/lib/folio/store";

const KIND_LABEL: Record<CellKind, string> = {
  empty: "未填",
  draft: "草稿",
  filed: "已归档",
  future: "未开始",
};

export function ArchiveView() {
  const today = localIsoDate();
  const records = useLedger((s) => s.records);
  const todayDate = parseISO(today);
  const [cursor, setCursor] = useState(() => new Date(todayDate.getFullYear(), todayDate.getMonth(), 1));
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "filed" | "draft" | "gap">("all");

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const cells = useMemo(() => monthCells(year, month), [year, month]);
  const canNext = year < todayDate.getFullYear() || month < todayDate.getMonth();

  const monthIds = cells.filter((c): c is string => c !== null && c <= today);
  const filedCount = monthIds.filter((id) => records[id]?.status === "filed").length;

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return Object.values(records)
      .filter((r) => {
        if (filter === "filed") return r.status === "filed";
        if (filter === "draft") return r.status === "draft" && completeness(r).done > 0;
        if (filter === "gap") return r.status !== "filed";
        return completeness(r).done > 0 || r.status === "filed";
      })
      .filter((r) => {
        if (!q) return true;
        const blob = `${r.summary} ${r.body} ${r.items.join(" ")} ${r.tags.join(" ")} ${r.id}`.toLowerCase();
        return blob.includes(q);
      })
      .sort((a, b) => b.id.localeCompare(a.id));
  }, [records, query, filter]);

  return (
    <div className="px-5 pb-8 pt-4">
      <div className="flex items-center justify-between">
        <button
          type="button"
          className="flex size-11 items-center justify-center"
          onClick={() => setCursor((d) => addMonths(d, -1))}
          aria-label="上月"
        >
          <ChevronLeft className="size-5" />
        </button>
        <div className="text-center">
          <p className="font-mono text-[10px] tracking-[0.18em] text-faint">INDEX</p>
          <h1 className="font-mono text-xl font-medium tabular-nums tracking-tight">
            {format(cursor, "yyyy.MM")}
          </h1>
        </div>
        {canNext ? (
          <button
            type="button"
            className="flex size-11 items-center justify-center"
            onClick={() => setCursor((d) => addMonths(d, 1))}
            aria-label="下月"
          >
            <ChevronRight className="size-5" />
          </button>
        ) : (
          <span className="flex size-11 items-center justify-center text-rule" aria-hidden>
            <ChevronRight className="size-5" />
          </span>
        )}
      </div>

      <div className="mt-3 flex items-baseline justify-between border-b border-rule pb-3">
        <p className="text-sm text-muted">本月归档</p>
        <p className="font-mono text-sm tabular-nums">
          {padCount(filedCount, 2)} / {padCount(monthIds.length, 2)}
        </p>
      </div>

      <div className="mt-4 grid grid-cols-7 gap-1">
        {weekStarts().map((d) => (
          <div key={d} className="pb-1 text-center font-mono text-[10px] tracking-widest text-faint">
            {d}
          </div>
        ))}
        {cells.map((id, i) => {
          if (!id) {
            return <div key={`e-${i}`} className="aspect-square" />;
          }
          const kind = cellKind(id, records, today);
          const isToday = id === today;
          const className = cn(
            "relative flex aspect-square items-center justify-center font-mono text-xs tabular-nums",
            kind === "filed" && "bg-ink text-paper",
            kind === "draft" && "bg-stamp-soft text-ink",
            kind === "empty" && "text-ink shadow-border",
            kind === "future" && "text-rule",
            isToday && kind !== "filed" && "shadow-[0_0_0_1px_var(--color-ink)]",
          );
          if (kind === "future") {
            return (
              <span key={id} className={className} aria-label={`${formatDisplayDate(id)} 未开始`}>
                {Number(id.slice(8))}
              </span>
            );
          }
          return (
            <Link
              key={id}
              to="/d/$date"
              params={{ date: id }}
              aria-label={`${formatDisplayDate(id)} ${KIND_LABEL[kind]}`}
              className={className}
            >
              {Number(id.slice(8))}
            </Link>
          );
        })}
      </div>

      <div className="mt-3 flex items-center gap-3 font-mono text-[10px] tracking-wide text-faint">
        <span className="flex items-center gap-1.5">
          <i className="inline-block size-2 bg-ink" /> 已归档
        </span>
        <span className="flex items-center gap-1.5">
          <i className="inline-block size-2 bg-stamp-soft" /> 草稿
        </span>
        <span className="flex items-center gap-1.5">
          <i className="inline-block size-2 shadow-border" /> 未填
        </span>
      </div>

      <FieldBox className="mt-6 flex items-center gap-2">
        <Search className="size-4 shrink-0 text-faint" aria-hidden />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="检索摘要、正文、标记"
          aria-label="检索"
          className="w-auto min-w-0 flex-1"
        />
      </FieldBox>

      <div className="mt-3 flex gap-1">
        {(
          [
            ["all", "全部"],
            ["filed", "已归档"],
            ["draft", "草稿"],
            ["gap", "缺口"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setFilter(id)}
            className={cn(
              "h-10 px-3 text-xs transition-[background-color,color] duration-150 ease-out",
              filter === id ? "bg-ink text-paper" : "text-muted shadow-border",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <ul className="mt-4 border-t border-rule">
        {list.length === 0 ? (
          <li className="py-10 text-center">
            <p className="font-mono text-xs tracking-[0.18em] text-faint">EMPTY</p>
            <p className="mt-2 text-sm text-muted">索引中没有符合条件的记录。</p>
          </li>
        ) : (
          list.map((r) => {
            const words = glyphCount(r.body);
            const items = filledItems(r.items).length;
            return (
              <li key={r.id} className="border-b border-rule">
                <Link to="/d/$date" params={{ date: r.id }} className="block py-3">
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="font-mono text-[11px] tabular-nums tracking-wide text-faint">
                      {fileId(r.id)}
                    </span>
                    <span
                      className={cn(
                        "font-mono text-[10px] tracking-[0.14em]",
                        r.status === "filed" ? "text-stamp" : "text-muted",
                      )}
                    >
                      {r.status === "filed" ? "FILED" : "DRAFT"}
                    </span>
                  </div>
                  <p className="mt-1 text-sm font-medium leading-snug">
                    {r.summary || "（无摘要）"}
                  </p>
                  <p className="mt-1 font-mono text-[11px] tabular-nums text-faint">
                    {formatDisplayDate(r.id)} · {padCount(words)} 字 · {items} 事项
                    {r.tags.length ? ` · ${r.tags.join(" / ")}` : ""}
                  </p>
                </Link>
              </li>
            );
          })
        )}
      </ul>
    </div>
  );
}
