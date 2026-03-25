import { fireEvent, screen, within } from "@testing-library/react";
import { vi } from "vitest";
import { getPanelByHeading } from "./app-ui-test-utils";

export function installScrollIntoViewSpy() {
  const scrollTargets: HTMLElement[] = [];
  const originalDescriptor = Object.getOwnPropertyDescriptor(HTMLElement.prototype, "scrollIntoView");
  const mock = vi.fn(function mockScrollIntoView(this: HTMLElement) {
    scrollTargets.push(this);
  });
  Object.defineProperty(HTMLElement.prototype, "scrollIntoView", {
    configurable: true,
    writable: true,
    value: mock
  });

  return {
    scrollTargets,
    restore() {
      if (originalDescriptor === undefined) {
        Reflect.deleteProperty(HTMLElement.prototype, "scrollIntoView");
        return;
      }
      Object.defineProperty(HTMLElement.prototype, "scrollIntoView", originalDescriptor);
    }
  };
}

export function clickNewFromPanel(panelHeading: string): void {
  fireEvent.click(within(getPanelByHeading(panelHeading)).getByRole("button", { name: "New" }));
}

export function getInspectorPanelIfVisible(): HTMLElement | null {
  return screen.queryByRole("heading", { name: "Inspector context" }) !== null ? getPanelByHeading("Inspector context") : null;
}
