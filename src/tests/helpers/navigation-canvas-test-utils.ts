import { within } from "@testing-library/react";
import { vi } from "vitest";

export function mockSvgRect(networkSvg: SVGSVGElement) {
  return vi.spyOn(networkSvg, "getBoundingClientRect").mockImplementation(
    () =>
      ({
        x: 0,
        y: 0,
        top: 0,
        left: 0,
        width: 800,
        height: 520,
        right: 800,
        bottom: 520,
        toJSON: () => ({})
      })
  );
}

export function getNetworkSummaryViewportTransform(panel: HTMLElement): string {
  const networkSvg = within(panel).getByLabelText("2D network diagram");
  const transformGroup = networkSvg.querySelector("g[transform]");
  if (transformGroup === null) {
    throw new Error("Viewport transform group not found.");
  }
  return transformGroup.getAttribute("transform") ?? "";
}
