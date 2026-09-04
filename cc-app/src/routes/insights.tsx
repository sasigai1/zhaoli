import { createFileRoute } from "@tanstack/react-router";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";
import { useMemo } from "react";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { PageShell } from "@/components/layout/page-shell";
import { useMounted, useNow } from "@/hooks/use-mounted";
import { computeStats } from "@/lib/schedule/stats";
import { useScheduleStore } from "@/lib/schedule/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/insights")({ component: InsightsPage });

function InsightsPage() {
  const mounted = useMounted();
  const now = useNow();
  const events = useScheduleStore((s) => s.events);
  const stats = useMemo(() => computeStats(events, now), [events, now]);

  if (!mounted) return <div className="min-h-dvh bg-canvas" />;

  const maxWeek = Math.max(1, ...stats.weekdayBusy.map((d) => d.count));
  const maxHeat = Math.max(1, ...stats.heat.map((d) => d.count));

  return (
    <PageShell title="分析" subtitle="只看这一周的节奏，和最近十二周的疏密。">
      <div className="grid grid-cols-3 gap-2">
        {[
          { k: "本周", v: stats.weekCount, u: "件" },
          { k: "完成", v: `${stats.weekRate}`, u: "%" },
          { k: "今日", v: stats.todayCount, u: "件" },
        ].map((s) => (
          <div key={s.k} className="rounded-lg bg-paper px-3 py-4 text-center shadow-card">
            <p className="text-[11px] tracking-[0.16em] text-subtle">{s.k}</p>
            <p className="mt-1 font-display text-2xl tabular leading-none">
              {s.v}
              <span className="ml-0.5 text-xs text-subtle">{s.u}</span>
            </p>
          </div>
        ))}
      </div>

      {stats.overdue > 0 ? (
        <p className="mt-4 text-sm text-warn">有 {stats.overdue} 件已过期未完成。</p>
      ) : null}

      <section className="mt-10">
        <h2 className="mb-4 font-display text-lg">类型</h2>
        {stats.typeRows.length === 0 ? (
          <p className="text-sm text-subtle">本周还没有可统计的安排。</p>
        ) : (
          <div className="flex flex-col gap-3">
            {stats.typeRows.map((row) => {
              const max = Math.max(1, ...stats.typeRows.map((r) => r.hours));
              return (
                <div key={row.type}>
                  <div className="mb-1 flex items-baseline justify-between text-sm">
                    <span>{row.label}</span>
                    <span className="tabular text-xs text-subtle">
                      {row.count} 件 · {row.hours}h
                    </span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-inset">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${(row.hours / max) * 100}%`,
                        background: row.color,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section className="mt-10">
        <h2 className="mb-4 font-display text-lg">一周疏密</h2>
        <div className="h-44 rounded-xl bg-paper p-3 shadow-card">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats.weekdayBusy} barCategoryGap="28%">
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                tick={{ fill: "#9A958C", fontSize: 12 }}
              />
              <YAxis hide domain={[0, maxWeek]} />
              <Tooltip
                cursor={{ fill: "rgba(28,27,24,0.04)" }}
                contentStyle={{
                  background: "#FBF8F3",
                  border: "none",
                  borderRadius: 12,
                  boxShadow: "0 8px 24px -8px rgba(28,27,24,0.12)",
                  fontSize: 12,
                }}
                formatter={(value) => [`${value as number} 件`, "安排"]}
              />
              <Bar dataKey="count" fill="#1C1B18" radius={[4, 4, 0, 0]} maxBarSize={28} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="mb-1 font-display text-lg">十二周</h2>
        <p className="mb-4 text-xs text-subtle">
          {format(now, "M月d日", { locale: zhCN })} 往前看。颜色越深，那天越满。
        </p>
        <div className="flex gap-1 overflow-x-auto pb-1">
          {Array.from({ length: 12 }, (_, w) => (
            <div key={w} className="flex flex-col gap-1">
              {stats.heat.slice(w * 7, w * 7 + 7).map((cell) => (
                <div
                  key={cell.iso}
                  title={`${cell.iso} · ${cell.count}`}
                  className={cn("size-3 rounded-[3px]")}
                  style={{
                    background:
                      cell.count === 0
                        ? "#E8E3DA"
                        : `color-mix(in oklab, #1C1B18 ${Math.min(90, 22 + (cell.count / maxHeat) * 70)}%, #E8E3DA)`,
                  }}
                />
              ))}
            </div>
          ))}
        </div>
      </section>
    </PageShell>
  );
}
