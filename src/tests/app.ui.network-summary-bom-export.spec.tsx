import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { appActions, appReducer } from "../store";
import {
  asCatalogItemId,
  asConnectorId,
  asSpliceId,
  asWireId,
  createUiIntegrationState,
  getPanelByHeading,
  renderAppWithState,
  switchScreenDrawerAware,
} from "./helpers/app-ui-test-utils";
import {
  findBomPreviewDialog,
  openExportMenu,
  selectBomPreviewSheet,
} from "./helpers/network-summary-export-test-utils";

describe("App integration UI - network summary BOM export", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders BOM to the right of SVG and uses the CSV export icon", async () => {
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
            unitPriceExclTax: 5,
          }),
        ),
        appActions.upsertConnector({
          id: asConnectorId("C1"),
          name: "Connector 1",
          technicalId: "C-1",
          cavityCount: 2,
          catalogItemId,
        }),
      ),
      appActions.upsertSplice({
        id: asSpliceId("S1"),
        name: "Splice 1",
        technicalId: "S-1",
        portCount: 2,
        catalogItemId,
      }),
    );

    const originalCreateObjectUrl = Object.getOwnPropertyDescriptor(
      URL,
      "createObjectURL",
    );
    const originalRevokeObjectUrl = Object.getOwnPropertyDescriptor(
      URL,
      "revokeObjectURL",
    );
    const createObjectUrl = vi.fn(() => "blob:bom");
    const revokeObjectUrl = vi.fn();
    Object.defineProperty(URL, "createObjectURL", {
      configurable: true,
      writable: true,
      value: createObjectUrl,
    });
    Object.defineProperty(URL, "revokeObjectURL", {
      configurable: true,
      writable: true,
      value: revokeObjectUrl,
    });
    const clickSpy = vi
      .spyOn(HTMLAnchorElement.prototype, "click")
      .mockImplementation(() => undefined);

    try {
      renderAppWithState(withCatalog);
      switchScreenDrawerAware("modeling");

      const networkSummaryPanel = getPanelByHeading("Network summary");
      expect(
        within(networkSummaryPanel).queryByText(/BOM CSV pricing:/i),
      ).toBeNull();

      // Compact BOM export columns is now a setting, not a header button
      switchScreenDrawerAware("settings");
      const bomSettingsPanel = getPanelByHeading("Catalog & BOM setup");
      expect(
        within(bomSettingsPanel).getByLabelText("Compact BOM export columns"),
      ).toBeInTheDocument();
      switchScreenDrawerAware("modeling");

      const refreshedNetworkSummaryPanel = getPanelByHeading("Network summary");
      openExportMenu(refreshedNetworkSummaryPanel);
      const exportSvgButton = within(refreshedNetworkSummaryPanel).getByRole(
        "button",
        { name: "SVG" },
      );
      const exportNetworkButton = within(
        refreshedNetworkSummaryPanel,
      ).getByRole("button", { name: "Network" });
      const exportBomButton = within(refreshedNetworkSummaryPanel).getByRole(
        "button",
        { name: "BOM" },
      );
      expect(exportSvgButton).toHaveTextContent("SVG");
      expect(exportNetworkButton).toBeEnabled();
      expect(
        exportBomButton.querySelector(".table-export-icon"),
      ).not.toBeNull();

      fireEvent.click(exportBomButton);
      expect(createObjectUrl).not.toHaveBeenCalled();
      expect(clickSpy).not.toHaveBeenCalled();

      expect(
        await screen.findByRole("dialog", { name: "Preparing BOM preview" }),
      ).toBeInTheDocument();
      const previewDialog = await findBomPreviewDialog();
      expect(within(previewDialog).getByText("Items")).toBeInTheDocument();
      expect(within(previewDialog).getAllByText("1").length).toBeGreaterThan(0);
      expect(within(previewDialog).getByText("CSV")).toBeInTheDocument();
      expect(within(previewDialog).getByText("CAT-BOM")).toBeInTheDocument();
      fireEvent.click(
        within(previewDialog).getByRole("button", { name: "Download CSV" }),
      );
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
    fireEvent.change(
      within(pricingSettingsPanel).getByLabelText("Currency (Catalog/BOM)"),
      {
        target: { value: "GBP" },
      },
    );
    fireEvent.click(
      within(pricingSettingsPanel).getByLabelText("Enable tax / VAT (TVA)"),
    );

    switchScreenDrawerAware("modeling");
    const networkSummaryPanel = getPanelByHeading("Network summary");
    expect(
      within(networkSummaryPanel).queryByText(/BOM CSV pricing:/i),
    ).toBeNull();
    openExportMenu(networkSummaryPanel);
    expect(
      within(networkSummaryPanel).getByRole("button", { name: "BOM" }),
    ).toBeInTheDocument();
  });

  it("exports the active network from the Network Summary export menu", async () => {
    const originalCreateObjectUrl = Object.getOwnPropertyDescriptor(
      URL,
      "createObjectURL",
    );
    const originalRevokeObjectUrl = Object.getOwnPropertyDescriptor(
      URL,
      "revokeObjectURL",
    );
    const createObjectUrl = vi.fn(() => "blob:network-summary-network-export");
    Object.defineProperty(URL, "createObjectURL", {
      configurable: true,
      writable: true,
      value: createObjectUrl,
    });
    Object.defineProperty(URL, "revokeObjectURL", {
      configurable: true,
      writable: true,
      value: vi.fn(),
    });
    const clickSpy = vi
      .spyOn(HTMLAnchorElement.prototype, "click")
      .mockImplementation(() => undefined);

    try {
      renderAppWithState(createUiIntegrationState());
      switchScreenDrawerAware("modeling");

      const networkSummaryPanel = getPanelByHeading("Network summary");
      openExportMenu(networkSummaryPanel);
      fireEvent.click(
        within(networkSummaryPanel).getByRole("button", { name: "Network" }),
      );

      const confirmDialog = await screen.findByRole("dialog", {
        name: "Save active network",
      });
      expect(
        within(confirmDialog).getByText(/electrical-network-active-.*\.json/i),
      ).toBeInTheDocument();
      fireEvent.click(
        within(confirmDialog).getByRole("button", { name: "Save" }),
      );

      await waitFor(() => {
        expect(clickSpy).toHaveBeenCalledTimes(1);
      });
      expect(createObjectUrl).toHaveBeenCalledTimes(1);
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

  it("cancels BOM preview without downloading", async () => {
    const catalogItemId = asCatalogItemId("CAT-BOM-CANCEL");
    const withCatalog = appReducer(
      appReducer(
        createUiIntegrationState(),
        appActions.upsertCatalogItem({
          id: catalogItemId,
          manufacturerReference: "CAT-BOM-CANCEL",
          name: "Catalog BOM cancel item",
          connectionCount: 2,
          unitPriceExclTax: 5,
        }),
      ),
      appActions.upsertConnector({
        id: asConnectorId("C-BOM-CANCEL"),
        name: "Connector cancel",
        technicalId: "C-BOM-CANCEL",
        cavityCount: 2,
        catalogItemId,
      }),
    );
    const originalCreateObjectUrl = Object.getOwnPropertyDescriptor(
      URL,
      "createObjectURL",
    );
    const originalRevokeObjectUrl = Object.getOwnPropertyDescriptor(
      URL,
      "revokeObjectURL",
    );
    const createObjectUrl = vi.fn(() => "blob:bom-cancel");
    Object.defineProperty(URL, "createObjectURL", {
      configurable: true,
      writable: true,
      value: createObjectUrl,
    });
    Object.defineProperty(URL, "revokeObjectURL", {
      configurable: true,
      writable: true,
      value: vi.fn(),
    });
    const clickSpy = vi
      .spyOn(HTMLAnchorElement.prototype, "click")
      .mockImplementation(() => undefined);

    try {
      renderAppWithState(withCatalog);
      switchScreenDrawerAware("modeling");

      const networkSummaryPanel = getPanelByHeading("Network summary");
      openExportMenu(networkSummaryPanel);
      fireEvent.click(
        within(networkSummaryPanel).getByRole("button", { name: "BOM" }),
      );

      const previewDialog = await findBomPreviewDialog();
      fireEvent.click(
        within(previewDialog).getByRole("button", { name: "Cancel" }),
      );

      expect(screen.queryByRole("dialog", { name: "BOM preview" })).toBeNull();
      expect(createObjectUrl).not.toHaveBeenCalled();
      expect(clickSpy).not.toHaveBeenCalled();
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

  it("shows XLSX workbook sheets as BOM preview tabs", async () => {
    const catalogItemId = asCatalogItemId("CAT-BOM-XLSX");
    const withCatalog = appReducer(
      appReducer(
        createUiIntegrationState(),
        appActions.upsertCatalogItem({
          id: catalogItemId,
          manufacturerReference: "CAT-BOM-XLSX",
          name: "Catalog BOM XLSX item",
          connectionCount: 2,
          unitPriceExclTax: 5,
        }),
      ),
      appActions.upsertConnector({
        id: asConnectorId("C-BOM-XLSX"),
        name: "Connector XLSX",
        technicalId: "C-BOM-XLSX",
        cavityCount: 2,
        catalogItemId,
      }),
    );

    renderAppWithState(withCatalog);

    switchScreenDrawerAware("settings");
    const pricingSettingsPanel = getPanelByHeading("Catalog & BOM setup");
    fireEvent.change(
      within(pricingSettingsPanel).getByLabelText("Tabular export format"),
      {
        target: { value: "xlsx" },
      },
    );

    switchScreenDrawerAware("modeling");
    const networkSummaryPanel = getPanelByHeading("Network summary");
    openExportMenu(networkSummaryPanel);
    fireEvent.click(
      within(networkSummaryPanel).getByRole("button", { name: "BOM" }),
    );

    const previewDialog = await findBomPreviewDialog();
    expect(within(previewDialog).getByText("XLSX")).toBeInTheDocument();
    expect(within(previewDialog).getByText("Sheets")).toBeInTheDocument();
    expect(within(previewDialog).getAllByText("2").length).toBeGreaterThan(0);
    expect(
      within(previewDialog).getByRole("tab", { name: /Network BOM/ }),
    ).toHaveAttribute("aria-selected", "true");
    await selectBomPreviewSheet(previewDialog, /By connector/);
    expect(within(previewDialog).getByText("Connector ID")).toBeInTheDocument();
    expect(within(previewDialog).getByText("C-BOM-XLSX")).toBeInTheDocument();
  });

  it("opens connectors from the BOM preview By connector sheet", async () => {
    const catalogItemId = asCatalogItemId("CAT-BOM-CONNECTOR-LINK");
    const withCatalog = appReducer(
      appReducer(
        createUiIntegrationState(),
        appActions.upsertCatalogItem({
          id: catalogItemId,
          manufacturerReference: "CAT-BOM-CONNECTOR-LINK",
          name: "Catalog BOM connector link item",
          connectionCount: 2,
        }),
      ),
      appActions.upsertConnector({
        id: asConnectorId("C-BOM-CONNECTOR-LINK"),
        name: "Connector BOM Link",
        technicalId: "CONN-BOM-LINK",
        cavityCount: 2,
        catalogItemId,
      }),
    );

    renderAppWithState(withCatalog);

    switchScreenDrawerAware("settings");
    const pricingSettingsPanel = getPanelByHeading("Catalog & BOM setup");
    fireEvent.change(
      within(pricingSettingsPanel).getByLabelText("Tabular export format"),
      {
        target: { value: "xlsx" },
      },
    );

    switchScreenDrawerAware("modeling");
    const networkSummaryPanel = getPanelByHeading("Network summary");
    openExportMenu(networkSummaryPanel);
    fireEvent.click(
      within(networkSummaryPanel).getByRole("button", { name: "BOM" }),
    );

    const previewDialog = await findBomPreviewDialog();
    await selectBomPreviewSheet(previewDialog, /By connector/);
    fireEvent.click(
      within(previewDialog).getByRole("button", { name: "CONN-BOM-LINK" }),
    );

    expect(screen.queryByRole("dialog", { name: "BOM preview" })).toBeNull();
    const editConnectorPanel = getPanelByHeading("Edit Connector");
    expect(
      within(editConnectorPanel).getByLabelText("Technical ID"),
    ).toHaveValue("CONN-BOM-LINK");
  });

  it("opens catalog entries from BOM preview manufacturer references", async () => {
    const catalogItemId = asCatalogItemId("CAT-BOM-LINK");
    const withCatalog = appReducer(
      appReducer(
        createUiIntegrationState(),
        appActions.upsertCatalogItem({
          id: catalogItemId,
          manufacturerReference: "CAT-BOM-LINK",
          name: "Catalog BOM linked item",
          connectionCount: 2,
          unitPriceExclTax: 5,
        }),
      ),
      appActions.upsertConnector({
        id: asConnectorId("C-BOM-LINK"),
        name: "Connector link",
        technicalId: "C-BOM-LINK",
        cavityCount: 2,
        catalogItemId,
      }),
    );

    renderAppWithState(withCatalog);
    switchScreenDrawerAware("modeling");

    const networkSummaryPanel = getPanelByHeading("Network summary");
    openExportMenu(networkSummaryPanel);
    fireEvent.click(
      within(networkSummaryPanel).getByRole("button", { name: "BOM" }),
    );

    const previewDialog = await findBomPreviewDialog();
    fireEvent.click(
      within(previewDialog).getByRole("button", { name: "CAT-BOM-LINK" }),
    );

    expect(screen.queryByRole("dialog", { name: "BOM preview" })).toBeNull();
    const editCatalogPanel = getPanelByHeading("Edit catalog item");
    expect(
      within(editCatalogPanel).getByLabelText("Manufacturer reference"),
    ).toHaveValue("CAT-BOM-LINK");
  });

  it("keeps wire termination references in the BOM preview as non-navigation text", async () => {
    const baseState = createUiIntegrationState();
    const baseWire = baseState.wires.byId[asWireId("W1")];
    if (baseWire === undefined) {
      throw new Error("Expected wire W1 in integration state.");
    }

    const catalogItemId = asCatalogItemId("CAT-TERM-REF");
    const withMatchingTerminationReference = appReducer(
      appReducer(
        baseState,
        appActions.upsertCatalogItem({
          id: catalogItemId,
          manufacturerReference: "TERM-NOT-CATALOG-LINK",
          name: "Catalog with matching termination text",
          connectionCount: 2,
        }),
      ),
      appActions.upsertWire({
        ...baseWire,
        endpointAConnectionReference: "TERM-NOT-CATALOG-LINK",
      }),
    );

    renderAppWithState(withMatchingTerminationReference);
    switchScreenDrawerAware("modeling");

    const networkSummaryPanel = getPanelByHeading("Network summary");
    openExportMenu(networkSummaryPanel);
    fireEvent.click(
      within(networkSummaryPanel).getByRole("button", { name: "BOM" }),
    );

    const previewDialog = await findBomPreviewDialog();
    expect(
      within(previewDialog).getAllByText("TERM-NOT-CATALOG-LINK").length,
    ).toBeGreaterThan(0);
    expect(
      within(previewDialog).queryByRole("button", {
        name: "TERM-NOT-CATALOG-LINK",
      }),
    ).toBeNull();
  });
});
