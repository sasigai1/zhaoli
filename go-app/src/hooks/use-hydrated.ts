import { useEffect, useState } from "react";
import { makeSeed } from "@/lib/schedule/seed";
import { dateKey } from "@/lib/schedule/time";
import { useSchedule } from "@/lib/schedule/store";

export function useHydratedSchedule() {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const finish = () => {
      if (cancelled) return;
      const state = useSchedule.getState();
      if (!state.seeded || state.events.length === 0) {
        useSchedule.setState({ events: makeSeed(), seeded: true });
      }
      useSchedule.setState({ selectedDate: dateKey(new Date()) });
      useSchedule.getState().resetRemindersIfFuture();
      setHydrated(true);
    };

    const run = async () => {
      try {
        const result = useSchedule.persist?.rehydrate?.();
        if (result && typeof (result as Promise<unknown>).then === "function") {
          await Promise.race([
            result as Promise<unknown>,
            new Promise((resolve) => window.setTimeout(resolve, 250)),
          ]);
        }
      } catch {
        /* storage can be missing in preview */
      }
      finish();
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, []);

  return hydrated;
}
