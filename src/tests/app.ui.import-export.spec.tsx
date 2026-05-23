import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
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

  it("keeps import/export content in compact two-column structure with import action under export actions", () => {
    renderAppWithState(createUiIntegrationState());
    switchScreen("settings");

    const panel = getPanelByHeading("Import / Export networks");
    expect(panel).toHaveClass("settings-panel--import-export");
    const grid = panel.querySelector(".settings-import-export-grid");
    expect(grid).not.toBeNull();

    const actionsColumn = panel.querySelector(".settings-import-export-actions-column");
    const selectionColumn = panel.querySelector(".settings-import-export-selection-column");
    expect(actionsColumn).not.toBeNull();
    expect(selectionColumn).not.toBeNull();

    const exportAllButton = within(actionsColumn as HTMLElement).getByRole("button", { name: "Export all" });
    const importButton = within(actionsColumn as HTMLElement).getByRole("button", { name: "Import from file" });
    expect(exportAllButton.compareDocumentPosition(importButton) & Node.DOCUMENT_POSITION_FOLLOWING).not.toBe(0);
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

    fireEvent.click(within(panel).getByText("Main network sample").closest("tr") as HTMLElement);
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

    await waitFor(() => {
      expect(
        within(panel).queryByText("Invalid JSON file.") ?? within(panel).getByText("Unable to read selected file.")
      ).toBeInTheDocument();
    });
    expect(store.getState().activeNetworkId).toBe(initialActiveNetworkId);
  });
});
