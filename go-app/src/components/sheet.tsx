import type { ReactNode } from "react";
import { Drawer } from "vaul";
import { cn } from "@/lib/cn";

export function BottomSheet({
  open,
  onOpenChange,
  children,
  title,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
  title: string;
}) {
  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange} shouldScaleBackground={false}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-40 bg-ink/25" />
        <Drawer.Content
          className={cn(
            "fixed inset-x-0 bottom-0 z-50 mx-auto flex max-h-[88dvh] w-full max-w-[430px] flex-col rounded-t-xl bg-sheet shadow-float outline-none",
          )}
        >
          <div className="flex justify-center pt-3 pb-1">
            <div className="h-1 w-10 rounded-full bg-line" />
          </div>
          <Drawer.Title className="sr-only">{title}</Drawer.Title>
          <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-[calc(18px+env(safe-area-inset-bottom))]">
            {children}
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
