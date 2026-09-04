import { useNavigate } from "@tanstack/react-router";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";
import { useState } from "react";
import { cn } from "@/lib/utils";

export const DISC_RINGS = [
  { id: "today", to: "/today", label: "今日", hint: "当天的安排", r: 172 },
  { id: "compose", to: "/compose", label: "添加", hint: "一句话记下多件", r: 144 },
  { id: "month", to: "/month", label: "月历", hint: "按月翻看", r: 116 },
  { id: "calendar", to: "/calendar", label: "日历", hint: "任意年月", r: 88 },
  { id: "timeline", to: "/timeline", label: "时间线", hint: "日子连成一条", r: 60 },
  { id: "insights", to: "/insights", label: "分析", hint: "回看节奏", r: 36 },
] as const;

const GROOVES = [184, 156, 128, 100, 72, 48];

export function OrbitDisc({
  now,
  todayCount,
}: {
  now: Date;
  todayCount: number;
}) {
  const navigate = useNavigate();
  const [hover, setHover] = useState<string | null>(null);
  const minutes = now.getHours() * 60 + now.getMinutes();
  const sunAngle = (minutes / (24 * 60)) * 360 - 90;
  const sunRad = (sunAngle * Math.PI) / 180;
  const sunR = 184;
  const sunX = 200 + Math.cos(sunRad) * sunR;
  const sunY = 200 + Math.sin(sunRad) * sunR;

  return (
    <div className="flex w-full flex-col items-center gap-8 lg:flex-row lg:items-center lg:justify-center lg:gap-14">
      <div className="relative aspect-square w-full max-w-[min(520px,88vw)]">
        <svg
          viewBox="0 0 400 400"
          className="h-full w-full overflow-visible"
          role="img"
          aria-label="日晷导航圆盘"
        >
          <defs>
            <radialGradient id="plate" cx="50%" cy="46%" r="54%">
              <stop offset="0%" stopColor="var(--color-paper)" />
              <stop offset="72%" stopColor="var(--color-canvas)" />
              <stop offset="100%" stopColor="var(--color-inset)" />
            </radialGradient>
            <filter id="soft" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="10" stdDeviation="12" floodColor="#1c1b18" floodOpacity="0.08" />
            </filter>
          </defs>

          <circle cx="200" cy="200" r="196" fill="url(#plate)" filter="url(#soft)" />
          <circle cx="200" cy="200" r="196" fill="none" stroke="var(--color-line)" strokeWidth="1" />

          <g className="sundial-spin">
            {Array.from({ length: 72 }, (_, i) => {
              const a = (i / 72) * Math.PI * 2;
              const long = i % 6 === 0;
              const r1 = long ? 188 : 192;
              const r2 = 196;
              return (
                <line
                  key={i}
                  x1={200 + Math.cos(a) * r1}
                  y1={200 + Math.sin(a) * r1}
                  x2={200 + Math.cos(a) * r2}
                  y2={200 + Math.sin(a) * r2}
                  stroke="currentColor"
                  strokeOpacity={long ? 0.32 : 0.12}
                  strokeWidth={long ? 1.2 : 0.8}
                />
              );
            })}
          </g>

          {GROOVES.map((r) => (
            <circle
              key={r}
              cx="200"
              cy="200"
              r={r}
              fill="none"
              stroke="currentColor"
              strokeOpacity="0.16"
              strokeWidth="1"
            />
          ))}

          {DISC_RINGS.map((ring) => {
            const active = hover === ring.id;
            return (
              <circle
                key={ring.id}
                cx="200"
                cy="200"
                r={ring.r}
                fill="none"
                stroke="currentColor"
                strokeOpacity={active ? 0.28 : 0.08}
                strokeWidth={ring.id === "insights" ? 18 : 24}
                className="cursor-pointer"
                style={{
                  transitionProperty: "stroke-opacity",
                  transitionDuration: "200ms",
                }}
                onMouseEnter={() => setHover(ring.id)}
                onMouseLeave={() => setHover((h) => (h === ring.id ? null : h))}
                onClick={() => navigate({ to: ring.to })}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    navigate({ to: ring.to });
                  }
                }}
                tabIndex={0}
                role="link"
                aria-label={ring.label}
              />
            );
          })}

          <line
            x1="200"
            y1="200"
            x2={sunX}
            y2={sunY}
            stroke="var(--color-bronze)"
            strokeWidth="1.25"
            strokeLinecap="round"
            opacity="0.75"
          />
          <circle cx={sunX} cy={sunY} r="4.2" fill="var(--color-bronze)" />

          <circle
            cx="200"
            cy="200"
            r="27"
            fill="var(--color-paper)"
            stroke="var(--color-line)"
            strokeWidth="1"
          />
        </svg>

        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center pt-1">
          <p className="font-display text-[11px] tracking-[0.22em] text-muted">
            {format(now, "M月", { locale: zhCN })}
          </p>
          <p className="font-display text-[42px] leading-none tracking-tight text-ink tabular">
            {format(now, "d")}
          </p>
          <p className="mt-1 text-[11px] tracking-[0.18em] text-subtle">
            {format(now, "EEE", { locale: zhCN })}
            {todayCount > 0 ? ` · ${todayCount}` : ""}
          </p>
        </div>
      </div>

      <nav aria-label="圆盘分层" className="grid w-full max-w-sm grid-cols-2 gap-2 sm:gap-3 lg:w-56 lg:grid-cols-1">
        {DISC_RINGS.map((ring, i) => {
          const active = hover === ring.id;
          return (
            <button
              key={ring.id}
              type="button"
              onMouseEnter={() => setHover(ring.id)}
              onMouseLeave={() => setHover((h) => (h === ring.id ? null : h))}
              onClick={() => navigate({ to: ring.to })}
              className={cn(
                "flex min-h-11 items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-[background-color,box-shadow] duration-150",
                active ? "bg-paper shadow-card" : "hover:bg-paper/70",
              )}
            >
              <span className="font-display text-xs tabular text-subtle" aria-hidden="true">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-medium tracking-wide">{ring.label}</span>
                <span className="hidden text-xs text-subtle lg:block">{ring.hint}</span>
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
