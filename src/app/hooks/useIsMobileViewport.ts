import { useEffect, useState } from "react";
import { MOBILE_BREAKPOINT_PX } from "../lib/app-utils-shared";

function getWindowWidth(): number {
  if (typeof window === "undefined") {
    return MOBILE_BREAKPOINT_PX + 1;
  }
  return window.innerWidth;
}

export function useIsMobileViewport(): boolean {
  const [isMobileViewport, setIsMobileViewport] = useState(() => getWindowWidth() <= MOBILE_BREAKPOINT_PX);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const handleResize = (): void => {
      const nextValue = window.innerWidth <= MOBILE_BREAKPOINT_PX;
      setIsMobileViewport((current) => (current === nextValue ? current : nextValue));
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return isMobileViewport;
}
