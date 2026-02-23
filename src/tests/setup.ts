import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, beforeAll, vi } from "vitest";
import { appUiModulesEager } from "../app/components/appUiModules.eager";
import {
  resetAppUiModulesNonRegistryTestControls,
  setAppUiModulesEagerRegistryForTests
} from "../app/components/appUiModules";

setAppUiModulesEagerRegistryForTests(appUiModulesEager);

beforeAll(() => {
  if (typeof HTMLCanvasElement === "undefined") {
    return;
  }

  const measureText = (text: string) => ({
    width: Math.max(0, text.length * 7.2)
  });

  const mock2dContext = {
    font: "",
    measureText
  } as Pick<CanvasRenderingContext2D, "font" | "measureText">;

  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockImplementation((contextId: string) => {
    if (contextId !== "2d") {
      return null;
    }
    return mock2dContext as CanvasRenderingContext2D;
  });
});

afterEach(() => {
  resetAppUiModulesNonRegistryTestControls();
  setAppUiModulesEagerRegistryForTests(appUiModulesEager);
  cleanup();
});
