import { fireEvent, waitFor, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { createUiIntegrationState, getPanelByHeading, renderAppWithState, switchScreen } from "./helpers/app-ui-test-utils";

const capture = vi.hoisted(() => ({
  workbookCalls: [] as Array<{ base: string; sheets: Array<{ name: string; rows: unknown[] }> }>
}));

vi.mock("../app/lib/tabularExport", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../app/lib/tabularExport")>();
  return {
    ...actual,
    downloadTabularWorkbookFile: vi.fn((base: string, sheets: Array<{ name: string; rows: unknown[] }>) => {
      capture.workbookCalls.push({ base, sheets });
      return Promise.resolve();
    })
  };
});

describe("App integration UI - grouped BOM export", () => {
  it("includes the wire list in the grouped BOM workbook and names the file after the selected network", async () => {
    capture.workbookCalls.length = 0;
    renderAppWithState(createUiIntegrationState());
    switchScreen("settings");

    const panel = getPanelByHeading("Import / Export networks");
    const selectedPackage = within(panel).getByLabelText("Selected networks export package");

    // Select the (single) network for grouped export.
    const networkCheckbox = panel.querySelector<HTMLInputElement>(
      ".settings-export-network-option input[type=\"checkbox\"]"
    );
    if (networkCheckbox === null) {
      throw new Error("Expected a network selection checkbox in the export package.");
    }
    fireEvent.click(networkCheckbox);

    const groupedBomButton = within(selectedPackage).getByRole("button", { name: "Export selected BOM (XLSX)" });
    expect(groupedBomButton).toBeEnabled();
    fireEvent.click(groupedBomButton);

    await waitFor(() => {
      expect(capture.workbookCalls.length).toBeGreaterThan(0);
    });

    const call = capture.workbookCalls[capture.workbookCalls.length - 1]!;
    // AC6: filename includes the user-visible network label, sanitized.
    expect(call.base).toBe("bom-main-network-sample");
    // AC7: grouped BOM package carries a wire-list sheet alongside the BOM sheets.
    const wireSheet = call.sheets.find((sheet) => sheet.name.endsWith("Wires"));
    expect(wireSheet).toBeDefined();
    expect(wireSheet?.rows.length ?? 0).toBeGreaterThan(0);
    // BOM sheets are still present (single-network BOM semantics unchanged).
    expect(call.sheets.some((sheet) => sheet.name.endsWith("BOM"))).toBe(true);
  });
});
