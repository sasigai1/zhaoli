import type { ErrorComponentProps } from "@tanstack/react-router";
import { TriangleAlert } from "lucide-react";

export function AppErrorComponent({ error }: ErrorComponentProps) {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-3 bg-paper px-6 text-center text-ink">
      <span className="text-stamp" aria-hidden="true">
        <TriangleAlert className="size-8" strokeWidth={1.75} />
      </span>
      <p className="font-mono text-xs tracking-[0.18em] text-faint">ERROR</p>
      <h1 className="text-lg font-medium">系统中断</h1>
      <p className="max-w-md text-sm break-words text-muted">
        {error.message || "发生未预期的错误。请重新载入。"}
      </p>
    </main>
  );
}
