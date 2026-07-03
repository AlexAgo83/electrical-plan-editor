import { fireEvent, within } from "@testing-library/react";
import { memo, type ComponentProps } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { NetworkSummaryPanel } from "../app/components/NetworkSummaryPanel";
import { appUiModulesEager } from "../app/components/appUiModules.eager";
import { setAppUiModulesEagerRegistryForTests } from "../app/components/appUiModules";
import { ModelingFormsColumn } from "../app/components/workspace/ModelingFormsColumn";
import { ModelingPrimaryTables } from "../app/components/workspace/ModelingPrimaryTables";
import { ModelingSecondaryTables } from "../app/components/workspace/ModelingSecondaryTables";
import { arePanelMemoPropsEqual } from "../app/lib/renderMemoCompare";
import { appActions, appReducer } from "../store";
import {
  asNodeId,
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
let previousNetworkSummaryProps: ComponentProps<typeof NetworkSummaryPanel> | null = null;
let networkSummaryDiffReasons: string[] = [];
const CountedNetworkSummaryPanel = memo((props: ComponentProps<typeof NetworkSummaryPanel>) => {
  if (previousNetworkSummaryProps !== null) {
    networkSummaryDiffReasons = Object.keys(props).filter((key) => {
      const previousValue = previousNetworkSummaryProps?.[key as keyof ComponentProps<typeof NetworkSummaryPanel>];
      const nextValue = props[key as keyof ComponentProps<typeof NetworkSummaryPanel>];
      if (Object.is(previousValue, nextValue) || (typeof previousValue === "function" && typeof nextValue === "function")) {
        return false;
      }
      return !arePanelMemoPropsEqual({ value: previousValue }, { value: nextValue });
    });
  }
  previousNetworkSummaryProps = props;
  renderCounts.networkSummary += 1;
  return <NetworkSummaryPanel {...props} />;
}, arePanelMemoPropsEqual);

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
}, arePanelMemoPropsEqual);

const CountedModelingSecondaryTables = memo((props: ComponentProps<typeof ModelingSecondaryTables>) => {
  renderCounts.secondaryTables += 1;
  return <ModelingSecondaryTables {...props} />;
}, arePanelMemoPropsEqual);

const CountedModelingFormsColumn = memo((props: ComponentProps<typeof ModelingFormsColumn>) => {
  renderCounts.formsColumn += 1;
  return <ModelingFormsColumn {...props} />;
}, arePanelMemoPropsEqual);

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
  networkSummaryDiffReasons = [];
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

  it("keeps canvas and tables flat during a connector form keystroke", () => {
    const positionedState = appReducer(
      createUiIntegrationState(),
      appActions.setNodePositions({
        [asNodeId("N-C1")]: { x: 60, y: 80 },
        [asNodeId("N-MID")]: { x: 220, y: 180 },
        [asNodeId("N-S1")]: { x: 420, y: 220 }
      })
    );
    renderAppWithState(positionedState);
    switchScreenDrawerAware("modeling");

    fireEvent.click(within(getPanelByHeading("Connectors")).getByRole("button", { name: "New" }));
    const connectorPanel = getPanelByHeading("Create Connector");
    resetCounts();
    fireEvent.change(within(connectorPanel).getByLabelText("Functional name"), { target: { value: "Connector typed" } });

    expect(renderCounts.formsColumn).toBeGreaterThan(0);
    expect(networkSummaryDiffReasons).toEqual([]);
    expect(renderCounts.networkSummary).toBe(0);
    expect(renderCounts.primaryTables).toBe(0);
    expect(renderCounts.secondaryTables).toBe(0);
  });
});
