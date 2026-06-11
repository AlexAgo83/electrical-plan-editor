import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { NetworkId } from "../core/entities";
import { createEmptyNetworkScopedState } from "../store";
import { createUiIntegrationState, getPanelByHeading, renderAppWithState, switchScreen } from "./helpers/app-ui-test-utils";

describe("App integration UI - import/export", () => {
  it("reports export capability feedback from settings", () => {
    renderAppWithState(createUiIntegrationState());
    switchScreen("settings");

    const panel = getPanelByHeading("Import / Export networks");
    fireEvent.click(within(panel).getByRole("button", { name: "Export all" }));

    return waitFor(() => {
      expect(
        within(panel).queryByText(/Exported 1 network\(s\)/) ?? within(panel).getByText("Export is not available in this environment.")
      ).toBeInTheDocument();
    });
  });

  it("organizes import/export into a top JSON block, a selected-networks picker, and a three-block selected export package", () => {
    renderAppWithState(createUiIntegrationState());
    switchScreen("settings");

    const panel = getPanelByHeading("Import / Export networks");
    expect(panel).toHaveClass("settings-panel--import-export");
    const grid = panel.querySelector(".settings-import-export-grid");
    expect(grid).not.toBeNull();

    const actionsColumn = panel.querySelector(".settings-import-export-actions-column");
    const selectionColumn = panel.querySelector(".settings-import-export-selection-column");
    const selectedPackage = within(panel).getByLabelText("Selected networks export package");
    expect(actionsColumn).not.toBeNull();
    expect(selectionColumn).not.toBeNull();
    expect(selectedPackage).toHaveClass("settings-export-package-card--full");

    expect(within(actionsColumn as HTMLElement).getByRole("heading", { name: "Network JSON" })).toBeInTheDocument();
    expect(within(selectedPackage).getByRole("heading", { name: "Export selected" })).toBeInTheDocument();
    expect(within(selectedPackage).queryByRole("heading", { name: "Network JSON" })).toBeNull();
    expect(within(selectedPackage).getByRole("heading", { name: "BOM grouped" })).toBeInTheDocument();
    expect(within(selectedPackage).getByRole("heading", { name: "Wire list" })).toBeInTheDocument();
    expect(within(selectedPackage).getByRole("heading", { name: "Network plan" })).toBeInTheDocument();

    const exportAllButton = within(actionsColumn as HTMLElement).getByRole("button", { name: "Export all" });
    const selectedJsonButton = within(actionsColumn as HTMLElement).getByRole("button", { name: "Export selected JSON" });
    const importButton = within(actionsColumn as HTMLElement).getByRole("button", { name: "Import from file" });
    const groupedBomButton = within(selectedPackage).getByRole("button", { name: "Export selected BOM (XLSX)" });
    const groupedWireButton = within(selectedPackage).getByRole("button", { name: "Export selected wire list (XLSX)" });
    const groupedSvgButton = within(selectedPackage).getByRole("button", { name: "Export selected SVG" });
    const groupedPngButton = within(selectedPackage).getByRole("button", { name: "Export selected PNG" });
    const groupedPdfButton = within(selectedPackage).getByRole("button", { name: "Export selected PDF" });
    expect(exportAllButton.compareDocumentPosition(importButton) & Node.DOCUMENT_POSITION_FOLLOWING).not.toBe(0);
    expect(selectedJsonButton).toBeEnabled();
    const selectedBlocks = selectedPackage.querySelectorAll(".settings-export-option-group");
    expect(selectedBlocks).toHaveLength(3);
    expect(groupedWireButton.compareDocumentPosition(groupedBomButton) & Node.DOCUMENT_POSITION_FOLLOWING).not.toBe(0);
    expect(groupedSvgButton.compareDocumentPosition(groupedPngButton) & Node.DOCUMENT_POSITION_FOLLOWING).not.toBe(0);
    expect(groupedPngButton.compareDocumentPosition(groupedPdfButton) & Node.DOCUMENT_POSITION_FOLLOWING).not.toBe(0);
    expect(within(selectionColumn as HTMLElement).getByText("Selected networks for export")).toBeInTheDocument();
  });

  it("shows import next to export in Network Scope actions", async () => {
    renderAppWithState(createUiIntegrationState());
    switchScreen("networkScope");

    const panel = getPanelByHeading("Network Scope");
    const actionsRow = panel.querySelector(".network-scope-list-actions-row");
    expect(actionsRow).not.toBeNull();
    expect(within(actionsRow as HTMLElement).getAllByRole("button")).toHaveLength(5);

    const exportButton = within(actionsRow as HTMLElement).getByRole("button", { name: "Export" });
    const importButton = within(actionsRow as HTMLElement).getByRole("button", { name: "Import" });
    expect(exportButton).toBeDisabled();
    expect(exportButton.compareDocumentPosition(importButton) & Node.DOCUMENT_POSITION_FOLLOWING).not.toBe(0);
    expect(panel.querySelector('input[type="file"][accept="application/json,.json"]')).not.toBeNull();

    fireEvent.click(within(panel).getByText("Main network (Sample)").closest("tr") as HTMLElement);
    expect(exportButton).toBeEnabled();
    fireEvent.click(exportButton);
    expect(await screen.findByRole("dialog", { name: "Save selected network" })).toBeInTheDocument();
  });

  it("keeps active context stable when import file is invalid", async () => {
    const { store } = renderAppWithState(createUiIntegrationState());
    switchScreen("settings");
    const initialActiveNetworkId = store.getState().activeNetworkId;

    const panel = getPanelByHeading("Import / Export networks");
    const fileInput = panel.querySelector('input[type="file"]');
    expect(fileInput).not.toBeNull();

    const invalidFile = new File(["{bad-json"], "broken.json", { type: "application/json" });
    fireEvent.change(fileInput as HTMLInputElement, {
      target: { files: [invalidFile] }
    });

    const feedbackDialog = await screen.findByRole("dialog", { name: "Network import failed" });
    expect(within(feedbackDialog).getByText("The selected file is not a valid network export.")).toBeInTheDocument();
    expect(within(feedbackDialog).getByText("Invalid JSON file.")).toBeInTheDocument();
    fireEvent.click(within(feedbackDialog).getByRole("button", { name: "Close" }));

    await waitFor(() => {
      expect(
        within(panel).queryByText("Invalid JSON file.") ?? within(panel).getByText("Unable to read selected file.")
      ).toBeInTheDocument();
    });
    expect(store.getState().activeNetworkId).toBe(initialActiveNetworkId);
  });

  it("shows import warning details below the summary", async () => {
    const { store } = renderAppWithState(createUiIntegrationState());
    switchScreen("settings");
    const existing = store.getState();
    const activeNetworkId = existing.activeNetworkId;
    if (activeNetworkId === null) {
      throw new Error("Expected active network in import/export UI fixture.");
    }
    const activeNetwork = existing.networks.byId[activeNetworkId];
    if (activeNetwork === undefined) {
      throw new Error("Expected active network entity in import/export UI fixture.");
    }

    const payload = {
      schemaVersion: 3,
      exportedAt: "2026-05-27T10:00:00.000Z",
      source: {
        app: "electrical-plan-editor",
        appVersion: "test",
        appSchemaVersion: 3
      },
      networks: [
        {
          network: {
            id: activeNetwork.id,
            name: "Imported duplicate",
            technicalId: activeNetwork.technicalId,
            createdAt: "2026-05-27T09:00:00.000Z",
            updatedAt: "2026-05-27T09:00:00.000Z"
          },
          state: createEmptyNetworkScopedState()
        }
      ]
    };

    const panel = getPanelByHeading("Import / Export networks");
    const fileInput = panel.querySelector('input[type="file"]');
    expect(fileInput).not.toBeNull();
    fireEvent.change(fileInput as HTMLInputElement, {
      target: {
        files: [new File([JSON.stringify(payload)], "duplicate-network.json", { type: "application/json" })]
      }
    });

    const overwriteDialog = await screen.findByRole("dialog", { name: "Similar networks detected" });
    fireEvent.click(within(overwriteDialog).getByRole("radio", { name: "Keep both (rename incoming)" }));
    fireEvent.click(within(overwriteDialog).getByRole("button", { name: "Confirm" }));

    await waitFor(() => {
      expect(screen.queryByRole("dialog", { name: "Similar networks detected" })).not.toBeInTheDocument();
      expect(store.getState().networks.byId["network-main-import" as NetworkId]).toBeDefined();
      expect(within(panel).getByText("Warnings").closest(".meta-line")).toHaveTextContent("2");
    });

    const warningDetails = await within(panel).findByRole("status", { name: "Import warning details" });
    expect(within(warningDetails).getByText("Warning details")).toBeInTheDocument();
    expect(within(warningDetails).getByText(/Network ID 'network-main' was renamed to 'network-main-import' during import\./)).toBeInTheDocument();
    expect(within(warningDetails).getByText(/Network technical ID 'NET-MAIN-SAMPLE' was renamed to 'NET-MAIN-SAMPLE-IMP' during import\./)).toBeInTheDocument();
  });
});
