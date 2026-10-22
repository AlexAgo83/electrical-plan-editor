import { fireEvent, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { appActions, appReducer } from "../store";
import type { AppState } from "../store";
import {
  asConnectorId,
  asSpliceId,
  asWireId,
  createUiIntegrationState,
  getPanelByHeading,
  renderAppWithState,
  switchScreenDrawerAware
} from "./helpers/app-ui-test-utils";
import { openExportMenu, openSvgPreviewAndDownload, readBlobAsText } from "./helpers/network-summary-export-test-utils";

const UI_PREFERENCES_STORAGE_KEY = "electrical-plan-editor.ui-preferences.v1";
const LABELS = {
  localConnection: "Show connection (contact) reference – this side (local) in callout table",
  localSeal: "Show seal reference – this side (local) in callout table",
  oppositeConnection: "Show connection (contact) reference – opposite side in callout table",
  oppositeSeal: "Show seal reference – opposite side in callout table"
} as const;

function createStateWithReferences(): AppState {
  return appReducer(
    createUiIntegrationState(),
    appActions.saveWire({
      id: asWireId("W1"),
      name: "Wire 1",
      technicalId: "W-1",
      endpointA: { kind: "connectorCavity", connectorId: asConnectorId("C1"), cavityIndex: 1 },
      endpointB: { kind: "splicePort", spliceId: asSpliceId("S1"), portIndex: 1 },
      endpointAConnectionReference: "TERM-A-111",
      endpointASealReference: "SEAL-A-222",
      endpointBConnectionReference: "TERM-B-333"
    })
  );
}

function showCallouts(): HTMLElement {
  switchScreenDrawerAware("modeling");
  const networkSummaryPanel = getPanelByHeading("Network summary");
  const viewButton = within(networkSummaryPanel).getByRole("button", { name: "View" });
  if (viewButton.getAttribute("aria-expanded") !== "true") {
    fireEvent.click(viewButton);
  }
  const calloutsToggle = within(networkSummaryPanel).getByRole("button", { name: "Callouts" });
  if (!calloutsToggle.classList.contains("is-active")) {
    fireEvent.click(calloutsToggle);
  }
  return networkSummaryPanel;
}

function connectorCalloutText(panel: HTMLElement): string {
  const frames = [...panel.querySelectorAll(".network-graph-layer-callouts .network-callout-anchor")];
  const connectorCallout = frames.find((frame) => frame.getAttribute("aria-label")?.startsWith("Select connector"));
  return connectorCallout?.textContent ?? "";
}

function readStoredPreferences(): Record<string, unknown> {
  return JSON.parse(localStorage.getItem(UI_PREFERENCES_STORAGE_KEY) ?? "{}") as Record<string, unknown>;
}

describe("App integration UI - callout endpoint references", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("starts unchecked, updates the drawing immediately and persists across remount", () => {
    const state = createStateWithReferences();
    const firstRender = renderAppWithState(state);
    let panel = showCallouts();
    const defaultText = connectorCalloutText(panel);
    expect(defaultText).not.toContain("TERM-A-111");
    expect(defaultText).not.toContain("Local contact");

    switchScreenDrawerAware("settings");
    const canvasSettingsPanel = getPanelByHeading("Canvas tools preferences");
    for (const label of Object.values(LABELS)) {
      expect(within(canvasSettingsPanel).getByLabelText(label)).not.toBeChecked();
    }
    fireEvent.click(within(canvasSettingsPanel).getByLabelText(LABELS.localConnection));
    fireEvent.click(within(canvasSettingsPanel).getByLabelText(LABELS.oppositeConnection));

    panel = showCallouts();
    const text = connectorCalloutText(panel);
    expect(text).toContain("Local contact");
    expect(text).toContain("TERM-A-111");
    expect(text).toContain("Opp. contact");
    expect(text).toContain("TERM-B-333");
    expect(text).not.toContain("SEAL-A-222");
    expect(text).not.toContain("Local seal");
    expect(readStoredPreferences().canvasCalloutEndpointReferences).toEqual({
      localConnection: true,
      localSeal: false,
      oppositeConnection: true,
      oppositeSeal: false
    });

    firstRender.unmount();
    renderAppWithState(createStateWithReferences());
    switchScreenDrawerAware("settings");
    const restoredPanel = getPanelByHeading("Canvas tools preferences");
    expect(within(restoredPanel).getByLabelText(LABELS.localConnection)).toBeChecked();
    expect(within(restoredPanel).getByLabelText(LABELS.localSeal)).not.toBeChecked();
    expect(within(restoredPanel).getByLabelText(LABELS.oppositeConnection)).toBeChecked();
    expect(within(restoredPanel).getByLabelText(LABELS.oppositeSeal)).not.toBeChecked();
  });

  it("shows splice rows relative to the splice endpoint with an em dash for a missing seal", () => {
    renderAppWithState(createStateWithReferences());
    switchScreenDrawerAware("settings");
    const canvasSettingsPanel = getPanelByHeading("Canvas tools preferences");
    fireEvent.click(within(canvasSettingsPanel).getByLabelText(LABELS.localSeal));
    fireEvent.click(within(canvasSettingsPanel).getByLabelText(LABELS.oppositeSeal));

    const panel = showCallouts();
    const spliceCallout = [...panel.querySelectorAll(".network-graph-layer-callouts .network-callout-anchor")].find((frame) =>
      frame.getAttribute("aria-label")?.startsWith("Select splice")
    );
    const localSealCell = spliceCallout?.querySelector('.network-callout-table-cell[data-callout-column="localSeal"]');
    const oppositeSealCell = spliceCallout?.querySelector('.network-callout-table-cell[data-callout-column="oppositeSeal"]');
    expect(localSealCell?.textContent).toBe("—");
    expect(oppositeSealCell?.textContent).toBe("SEAL-A-222");
  });

  it("defaults malformed stored flags to unchecked", () => {
    localStorage.setItem(
      UI_PREFERENCES_STORAGE_KEY,
      JSON.stringify({ schemaVersion: 19, canvasCalloutEndpointReferences: { localConnection: "yes", oppositeSeal: 1 } })
    );
    renderAppWithState(createStateWithReferences());
    switchScreenDrawerAware("settings");
    const canvasSettingsPanel = getPanelByHeading("Canvas tools preferences");
    for (const label of Object.values(LABELS)) {
      expect(within(canvasSettingsPanel).getByLabelText(label)).not.toBeChecked();
    }
  });

  it("emits enabled reference fields in the SVG export without changing preferences", async () => {
    const originalCreateObjectUrl = Object.getOwnPropertyDescriptor(URL, "createObjectURL");
    const originalRevokeObjectUrl = Object.getOwnPropertyDescriptor(URL, "revokeObjectURL");
    let capturedSvgBlob: Blob | null = null;
    const createObjectUrl = vi.fn((value: Blob) => {
      capturedSvgBlob = value;
      return "blob:svg-export";
    });
    Object.defineProperty(URL, "createObjectURL", { configurable: true, writable: true, value: createObjectUrl });
    Object.defineProperty(URL, "revokeObjectURL", { configurable: true, writable: true, value: vi.fn() });
    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => undefined);

    try {
      renderAppWithState(createStateWithReferences());
      switchScreenDrawerAware("settings");
      const canvasSettingsPanel = getPanelByHeading("Canvas tools preferences");
      for (const label of Object.values(LABELS)) {
        fireEvent.click(within(canvasSettingsPanel).getByLabelText(label));
      }
      const storedBefore = readStoredPreferences().canvasCalloutEndpointReferences;

      const panel = showCallouts();
      openExportMenu(panel);
      await openSvgPreviewAndDownload(panel);
      await waitFor(() => {
        expect(createObjectUrl).toHaveBeenCalledTimes(1);
      });
      if (capturedSvgBlob === null) {
        throw new Error("Expected exported SVG blob.");
      }
      const exportedSvg = await readBlobAsText(capturedSvgBlob);
      for (const value of ["Local contact", "Local seal", "Opp. contact", "Opp. seal", "TERM-A-111", "SEAL-A-222", "TERM-B-333"]) {
        expect(exportedSvg).toContain(value);
      }
      expect(readStoredPreferences().canvasCalloutEndpointReferences).toEqual(storedBefore);
    } finally {
      clickSpy.mockRestore();
      if (originalCreateObjectUrl !== undefined) {
        Object.defineProperty(URL, "createObjectURL", originalCreateObjectUrl);
      }
      if (originalRevokeObjectUrl !== undefined) {
        Object.defineProperty(URL, "revokeObjectURL", originalRevokeObjectUrl);
      }
    }
  });
});
