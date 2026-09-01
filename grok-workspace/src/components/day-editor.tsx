import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { addDays, parseISO } from "date-fns";
import { ChevronLeft, ChevronRight, Lock, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FieldBox, Input, Textarea } from "@/components/ui/field";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { cn } from "@/lib/utils";
import {
  BODY_MIN,
  DENSITIES,
  ITEMS_MAX,
  MOODS,
  SECTIONS,
  SUMMARY_MAX,
  SUMMARY_MIN,
  TAGS,
  completeness,
  dayOfYearLabel,
  fileId,
  filledItems,
  formatChineseDate,
  formatDisplayDate,
  formatStampTime,
  formatWeekdayEn,
  glyphCount,
  isFutureDate,
  localIsoDate,
  padCount,
  parseDate,
  sectionState,
  unfiledGaps,
  type DayRecord,
  type Scale,
} from "@/lib/folio/schema";
import { useLedger } from "@/lib/folio/store";

function useComposing() {
  const composing = useRef(false);
  return {
    composing,
    onCompositionStart: () => {
      composing.current = true;
    },
    onCompositionEnd: () => {
      composing.current = false;
    },
  };
}

function SectionHead({
  no,
  label,
  en,
  done,
  meta,
}: {
  no: string;
  label: string;
  en: string;
  done: boolean;
  meta?: string;
}) {
  return (
    <div className="flex items-end justify-between gap-3">
      <div className="flex items-baseline gap-2">
        <span className="font-mono text-xs tabular-nums text-faint">{no}</span>
        <h2 className="text-sm font-medium">{label}</h2>
        <span className="font-mono text-[10px] tracking-[0.16em] text-faint">{en}</span>
      </div>
      <div className="flex items-center gap-2">
        {meta ? <span className="font-mono text-[11px] tabular-nums text-muted">{meta}</span> : null}
        <span
          className={cn(
            "size-1.5 rounded-full",
            done ? "bg-ink" : "bg-rule",
          )}
          aria-hidden
        />
      </div>
    </div>
  );
}

function ScaleRow({
  name,
  value,
  options,
  disabled,
  onChange,
}: {
  name: string;
  value: Scale | null;
  options: readonly { value: Scale; label: string; en: string }[];
  disabled: boolean;
  onChange: (v: Scale) => void;
}) {
  return (
    <div>
      <p className="mb-2 font-mono text-[10px] tracking-[0.16em] text-faint">{name}</p>
      <div className="grid grid-cols-5 gap-1.5">
        {options.map((opt) => {
          const active = value === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              disabled={disabled}
              onClick={() => onChange(opt.value)}
              className={cn(
                "flex h-14 flex-col items-center justify-center rounded-sm transition-[background-color,color,box-shadow] duration-150 ease-out",
                active ? "bg-ink text-paper" : "text-ink shadow-border",
                disabled && "opacity-60",
              )}
            >
              <span className="font-mono text-sm tabular-nums">{opt.value}</span>
              <span className="mt-0.5 text-[10px]">{opt.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function DayEditor({ date }: { date: string }) {
  const today = localIsoDate();
  const records = useLedger((s) => s.records);
  const rec = records[date] ?? {
    id: date,
    status: "draft" as const,
    summary: "",
    items: [""],
    body: "",
    mood: null,
    density: null,
    tags: [],
    updatedAt: null,
    filedAt: null,
  };
  const patch = useLedger((s) => s.patch);
  const file = useLedger((s) => s.file);
  const reopen = useLedger((s) => s.reopen);
  const voidDay = useLedger((s) => s.voidDay);

  const locked = rec.status === "filed";
  const future = isFutureDate(date, today);
  const parsed = parseDate(date);
  const invalid = !parsed;
  const state = sectionState(rec);
  const complete = completeness(rec);
  const glyphSummary = glyphCount(rec.summary);
  const glyphBody = glyphCount(rec.body);
  const itemCount = filledItems(rec.items).length;
  const composing = useComposing();

  const [confirm, setConfirm] = useState<"file" | "reopen" | "void" | null>(null);
  const [filedFlash, setFiledFlash] = useState(false);

  const prev = parsed ? localIsoDate(addDays(parsed, -1)) : null;
  const next = parsed ? localIsoDate(addDays(parsed, 1)) : null;
  const nextDisabled = !next || next > today;

  const monthStart = date.slice(0, 8) + "01";
  const gaps = useMemo(
    () => (date === today ? unfiledGaps(records, monthStart, today).filter((d) => d !== today) : []),
    [records, date, today, monthStart],
  );

  useEffect(() => {
    if (!locked) setFiledFlash(false);
  }, [locked]);

  if (invalid) {
    return (
      <div className="px-5 py-10">
        <p className="font-mono text-xs tracking-[0.18em] text-faint">ERROR</p>
        <h1 className="mt-2 text-xl font-medium">日期无法识别</h1>
        <p className="mt-2 text-sm text-muted">卷宗编号必须为 YYYY-MM-DD。</p>
        <Link to="/" className="mt-6 inline-flex h-11 items-center text-sm font-medium underline-offset-4">
          返回本日
        </Link>
      </div>
    );
  }

  const applySummary = (value: string) => {
    if (composing.composing.current) {
      patch(date, { summary: value });
      return;
    }
    patch(date, { summary: Array.from(value).slice(0, SUMMARY_MAX).join("") });
  };

  const setItem = (index: number, value: string) => {
    const items = [...rec.items];
    items[index] = value;
    patch(date, { items });
  };

  const addItem = () => {
    if (rec.items.length >= ITEMS_MAX) return;
    patch(date, { items: [...rec.items, ""] });
  };

  const removeItem = (index: number) => {
    const items = rec.items.filter((_, i) => i !== index);
    patch(date, { items: items.length ? items : [""] });
  };

  const toggleTag = (tag: string) => {
    const tags = rec.tags.includes(tag) ? rec.tags.filter((t) => t !== tag) : [...rec.tags, tag];
    patch(date, { tags });
  };

  const onFile = () => {
    if (file(date)) {
      setFiledFlash(true);
      setConfirm(null);
    }
  };

  return (
    <div className="px-5 pb-8 pt-4">
      <div className="flex items-center justify-between">
        <Link
          to="/d/$date"
          params={{ date: prev ?? date }}
          className="flex size-11 items-center justify-center text-ink"
          aria-label="前一日"
        >
          <ChevronLeft className="size-5" />
        </Link>
        <div className="text-center">
          <p className="font-mono text-[11px] tabular-nums tracking-[0.14em] text-faint">
            {fileId(date)}
          </p>
          <h1 className="mt-0.5 font-mono text-xl font-medium tabular-nums tracking-tight">
            {formatDisplayDate(date)}
          </h1>
          <p className="mt-0.5 text-xs text-muted">
            {formatWeekdayEn(date)} · {formatChineseDate(date)}
          </p>
        </div>
        {nextDisabled ? (
          <span className="flex size-11 items-center justify-center text-rule" aria-hidden>
            <ChevronRight className="size-5" />
          </span>
        ) : (
          <Link
            to="/d/$date"
            params={{ date: next ?? date }}
            className="flex size-11 items-center justify-center text-ink"
            aria-label="后一日"
          >
            <ChevronRight className="size-5" />
          </Link>
        )}
      </div>

      <div className="mt-4 grid grid-cols-3 gap-px border border-rule bg-rule text-center">
        <MetaCell label="STATUS" value={locked ? "FILED" : future ? "LOCKED" : "DRAFT"} />
        <MetaCell label="COMPLETE" value={`${padCount(complete.done, 2)} / ${padCount(complete.total, 2)}`} />
        <MetaCell label="CYCLE" value={dayOfYearLabel(date)} />
      </div>

      <div className="mt-3 flex gap-1" aria-hidden>
        {SECTIONS.map((s) => (
          <div
            key={s.key}
            className={cn("h-1 flex-1", state[s.key] ? "bg-ink" : "bg-rule")}
            title={`${s.no} ${s.label}`}
          />
        ))}
      </div>

      {gaps.length > 0 ? (
        <div className="mt-4 border border-dashed border-rule px-3 py-2.5">
          <div className="flex items-center justify-between">
            <p className="font-mono text-[10px] tracking-[0.16em] text-faint">GAP · 本月缺口</p>
            <span className="font-mono text-[11px] tabular-nums text-muted">
              {padCount(gaps.length, 2)}
            </span>
          </div>
          <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
            {gaps.slice(0, 6).map((g) => (
              <Link
                key={g}
                to="/d/$date"
                params={{ date: g }}
                className="font-mono text-xs tabular-nums text-stamp"
              >
                {formatDisplayDate(g)}
              </Link>
            ))}
            {gaps.length > 6 ? (
              <Link to="/archive" className="font-mono text-xs text-muted">
                其余 {gaps.length - 6}
              </Link>
            ) : null}
          </div>
        </div>
      ) : null}

      {future ? (
        <div className="mt-8 border border-rule px-4 py-8 text-center">
          <p className="font-mono text-xs tracking-[0.18em] text-faint">NOT OPEN</p>
          <p className="mt-2 text-sm text-muted">该日尚未开始，不可预填。</p>
        </div>
      ) : (
        <form
          className="mt-6 flex flex-col gap-7"
          onSubmit={(e) => {
            e.preventDefault();
            if (complete.ready && !locked) setConfirm("file");
          }}
        >
          <section>
            <SectionHead
              no="01"
              label="摘要"
              en="SUMMARY"
              done={state.summary}
              meta={`${padCount(glyphSummary, 2)} / ${SUMMARY_MAX}`}
            />
            <FieldBox className="mt-2">
              <Input
                value={rec.summary}
                disabled={locked}
                placeholder="本日一句话，八至四十八字"
                maxLength={SUMMARY_MAX * 2}
                onCompositionStart={composing.onCompositionStart}
                onCompositionEnd={(e) => {
                  composing.onCompositionEnd();
                  applySummary(e.currentTarget.value);
                }}
                onChange={(e) => applySummary(e.target.value)}
                aria-label="摘要"
              />
            </FieldBox>
            {rec.summary && glyphSummary < SUMMARY_MIN ? (
              <p className="mt-1.5 font-mono text-[10px] text-stamp">
                尚欠 {SUMMARY_MIN - glyphSummary} 字
              </p>
            ) : null}
          </section>

          <section>
            <SectionHead
              no="02"
              label="事项"
              en="AGENDA"
              done={state.agenda}
              meta={`${padCount(itemCount, 1)} / ${ITEMS_MAX}`}
            />
            <ul className="mt-2 flex flex-col gap-2">
              {rec.items.map((item, i) => (
                <li key={i} className="flex items-center gap-2">
                  <span className="w-6 font-mono text-xs tabular-nums text-faint">
                    {padCount(i + 1, 2)}
                  </span>
                  <FieldBox className="flex-1 py-2">
                    <Input
                      value={item}
                      disabled={locked}
                      placeholder="一项即可，一句一事"
                      onChange={(e) => setItem(i, e.target.value)}
                      aria-label={`事项 ${i + 1}`}
                    />
                  </FieldBox>
                  {!locked ? (
                    <button
                      type="button"
                      className="relative flex size-11 items-center justify-center text-faint"
                      onClick={() => removeItem(i)}
                      aria-label="删除事项"
                    >
                      <X className="size-4" />
                    </button>
                  ) : (
                    <span className="size-11" />
                  )}
                </li>
              ))}
            </ul>
            {!locked && rec.items.length < ITEMS_MAX ? (
              <button
                type="button"
                onClick={addItem}
                className="mt-2 flex h-11 items-center gap-2 pl-8 text-sm text-muted"
              >
                <Plus className="size-4" />
                添加事项
              </button>
            ) : null}
          </section>

          <section>
            <SectionHead
              no="03"
              label="正文"
              en="LOG"
              done={state.body}
              meta={`${padCount(glyphBody)} 字`}
            />
            <FieldBox className="mt-2 px-0 py-0">
              <Textarea
                value={rec.body}
                disabled={locked}
                placeholder="写下今天。事实优先，不写给别人看。"
                rows={8}
                className="folio-ruled min-h-52 px-3 py-2"
                onChange={(e) => patch(date, { body: e.target.value })}
                aria-label="正文"
              />
            </FieldBox>
            {rec.body && glyphBody < BODY_MIN ? (
              <p className="mt-1.5 font-mono text-[10px] text-stamp">
                尚欠 {BODY_MIN - glyphBody} 字
              </p>
            ) : null}
          </section>

          <section>
            <SectionHead no="04" label="评估" en="ASSESSMENT" done={state.assessment} />
            <div className="mt-3 flex flex-col gap-4">
              <ScaleRow
                name="状态 MOOD"
                value={rec.mood}
                options={MOODS}
                disabled={locked}
                onChange={(mood) => patch(date, { mood })}
              />
              <ScaleRow
                name="充实 DENSITY"
                value={rec.density}
                options={DENSITIES}
                disabled={locked}
                onChange={(density) => patch(date, { density })}
              />
            </div>
          </section>

          <section>
            <SectionHead
              no="05"
              label="标记"
              en="MARKS"
              done={state.marks}
              meta={`${padCount(rec.tags.length, 1)}`}
            />
            <div className="mt-3 flex flex-wrap gap-1.5">
              {TAGS.map((tag) => {
                const active = rec.tags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    disabled={locked}
                    onClick={() => toggleTag(tag)}
                    className={cn(
                      "h-10 px-3 text-xs transition-[background-color,color] duration-150 ease-out",
                      active ? "bg-ink text-paper" : "text-ink shadow-border",
                    )}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </section>

          <footer className="border-t border-rule pt-5">
            {locked ? (
              <div className="relative overflow-hidden border border-stamp/40 px-4 py-5">
                <div
                  className={cn(
                    "pointer-events-none absolute right-4 top-2 font-mono text-[11px] font-medium tracking-[0.28em] text-stamp",
                    filedFlash ? "folio-stamp" : "folio-stamp",
                  )}
                >
                  <div className="border-2 border-stamp px-2 py-1">已归档 FILED</div>
                </div>
                <p className="flex items-center gap-2 text-sm font-medium">
                  <Lock className="size-3.5" />
                  本卷已锁定
                </p>
                <p className="mt-1 font-mono text-[11px] tabular-nums text-muted">
                  {formatStampTime(rec.filedAt)}
                </p>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <Button variant="outline" type="button" onClick={() => setConfirm("reopen")}>
                    重开
                  </Button>
                  <Button variant="ghost" type="button" onClick={() => setConfirm("void")}>
                    作废
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <Button
                  variant={complete.ready ? "stamp" : "primary"}
                  className="w-full"
                  size="lg"
                  type="submit"
                  disabled={!complete.ready}
                >
                  归档 FILE · {padCount(complete.done, 2)}/{padCount(complete.total, 2)}
                </Button>
                <p className="mt-2 text-center font-mono text-[10px] tabular-nums tracking-wide text-faint">
                  {rec.updatedAt ? `已写入 ${formatStampTime(rec.updatedAt)}` : "尚未写入"}
                </p>
                {hasContent(rec) ? (
                  <button
                    type="button"
                    className="mt-3 flex h-11 w-full items-center justify-center text-xs text-faint"
                    onClick={() => setConfirm("void")}
                  >
                    作废本日草稿
                  </button>
                ) : null}
              </>
            )}
          </footer>
        </form>
      )}

      <ConfirmDialog
        open={confirm === "file"}
        title="确认归档本日？"
        description="五栏齐备。归档后记录锁定，改写需先重开。"
        confirmLabel="归档"
        tone="stamp"
        onCancel={() => setConfirm(null)}
        onConfirm={onFile}
      />
      <ConfirmDialog
        open={confirm === "reopen"}
        title="重开本卷？"
        description="记录将回到草稿状态，已归档印章撤销。"
        confirmLabel="重开"
        onCancel={() => setConfirm(null)}
        onConfirm={() => {
          reopen(date);
          setConfirm(null);
        }}
      />
      <ConfirmDialog
        open={confirm === "void"}
        title="作废本日记录？"
        description="草稿或归档将被删除，此操作不可恢复。"
        confirmLabel="作废"
        tone="stamp"
        onCancel={() => setConfirm(null)}
        onConfirm={() => {
          voidDay(date);
          setConfirm(null);
        }}
      />
    </div>
  );
}

function MetaCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-paper px-2 py-2.5">
      <p className="font-mono text-[9px] tracking-[0.16em] text-faint">{label}</p>
      <p className="mt-1 font-mono text-[11px] tabular-nums">{value}</p>
    </div>
  );
}

function hasContent(rec: DayRecord): boolean {
  return (
    glyphCount(rec.summary) > 0 ||
    filledItems(rec.items).length > 0 ||
    glyphCount(rec.body) > 0 ||
    rec.mood !== null ||
    rec.density !== null ||
    rec.tags.length > 0
  );
}
