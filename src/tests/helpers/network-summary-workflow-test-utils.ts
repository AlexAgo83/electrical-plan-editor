import { fireEvent, within } from "@testing-library/react";
import { expect, vi } from "vitest";
import type { HarnessAssemblyId, InterHarnessConnectorLinkId, NetworkId } from "../../core/entities";
import { appActions, appReducer, type NetworkSummaryViewState } from "../../store";
import { asConnectorId, createUiIntegrationState, getPanelByHeading } from "./app-ui-test-utils";

export function asNetworkId(value: string): NetworkId {
  return value as NetworkId;
}

export function asAssemblyId(value: string): HarnessAssemblyId {
  return value as HarnessAssemblyId;
}

export function asInterHarnessConnectorLinkId(value: string): InterHarnessConnectorLinkId {
  return value as InterHarnessConnectorLinkId;
}

export function getCurrentNetworkFunctionalPanel(networkName: string): HTMLElement {
  const panel = getPanelByHeading("Current network functional");
  expect(panel).toHaveTextContent(`Current network functional${networkName}`);
  return panel;
}

export function getNetworkSummaryViewportTransform(panel: HTMLElement): string {
  const networkSvg = within(panel).getByLabelText("2D network diagram");
  const transformGroup = networkSvg.querySelector("g[transform]");
  if (transformGroup === null) {
    throw new Error("Viewport transform group not found.");
  }
  return transformGroup.getAttribute("transform") ?? "";
}

export function parseNetworkSummaryViewportTransform(transform: string): { offsetX: number; offsetY: number; scale: number } {
  const match = transform.match(/^translate\(([^ )]+)\s+([^)]+)\)\s+scale\(([^)]+)\)$/);
  if (match === null) {
    throw new Error(`Unexpected viewport transform: ${transform}`);
  }
  return {
    offsetX: Number(match[1]),
    offsetY: Number(match[2]),
    scale: Number(match[3])
  };
}

export function getNetworkSummaryViewBoxSize(panel: HTMLElement): { width: number; height: number } {
  const networkSvg = within(panel).getByLabelText("2D network diagram");
  const values = (networkSvg.getAttribute("viewBox") ?? "")
    .split(/\s+/)
    .map((value) => Number(value));
  const width = values[2];
  const height = values[3];
  if (width === undefined || height === undefined || !Number.isFinite(width) || !Number.isFinite(height)) {
    throw new Error("Unable to parse network summary viewBox.");
  }
  return { width, height };
}

export function createUiIntegrationStateWithNetworkSummaryViewState(viewState: NetworkSummaryViewState) {
  const baseState = createUiIntegrationState();
  const activeNetworkId = baseState.activeNetworkId;
  if (activeNetworkId === null) {
    throw new Error("Expected active network.");
  }
  const scoped = baseState.networkStates[activeNetworkId];
  if (scoped === undefined) {
    throw new Error("Expected active scoped network.");
  }

  return {
    ...baseState,
    networkStates: {
      ...baseState.networkStates,
      [activeNetworkId]: { ...scoped, networkSummaryViewState: viewState }
    }
  };
}

export function openViewMenu(panel: HTMLElement): void {
  const viewButton = within(panel).getByRole("button", { name: "View" });
  if (viewButton.getAttribute("aria-expanded") !== "true") {
    fireEvent.click(viewButton);
  }
}

export function openEditMenu(panel: HTMLElement): void {
  const editButton = within(panel).getByRole("button", { name: "Edit" });
  if (editButton.getAttribute("aria-expanded") !== "true") {
    fireEvent.click(editButton);
  }
}

export function getDisplayToggleButton(
  panel: HTMLElement,
  label: "Info" | "Length" | "Callouts" | "Grid" | "Snap" | "Lock"
): HTMLButtonElement {
  if (label === "Info" || label === "Length" || label === "Callouts") {
    openViewMenu(panel);
  } else {
    openEditMenu(panel);
  }
  return within(panel).getByRole("button", { name: label });
}

function mockNetworkSvgRect(networkSvg: SVGSVGElement) {
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
      }) as DOMRect
  );
}

export function createHarnessAssemblyFunctionalSelectionState() {
  const base = createUiIntegrationState();
  const mainNetworkId = base.activeNetworkId;
  if (mainNetworkId === null) {
    throw new Error("Expected active network.");
  }
  const mainConnector = base.connectors.byId[asConnectorId("C1")];
  if (mainConnector === undefined) {
    throw new Error("Expected connector C1.");
  }
  const withMainConnector = appReducer(base, appActions.upsertConnector({ ...mainConnector, isMainHarnessConnector: true }));
  const withSecondNetwork = appReducer(
    withMainConnector,
    appActions.createNetwork({
      id: asNetworkId("net-b"),
      name: "Harness B",
      technicalId: "H-B",
      createdAt: "2026-05-15T08:00:00.000Z",
      updatedAt: "2026-05-15T08:00:00.000Z"
    })
  );
  const withSecondConnector = appReducer(
    withSecondNetwork,
    appActions.upsertConnector({
      id: asConnectorId("C-B1"),
      name: "Harness B connector",
      technicalId: "B-C-1",
      cavityCount: 2
    })
  );
  const withMainActive = appReducer(withSecondConnector, appActions.selectNetwork(mainNetworkId));
  return appReducer(
    withMainActive,
    appActions.upsertHarnessAssembly({
      id: asAssemblyId("asm-main"),
      name: "Main assembly",
      technicalId: "ASM-MAIN",
      members: [
        { networkId: mainNetworkId, color: "#2563eb" },
        { networkId: asNetworkId("net-b"), color: "#16a34a" }
      ],
      masterConnectorRefs: [{ networkId: mainNetworkId, connectorId: asConnectorId("C1") }],
      connectorLinks: [
        {
          id: asInterHarnessConnectorLinkId("link-main-b"),
          name: "Main to B",
          sourceNetworkId: mainNetworkId,
          sourceConnectorId: asConnectorId("C1"),
          targetNetworkId: asNetworkId("net-b"),
          targetConnectorId: asConnectorId("C-B1")
        }
      ],
      createdAt: "2026-05-15T08:05:00.000Z",
      updatedAt: "2026-05-15T08:05:00.000Z"
    })
  );
}

export function panNetworkSummaryViewport(
  panel: HTMLElement,
  interaction: { startX: number; startY: number; endX: number; endY: number }
): string {
  const networkSvg = within(panel).getByLabelText("2D network diagram") as unknown as SVGSVGElement;
  const rectSpy = mockNetworkSvgRect(networkSvg);

  fireEvent.mouseDown(networkSvg, {
    button: 0,
    shiftKey: true,
    clientX: interaction.startX,
    clientY: interaction.startY
  });
  fireEvent.mouseMove(networkSvg, { clientX: interaction.endX, clientY: interaction.endY });
  fireEvent.mouseUp(networkSvg, { clientX: interaction.endX, clientY: interaction.endY });

  const transform = getNetworkSummaryViewportTransform(panel);
  rectSpy.mockRestore();
  return transform;
}

export function expectDisplayToggles(
  panel: HTMLElement,
  expected: Record<"Info" | "Length" | "Callouts" | "Grid" | "Snap" | "Lock", boolean>
): void {
  (Object.entries(expected) as Array<[keyof typeof expected, boolean]>).forEach(([label, isActive]) => {
    const button = getDisplayToggleButton(panel, label);
    if (isActive) {
      expect(button).toHaveClass("is-active");
    } else {
      expect(button).not.toHaveClass("is-active");
    }
  });
}
