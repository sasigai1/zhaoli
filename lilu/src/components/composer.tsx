import { ArrowUp } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type ComposerProps = {
  organizing?: boolean;
  onSubmit: (text: string) => void;
};

export function Composer({ organizing, onSubmit }: ComposerProps) {
  const [value, setValue] = useState("");
  const [coarse, setCoarse] = useState(false);
  const composing = useRef(false);
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const mq = window.matchMedia("(pointer: coarse)");
    const sync = () => setCoarse(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 196)}px`;
  }, [value]);

  const send = () => {
    const text = value.trim();
    if (!text) return;
    onSubmit(text);
    setValue("");
    requestAnimationFrame(() => ref.current?.focus());
  };

  return (
    <form
      className="composer-pad border-t border-border bg-bg/95 px-4 pt-3"
      onSubmit={(e) => {
        e.preventDefault();
        send();
      }}
    >
      <div className="mx-auto flex max-w-xl items-end gap-2 rounded-lg bg-surface px-3 py-2 shadow-hairline">
        <textarea
          ref={ref}
          rows={1}
          value={value}
          placeholder="写下这一段…"
          aria-label="写下这一段思考"
          className={cn(
            "max-h-48 min-h-11 flex-1 resize-none bg-transparent py-2.5 text-base leading-relaxed text-fg",
            "placeholder:text-subtle focus:outline-none",
          )}
          onChange={(e) => setValue(e.target.value)}
          onCompositionStart={() => {
            composing.current = true;
          }}
          onCompositionEnd={() => {
            composing.current = false;
          }}
          onKeyDown={(e) => {
            if (e.key !== "Enter") return;
            if (e.shiftKey || coarse) return;
            if (composing.current || e.nativeEvent.isComposing) return;
            e.preventDefault();
            send();
          }}
        />
        <button
          type="submit"
          disabled={value.trim().length === 0}
          aria-label="放入脉络"
          className="mb-0.5 flex size-11 shrink-0 items-center justify-center rounded-sm bg-accent text-accent-fg transition-opacity duration-150 enabled:active:scale-[0.96] disabled:opacity-30"
        >
          <ArrowUp className="size-4" strokeWidth={1.75} />
        </button>
      </div>
      <p className="mx-auto mt-2 max-w-xl text-center text-xs tracking-wide text-subtle">
        {organizing ? "正在把这一段织进脉络" : coarse ? "写完点箭头" : "Enter 放入 · Shift+Enter 换行"}
      </p>
    </form>
  );
}
