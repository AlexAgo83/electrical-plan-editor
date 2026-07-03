import { fireEvent, within } from "@testing-library/react";
import { memo, type ComponentProps } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { NetworkSummaryPanel } from "../app/components/NetworkSummaryPanel";
import { appUiModulesEager } from "../app/components/appUiModules.eager";
import { setAppUiModulesEagerRegistryForTests } from "../app/components/appUiModules";
import { ModelingFormsColumn } from "../app/components/workspace/ModelingFormsColumn";
import { ModelingPrimaryTables } from "../app/components/workspace/ModelingPrimaryTables";
import { ModelingSecondaryTables } from "../app/components/workspace/ModelingSecondaryTables";
import {
  createUiIntegrationState,
  getPanelByHeading,
  renderAppWithState,
  switchScreenDrawerAware
} from "./helpers/app-ui-test-utils";
import { mockSvgRect } from "./helpers/navigation-canvas-test-utils";

const renderCounts = {
  networkSummary: 0,
  primaryTables: 0,
  secondaryTables: 0,
  formsColumn: 0
};

let previousPrimaryProps: ComponentProps<typeof ModelingPrimaryTables> | null = null;
let changedPrimaryProps: string[] = [];

const CountedNetworkSummaryPanel = memo((props: ComponentProps<typeof NetworkSummaryPanel>) => {
  renderCounts.networkSummary += 1;
  return <NetworkSummaryPanel {...props} />;
});

const CountedModelingPrimaryTables = memo((props: ComponentProps<typeof ModelingPrimaryTables>) => {
  if (previousPrimaryProps !== null) {
    changedPrimaryProps = Object.keys(props).filter(
      (key) =>
        props[key as keyof ComponentProps<typeof ModelingPrimaryTables>] !==
        previousPrimaryProps?.[key as keyof ComponentProps<typeof ModelingPrimaryTables>]
    );
  }
  previousPrimaryProps = props;
  renderCounts.primaryTables += 1;
  return <ModelingPrimaryTables {...props} />;
});

const CountedModelingSecondaryTables = memo((props: ComponentProps<typeof ModelingSecondaryTables>) => {
  renderCounts.secondaryTables += 1;
  return <ModelingSecondaryTables {...props} />;
});

const CountedModelingFormsColumn = memo((props: ComponentProps<typeof ModelingFormsColumn>) => {
  renderCounts.formsColumn += 1;
  return <ModelingFormsColumn {...props} />;
});

function installCountedRegistry(): void {
  setAppUiModulesEagerRegistryForTests({
    ...appUiModulesEager,
    NetworkSummaryPanel: CountedNetworkSummaryPanel,
    ModelingPrimaryTables: CountedModelingPrimaryTables,
    ModelingSecondaryTables: CountedModelingSecondaryTables,
    ModelingFormsColumn: CountedModelingFormsColumn
  });
}

function resetCounts(): void {
  renderCounts.networkSummary = 0;
  renderCounts.primaryTables = 0;
  renderCounts.secondaryTables = 0;
  renderCounts.formsColumn = 0;
  changedPrimaryProps = [];
}

describe("App integration UI - render containment", () => {
  beforeEach(() => {
    localStorage.clear();
    resetCounts();
    installCountedRegistry();
  });

  it("keeps non-canvas modeling panels flat during a coalesced pan frame", () => {
    const frameCallbackRef: { current: FrameRequestCallback | null } = { current: null };
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback: FrameRequestCallback) => {
      frameCallbackRef.current = callback;
      return 1;
    });
    vi.spyOn(window, "cancelAnimationFrame").mockImplementation(vi.fn());

    renderAppWithState(createUiIntegrationState());
    switchScreenDrawerAware("modeling");

    const networkSummaryPanel = getPanelByHeading("Network summary");
    const networkSvg = within(networkSummaryPanel).getByLabelText("2D network diagram") as unknown as SVGSVGElement;
    const rectSpy = mockSvgRect(networkSvg);

    fireEvent.mouseDown(networkSvg, { button: 0, clientX: 10, clientY: 10 });
    resetCounts();
    fireEvent.mouseMove(networkSvg, { clientX: 20, clientY: 20 });
    fireEvent.mouseMove(networkSvg, { clientX: 30, clientY: 30 });
    if (frameCallbackRef.current === null) {
      throw new Error("Expected a scheduled animation frame.");
    }
    const runFrame = frameCallbackRef.current;
    runFrame(0);
    rectSpy.mockRestore();

    expect(changedPrimaryProps).toEqual([]);
    expect(renderCounts.primaryTables).toBe(0);
    expect(renderCounts.secondaryTables).toBe(0);
    expect(renderCounts.formsColumn).toBe(0);
  });
});
