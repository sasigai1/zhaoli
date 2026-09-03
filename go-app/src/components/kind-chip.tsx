import { cn } from "@/lib/cn";
import { KIND_LABEL, type EventKind } from "@/lib/schedule/types";

export function KindDot({ kind, className }: { kind: EventKind; className?: string }) {
  return (
    <span
      className={cn(
        "inline-block size-1.5 rounded-full",
        kind === "work" && "bg-ink",
        kind === "life" && "bg-accent",
        kind === "focus" && "bg-ink/70",
        kind === "rest" && "bg-muted",
        className,
      )}
    />
  );
}

export function KindChip({
  kind,
  active,
  onClick,
}: {
  kind: EventKind;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex h-9 items-center gap-2 rounded-full px-3 text-sm transition-[background-color,color] duration-150 ease-out",
        active ? "bg-ink text-sheet" : "bg-paper text-muted hover:text-ink",
      )}
    >
      <KindDot kind={kind} className={active ? "bg-sheet" : undefined} />
      {KIND_LABEL[kind]}
    </button>
  );
}
