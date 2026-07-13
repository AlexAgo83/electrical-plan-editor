import { translateCurrent as t } from "../lib/i18n";
import { useDeferredValue, useEffect, useState, type ReactElement, type ReactNode } from "react";

// ponytail: tests render synchronously so existing specs keep querying panels without waitFor
const MOUNT_IMMEDIATELY = import.meta.env.MODE === "test";

interface DeferredPanelProps {
  placeholder?: ReactNode;
  children: ReactNode;
}

/**
 * Defers mounting heavy below-canvas panels until the browser is idle, showing a
 * lightweight placeholder first, then renders subsequent updates at low priority
 * (useDeferredValue) so canvas interactions commit before table/schematic updates.
 */
export function DeferredPanel({ placeholder, children }: DeferredPanelProps): ReactElement {
  const [isMounted, setIsMounted] = useState(MOUNT_IMMEDIATELY);
  useEffect(() => {
    if (isMounted) {
      return;
    }
    const idleWindow = window as Window & {
      requestIdleCallback?: (callback: () => void, options?: { timeout: number }) => number;
      cancelIdleCallback?: (handle: number) => void;
    };
    if (idleWindow.requestIdleCallback !== undefined) {
      const handle = idleWindow.requestIdleCallback(() => setIsMounted(true), { timeout: 500 });
      return () => idleWindow.cancelIdleCallback?.(handle);
    }
    const handle = window.setTimeout(() => setIsMounted(true), 50);
    return () => window.clearTimeout(handle);
  }, [isMounted]);

  const deferredChildren = useDeferredValue(children);
  return (
    <>
      {isMounted ? (
        deferredChildren
      ) : (
        (placeholder ?? <section className="panel" aria-busy="true" aria-label={t("ui.deferredpanelLoadingPanel")} />)
      )}
    </>
  );
}
