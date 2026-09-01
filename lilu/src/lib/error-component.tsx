import type { ErrorComponentProps } from "@tanstack/react-router";

export function AppErrorComponent({ error }: ErrorComponentProps) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-3 bg-bg px-6 text-center text-fg">
      <p className="text-sm tracking-label text-muted">理路</p>
      <h1 className="font-serif text-lg font-medium">这一页走岔了</h1>
      <p className="max-w-md text-sm leading-relaxed break-words text-muted">
        {error.message || "发生了未预期的错误。"}
      </p>
    </main>
  );
}
