import { useEffect } from "react";
import { AppController, type AppProps } from "./AppController";

export function App(props: AppProps) {
  useEffect(() => {
    function handleNumberInputWheel(event: WheelEvent): void {
      const target = event.target;
      if (!(target instanceof HTMLInputElement) || target.type !== "number") {
        return;
      }
      if (document.activeElement === target) {
        target.blur();
      }
    }

    document.addEventListener("wheel", handleNumberInputWheel, { capture: true });
    return () => document.removeEventListener("wheel", handleNumberInputWheel, { capture: true });
  }, []);

  return <AppController {...props} />;
}
