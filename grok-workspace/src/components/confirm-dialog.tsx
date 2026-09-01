import { Button } from "@/components/ui/button";

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel?: string;
  tone?: "ink" | "stamp";
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel = "取消",
  tone = "ink",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null;
  return (
    <div
      className="absolute inset-0 z-50 flex items-center justify-center bg-ink/40 p-6"
      role="presentation"
      onClick={onCancel}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="folio-confirm-title"
        className="w-full max-w-sm rounded-md bg-surface p-5 shadow-device"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="font-mono text-xs tracking-[0.18em] text-faint">CONFIRM</p>
        <h2 id="folio-confirm-title" className="mt-2 text-lg font-medium tracking-tight">
          {title}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">{description}</p>
        <div className="mt-5 grid grid-cols-2 gap-2">
          <Button variant="outline" type="button" onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button
            variant={tone === "stamp" ? "stamp" : "primary"}
            type="button"
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
