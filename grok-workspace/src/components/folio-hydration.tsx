import { useEffect } from "react";
import { hydrateLedger } from "@/lib/folio/store";

export function FolioHydration({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    hydrateLedger();
  }, []);
  return children;
}
