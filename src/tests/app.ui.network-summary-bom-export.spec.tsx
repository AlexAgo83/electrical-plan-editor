import { fireEvent, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { appActions, appReducer } from "../store";
import {
  asCatalogItemId,
  asConnectorId,
  asSpliceId,
  createUiIntegrationState,
  getPanelByHeading,
  renderAppWithState,
  switchScreenDrawerAware
} from "./helpers/app-ui-test-utils";

describe("App integration UI - network summary BOM export", () => {
  it("renders BOM to the right of PNG and uses the CSV export icon", () => {
    const catalogItemId = asCatalogItemId("CAT-BOM");
    const withCatalog = appReducer(
      appReducer(
        appReducer(
          createUiIntegrationState(),
          appActions.upsertCatalogItem({
            id: catalogItemId,
            manufacturerReference: "CAT-BOM",
            name: "Catalog BOM item",
            connectionCount: 2,
            unitPriceExclTax: 5
          })
        ),
        appActions.upsertConnector({
          id: asConnectorId("C1"),
          name: "Connector 1",
          technicalId: "C-1",
          cavityCount: 2,
          catalogItemId
        })
      ),
      appActions.upsertSplice({
        id: asSpliceId("S1"),
        name: "Splice 1",
        technicalId: "S-1",
        portCount: 2,
        catalogItemId
      })
    );

    const originalCreateObjectUrl = Object.getOwnPropertyDescriptor(URL, "createObjectURL");
    const originalRevokeObjectUrl = Object.getOwnPropertyDescriptor(URL, "revokeObjectURL");
    const createObjectUrl = vi.fn(() => "blob:bom");
    const revokeObjectUrl = vi.fn();
    Object.defineProperty(URL, "createObjectURL", { configurable: true, writable: true, value: createObjectUrl });
    Object.defineProperty(URL, "revokeObjectURL", { configurable: true, writable: true, value: revokeObjectUrl });
    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => undefined);

    try {
      renderAppWithState(withCatalog);
      switchScreenDrawerAware("modeling");

      const networkSummaryPanel = getPanelByHeading("Network summary");
      const exportPngButton = within(networkSummaryPanel).getByRole("button", { name: "PNG" });
      const exportBomButton = within(networkSummaryPanel).getByRole("button", { name: "BOM" });
      expect(within(networkSummaryPanel).queryByText(/BOM CSV pricing:/i)).toBeNull();
      expect(exportBomButton).not.toHaveAttribute("title");

      const actionButtons = Array.from(networkSummaryPanel.querySelectorAll("header .workspace-tab"));
      expect(actionButtons.indexOf(exportBomButton)).toBeGreaterThan(actionButtons.indexOf(exportPngButton));
      expect(exportBomButton.querySelector(".table-export-icon")).not.toBeNull();

      fireEvent.click(exportBomButton);
      expect(createObjectUrl).toHaveBeenCalledTimes(1);
      expect(clickSpy).toHaveBeenCalledTimes(1);
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

  it("keeps the BOM export button visible after changing currency and tax settings", () => {
    renderAppWithState(createUiIntegrationState());

    switchScreenDrawerAware("settings");
    const pricingSettingsPanel = getPanelByHeading("Catalog & BOM setup");
    fireEvent.change(within(pricingSettingsPanel).getByLabelText("Currency (Catalog/BOM)"), {
      target: { value: "GBP" }
    });
    fireEvent.click(within(pricingSettingsPanel).getByLabelText("Enable tax / VAT (TVA)"));

    switchScreenDrawerAware("modeling");
    const networkSummaryPanel = getPanelByHeading("Network summary");
    expect(within(networkSummaryPanel).queryByText(/BOM CSV pricing:/i)).toBeNull();
    expect(within(networkSummaryPanel).getByRole("button", { name: "BOM" })).toBeInTheDocument();
  });
});
