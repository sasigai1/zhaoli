import { useEffect } from "react";
import { useScheduleStore } from "@/lib/schedule/store";

export function HydrateStore() {
  const seedIfEmpty = useScheduleStore((s) => s.seedIfEmpty);
  const setHydrated = useScheduleStore((s) => s.setHydrated);

  useEffect(() => {
    const finish = () => {
      seedIfEmpty();
      setHydrated(true);
    };
    const unsub = useScheduleStore.persist.onFinishHydration(finish);
    if (useScheduleStore.persist.hasHydrated()) finish();
    return unsub;
  }, [seedIfEmpty, setHydrated]);

  return null;
}
