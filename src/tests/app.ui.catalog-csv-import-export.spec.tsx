import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CATALOG_CSV_HEADERS } from "../app/lib/catalogCsv";
import { appActions, appReducer } from "../store";
import {
  asCatalogItemId,
  createUiIntegrationState,
  getPanelByHeading,
  renderAppWithState,
  switchScreenDrawerAware
} from "./helpers/app-ui-test-utils";

describe("App integration UI - catalog CSV import/export", () => {
  const originalCreateObjectUrl = Object.getOwnPropertyDescriptor(URL, "createObjectURL");
  const originalRevokeObjectUrl = Object.getOwnPropertyDescriptor(URL, "revokeObjectURL");

  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    if (originalCreateObjectUrl !== undefined) {
      Object.defineProperty(URL, "createObjectURL", originalCreateObjectUrl);
    }
    if (originalRevokeObjectUrl !== undefined) {
      Object.defineProperty(URL, "revokeObjectURL", originalRevokeObjectUrl);
    }
  });

  it("exposes catalog CSV controls and imports rows atomically while staying on catalog sub-screen", async () => {
    const state = appReducer(
      createUiIntegrationState(),
      appActions.upsertCatalogItem({
        id: asCatalogItemId("CAT-1"),
        manufacturerReference: "REF-1",
        connectionCount: 2,
        name: "Original item"
      })
    );
    const { store } = renderAppWithState(state);
    fireEvent.click(screen.getByRole("button", { name: "Close onboarding" }));
    switchScreenDrawerAware("modeling");

    const secondaryNavRow = document.querySelector(".workspace-nav-row.secondary");
    expect(secondaryNavRow).not.toBeNull();
    fireEvent.click(within(secondaryNavRow as HTMLElement).getByRole("button", { name: /^Catalog$/, hidden: true }));

    let catalogPanel = getPanelByHeading("Catalog");
    expect(catalogPanel).not.toHaveAttribute("hidden");

    const headerToolsRows = catalogPanel.querySelectorAll(".list-panel-header-tools-row");
    expect(headerToolsRows.length).toBeGreaterThan(0);
    const headerButtons = within(headerToolsRows[0] as HTMLElement).getAllByRole("button");
    expect(headerButtons.map((button) => button.textContent?.trim() ?? "")).toEqual(["Export CSV", "Help"]);
    const exportButton = within(headerToolsRows[0] as HTMLElement).getByRole("button", { name: "Export CSV" });
    expect(exportButton).toHaveClass("onboarding-help-button");
    expect(exportButton.querySelector(".table-export-icon")).not.toBeNull();

    const actionsRow = catalogPanel.querySelector(".row-actions.compact.modeling-list-actions");
    expect(actionsRow).not.toBeNull();
    const actionButtons = within(actionsRow as HTMLElement).getAllByRole("button");
    expect(actionButtons.map((button) => button.textContent?.trim() ?? "")).toEqual(["New", "Import CSV", "Edit", "Delete"]);

    Object.defineProperty(URL, "createObjectURL", {
      configurable: true,
      writable: true,
      value: vi.fn(() => "blob:catalog-export")
    });
    Object.defineProperty(URL, "revokeObjectURL", {
      configurable: true,
      writable: true,
      value: vi.fn()
    });
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => undefined);
    fireEvent.click(exportButton);
    expect(within(catalogPanel).getByText("Exported 1 catalog item(s).")).toBeInTheDocument();

    const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(true);
    const fileInput = catalogPanel.querySelector('input[type="file"][accept="text/csv,.csv"]');
    expect(fileInput).not.toBeNull();

    const csvText = [
      CATALOG_CSV_HEADERS.join(","),
      "REF-1,4,Updated item,1.25,https://example.com/ref-1",
      "REF-2,3,New item,2.00,https://example.com/ref-2",
      "REF-2,5,New item override,2.50,https://example.com/ref-2b"
    ].join("\r\n");
    const file = new File([csvText], "catalog-import.csv", { type: "text/csv" });
    Object.defineProperty(file, "text", {
      configurable: true,
      value: vi.fn().mockResolvedValue(csvText)
    });
    fireEvent.change(fileInput as HTMLInputElement, {
      target: { files: [file] }
    });

    await waitFor(() => {
      catalogPanel = getPanelByHeading("Catalog");
      expect(within(catalogPanel).getByText("Imported 2 catalog row(s): 1 created / 1 updated.")).toBeInTheDocument();
    });

    expect(confirmSpy).toHaveBeenCalledTimes(1);
    expect(catalogPanel).not.toHaveAttribute("hidden");
    expect(
      within(catalogPanel).getByText(/Last catalog CSV import \(catalog-import\.csv\): 2 rows, 1 warnings, 0 errors\./)
    ).toBeInTheDocument();
    expect(within(catalogPanel).getByText("REF-1")).toBeInTheDocument();
    expect(within(catalogPanel).getByText("REF-2")).toBeInTheDocument();

    const catalogByRef = Object.values(store.getState().catalogItems.byId).reduce<Record<string, { connectionCount: number; name?: string }>>(
      (accumulator, item) => {
        if (item !== undefined) {
          accumulator[item.manufacturerReference] = {
            connectionCount: item.connectionCount,
            name: item.name
          };
        }
        return accumulator;
      },
      {}
    );
    expect(catalogByRef["REF-1"]).toEqual({
      connectionCount: 4,
      name: "Updated item"
    });
    expect(catalogByRef["REF-2"]).toEqual({
      connectionCount: 5,
      name: "New item override"
    });
  });
});
