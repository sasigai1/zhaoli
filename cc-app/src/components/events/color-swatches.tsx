import { Check } from "lucide-react";
import { SWATCHES, TYPE_META, readableOn } from "@/lib/schedule/colors";
import type { EventType } from "@/lib/schedule/types";
import { EVENT_TYPES } from "@/lib/schedule/types";
import { cn } from "@/lib/utils";

export function TypePills({
  value,
  onChange,
}: {
  value: EventType;
  onChange: (t: EventType) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {EVENT_TYPES.map((t) => {
        const active = value === t;
        return (
          <button
            key={t}
            type="button"
            onClick={() => onChange(t)}
            className={cn(
              "inline-flex h-9 items-center gap-2 rounded-full px-3 text-xs font-medium transition-[background-color,box-shadow,color] duration-150",
              active ? "bg-ink text-paper" : "bg-paper text-muted shadow-card hover:text-ink",
            )}
          >
            <span
              className="size-2 rounded-full"
              style={{ background: TYPE_META[t].swatch }}
            />
            {TYPE_META[t].label}
          </button>
        );
      })}
    </div>
  );
}

export function ColorSwatches({
  value,
  onChange,
}: {
  value: string;
  onChange: (hex: string) => void;
}) {
  return (
    <div className="grid grid-cols-8 gap-2">
      {SWATCHES.map((s) => {
        const active = s.hex.toLowerCase() === value.toLowerCase();
        return (
          <button
            key={s.id}
            type="button"
            title={s.name}
            aria-label={s.name}
            onClick={() => onChange(s.hex)}
            className={cn(
              "relative aspect-square rounded-md transition-[scale,box-shadow] duration-150 ease-out hover:scale-[1.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/20",
              active ? "shadow-lift ring-2 ring-ink/30 ring-offset-2 ring-offset-canvas" : "shadow-card",
            )}
            style={{ background: s.hex }}
          >
            {active ? (
              <Check
                className="absolute inset-0 m-auto size-3.5"
                strokeWidth={2.4}
                style={{ color: readableOn(s.hex) }}
              />
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
