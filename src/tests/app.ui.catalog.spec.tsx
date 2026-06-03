import { act, fireEvent, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { appActions, appReducer, createInitialState } from "../store";
import {
  asCatalogItemId,
  asConnectorId,
  asSpliceId,
  asWireId,
  createUiIntegrationState,
  getPanelByHeading,
  renderAppWithState,
  switchScreenDrawerAware,
  switchSubScreenDrawerAware
} from "./helpers/app-ui-test-utils";
import { getConnectorLayoutKeyingControls, getConnectorLayoutKeyingRow } from "./helpers/app-ui-form-test-utils";

describe("App integration UI - catalog", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("enforces catalog-first connector creation and supports catalog creation with URL validation", () => {
    const { store } = renderAppWithState(createInitialState());
    fireEvent.click(screen.getByRole("button", { name: "Close onboarding" }));
    switchScreenDrawerAware("modeling");

    const connectorsPanel = getPanelByHeading("Connectors");
    fireEvent.click(within(connectorsPanel).getByRole("button", { name: "New" }));

    let connectorFormPanel = getPanelByHeading("Create Connector");
    expect(
      within(connectorFormPanel).getAllByText("Create a catalog item first to define manufacturer reference and connection count.")
    ).toHaveLength(2);
    expect(within(connectorFormPanel).getByRole("button", { name: "Create" })).toBeDisabled();

    fireEvent.click(within(connectorFormPanel).getByRole("button", { name: "Open Catalog" }));
    expect(getPanelByHeading("Catalog")).toBeInTheDocument();
    const catalogPanel = getPanelByHeading("Catalog");
    fireEvent.click(within(catalogPanel).getByRole("button", { name: "Create catalog item" }));

    const catalogFormPanel = getPanelByHeading("Create catalog item");
    fireEvent.change(within(catalogFormPanel).getByLabelText("Manufacturer reference"), {
      target: { value: "TE-1-967616-1" }
    });
    fireEvent.change(within(catalogFormPanel).getByLabelText("Connection count"), {
      target: { value: "6" }
    });
    fireEvent.change(within(catalogFormPanel).getByLabelText("URL"), {
      target: { value: "not-a-url" }
    });
    expect(screen.queryByRole("heading", { name: "Connector material defaults" })).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Connector physical layout" })).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Additional accessories" })).not.toBeInTheDocument();
    fireEvent.click(within(catalogFormPanel).getByLabelText("Additional accessories"));
    const catalogAccessoriesPanel = getPanelByHeading("Additional accessories");
    expect(catalogAccessoriesPanel).toHaveClass("catalog-accessories-panel");
    expect(within(catalogAccessoriesPanel).getByRole("button", { name: "Create" })).toBeDisabled();
    fireEvent.click(within(catalogFormPanel).getByLabelText("Connector material defaults"));
    const catalogMaterialPanel = getPanelByHeading("Connector material defaults");
    expect(catalogMaterialPanel).toHaveClass("catalog-material-defaults-panel");
    expect(within(catalogMaterialPanel).getByRole("button", { name: "Create" })).toBeDisabled();
    fireEvent.click(within(catalogFormPanel).getByLabelText("Connector physical layout"));
    const catalogLayoutPanel = getPanelByHeading("Connector physical layout");
    expect(catalogLayoutPanel).toHaveClass("catalog-connector-layout-panel");
    expect(within(catalogLayoutPanel).getByRole("button", { name: "Create" })).toBeDisabled();
    expect(within(catalogLayoutPanel).getByRole("heading", { name: "Global layout" })).toBeInTheDocument();
    expect(within(catalogLayoutPanel).getByText("6 ways").closest(".connector-layout-control-card-header")).not.toBeNull();
    expect(within(catalogLayoutPanel).getByLabelText("Border shape")).toHaveValue("square");
    fireEvent.change(within(catalogLayoutPanel).getByLabelText("Border shape"), {
      target: { value: "circle" }
    });
    expect(within(catalogLayoutPanel).getByLabelText("Border shape")).toHaveValue("circle");
    expect(within(catalogLayoutPanel).getByRole("button", { name: "Global layout" })).toHaveAttribute("aria-pressed", "true");
    expect(within(catalogLayoutPanel).getByRole("button", { name: "Selected way" })).toHaveAttribute("aria-pressed", "false");
    expect(within(catalogLayoutPanel).queryByText("No keying features.")).not.toBeInTheDocument();
    fireEvent.click(within(catalogLayoutPanel).getByRole("button", { name: "Keying features" }));
    expect(within(catalogLayoutPanel).getByText("No keying features.")).toBeInTheDocument();
    fireEvent.click(within(catalogLayoutPanel).getByRole("button", { name: "Add keying" }));
    const { placementSelect, shapeSelect, colorInput, positionSlider, scaleInput } = getConnectorLayoutKeyingControls(
      getConnectorLayoutKeyingRow(catalogLayoutPanel)
    );
    expect(placementSelect).toHaveValue("guided");
    expect(shapeSelect).toHaveValue("arrow");
    fireEvent.change(shapeSelect, {
      target: { value: "round" }
    });
    expect(shapeSelect).toHaveValue("round");
    expect(colorInput).toHaveAttribute("type", "color");
    fireEvent.change(colorInput, {
      target: { value: "#ff8800" }
    });
    expect(colorInput).toHaveValue("#ff8800");
    expect(within(catalogLayoutPanel).queryByRole("button", { name: "Theme color" })).not.toBeInTheDocument();
    expect(positionSlider).toHaveValue("0.4");
    expect(scaleInput).toHaveValue("1");
    fireEvent.change(scaleInput, {
      target: { value: "1.45" }
    });
    expect(scaleInput).toHaveValue("1.45");
    fireEvent.click(within(catalogLayoutPanel).getByRole("button", { name: "Remove" }));
    expect(within(catalogLayoutPanel).getByText("No keying features.")).toBeInTheDocument();
    fireEvent.click(within(catalogLayoutPanel).getByRole("button", { name: "Selected way" }));
    expect(within(catalogLayoutPanel).getByRole("heading", { name: "Selected way" })).toBeInTheDocument();
    expect(
      catalogLayoutPanel.querySelector(".connector-layout-control-card-selected .connector-layout-control-card-header span")
        ?.textContent
    ).toBe("C1");
    expect(within(catalogFormPanel).getByText("Use an absolute http/https URL.")).toBeInTheDocument();
    expect(within(catalogFormPanel).getByRole("button", { name: "Create" })).toBeDisabled();

    fireEvent.change(within(catalogFormPanel).getByLabelText("URL"), {
      target: { value: "https://example.com/te-1-967616-1" }
    });
    fireEvent.click(within(catalogLayoutPanel).getByRole("button", { name: "Global layout" }));
    fireEvent.click(within(catalogLayoutPanel).getByRole("button", { name: "Auto layout" }));
    fireEvent.click(within(catalogLayoutPanel).getByRole("button", { name: "Create" }));

    expect(within(catalogPanel).getByText("TE-1-967616-1")).toBeInTheDocument();
    const createdCatalogItem = store
      .getState()
      .catalogItems.allIds.map((id) => store.getState().catalogItems.byId[id])
      .find((item) => item?.manufacturerReference === "TE-1-967616-1");
    expect(createdCatalogItem?.connectorLayout?.ways).toHaveLength(6);
    fireEvent.click(within(catalogPanel).getByText("TE-1-967616-1"));
    const catalogAnalysisGrid = screen.getByRole("heading", { name: "Used by" }).closest(".analysis-panel-grid");
    expect(catalogAnalysisGrid).not.toBeNull();
    const connectorsUsageHeading = within(catalogAnalysisGrid as HTMLElement).getByRole("heading", { name: "Used by" });
    const connectorsUsagePanel = connectorsUsageHeading.closest(".panel");
    expect(connectorsUsagePanel).not.toBeNull();
    expect(within(connectorsUsagePanel as HTMLElement).getByRole("button", { name: /^Connectors\s+0$/ })).toHaveAttribute(
      "aria-pressed",
      "true"
    );
    fireEvent.click(within(connectorsUsagePanel as HTMLElement).getByRole("button", { name: "Create Connector" }));

    connectorFormPanel = getPanelByHeading("Create Connector");
    expect(within(connectorFormPanel).getByDisplayValue(/TE-1-967616-1 \(6\)/)).toBeInTheDocument();
    expect(within(connectorFormPanel).getByRole("button", { name: "Manufacturer reference: TE-1-967616-1" })).toBeInTheDocument();
    expect(within(connectorFormPanel).getByLabelText("Way count (from catalog)")).toHaveValue(6);
    expect(within(connectorFormPanel).queryByText("Catalog material application")).not.toBeInTheDocument();

    fireEvent.change(within(connectorFormPanel).getByLabelText("Functional name"), {
      target: { value: "Catalog-first connector" }
    });
    fireEvent.change(within(connectorFormPanel).getByLabelText("Technical ID"), {
      target: { value: "C-CAT-1" }
    });
    fireEvent.click(within(connectorFormPanel).getByRole("button", { name: "Create" }));

    const refreshedConnectorsPanel = getPanelByHeading("Connectors");
    expect(within(refreshedConnectorsPanel).getByText("Catalog-first connector")).toBeInTheDocument();
    expect(getPanelByHeading("Edit Connector")).toBeInTheDocument();
  });

  it("shows catalog analysis usage sections and navigates to linked connector/splice editing", () => {
    const catalogItemId = asCatalogItemId("CAT-ANALYSIS");
    let state = appReducer(
      createUiIntegrationState(),
      appActions.upsertCatalogItem({
        id: catalogItemId,
        manufacturerReference: "CAT-ANALYSIS",
        name: "Analysis sample item",
        connectionCount: 2,
        unitPriceExclTax: 3.5
      })
    );
    state = appReducer(
      state,
      appActions.upsertConnector({
        id: asConnectorId("C1"),
        name: "Connector 1",
        technicalId: "C-1",
        cavityCount: 2,
        catalogItemId
      })
    );
    state = appReducer(
      state,
      appActions.upsertSplice({
        id: asSpliceId("S1"),
        name: "Splice 1",
        technicalId: "S-1",
        portCount: 2,
        catalogItemId
      })
    );
    state = appReducer(
      state,
      appActions.upsertWire({
        ...state.wires.byId[asWireId("W1")]!,
        endpointBSealReference: "SEAL-1"
      })
    );

    renderAppWithState(state);
    fireEvent.click(screen.getByRole("button", { name: "Close onboarding" }));
    switchScreenDrawerAware("modeling");

    const secondaryNavRow = document.querySelector(".workspace-nav-row.secondary");
    expect(secondaryNavRow).not.toBeNull();
    fireEvent.click(within(secondaryNavRow as HTMLElement).getByRole("button", { name: /^Catalog$/, hidden: true }));

    const catalogPanel = getPanelByHeading("Catalog");
    fireEvent.click(within(catalogPanel).getByText("CAT-ANALYSIS"));
    expect(within(catalogPanel).getByRole("button", { name: "Delete" })).toBeEnabled();

    expect(screen.queryByRole("heading", { name: "Catalog analysis" })).not.toBeInTheDocument();
    const catalogAnalysisGrid = screen.getByRole("heading", { name: "Used by" }).closest(".analysis-panel-grid");
    expect(catalogAnalysisGrid).not.toBeNull();
    const usagePanel = within(catalogAnalysisGrid as HTMLElement).getByRole("heading", { name: "Used by" }).closest(".panel");
    expect(usagePanel).not.toBeNull();
    expect(within(usagePanel as HTMLElement).getByRole("button", { name: /^Connectors\s+1$/ })).toHaveAttribute(
      "aria-pressed",
      "true"
    );
    expect(within(usagePanel as HTMLElement).getByRole("button", { name: /^Splices\s+1$/ })).toHaveAttribute(
      "aria-pressed",
      "false"
    );
    fireEvent.click(within(catalogPanel).getByRole("button", { name: "Seal refs" }));
    expect(
      within(catalogPanel).getByRole("textbox", { name: "Wire seal references name for SEAL-1" })
    ).toHaveClass("data-table-text-input");
    expect(
      within(catalogPanel)
        .getByRole("textbox", { name: "Wire seal references name for SEAL-1" })
        .closest("tr")
    ).toHaveClass("data-table-editable-row");
    expect(screen.queryByRole("heading", { name: "Edit catalog item" })).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Used by" })).not.toBeInTheDocument();
    fireEvent.click(within(catalogPanel).getByRole("button", { name: "Items" }));

    const refreshedCatalogAnalysisGrid = screen.getByRole("heading", { name: "Used by" }).closest(".analysis-panel-grid");
    expect(refreshedCatalogAnalysisGrid).not.toBeNull();
    const splicesUsageHeading = within(refreshedCatalogAnalysisGrid as HTMLElement).getByRole("heading", { name: "Used by" });
    const splicesUsagePanel = splicesUsageHeading.closest(".panel");
    expect(splicesUsagePanel).not.toBeNull();
    fireEvent.click(within(splicesUsagePanel as HTMLElement).getByRole("button", { name: /^Splices\s+1$/ }));
    expect(within(splicesUsagePanel as HTMLElement).getByText("Splice 1")).toBeInTheDocument();
    fireEvent.click(within(splicesUsagePanel as HTMLElement).getByRole("button", { name: "Go to" }));
    expect(getPanelByHeading("Edit Splice")).toBeInTheDocument();

    fireEvent.click(within(secondaryNavRow as HTMLElement).getByRole("button", { name: /^Catalog$/, hidden: true }));
    fireEvent.click(within(getPanelByHeading("Catalog")).getByText("CAT-ANALYSIS"));
    const refreshedAnalysisGrid = screen.getByRole("heading", { name: "Used by" }).closest(".analysis-panel-grid");
    expect(refreshedAnalysisGrid).not.toBeNull();
    const connectorsUsageHeading = within(refreshedAnalysisGrid as HTMLElement).getByRole("heading", { name: "Used by" });
    const connectorsUsagePanel = connectorsUsageHeading.closest(".panel");
    expect(connectorsUsagePanel).not.toBeNull();
    fireEvent.click(within(connectorsUsagePanel as HTMLElement).getByRole("button", { name: /^Connectors\s+1$/ }));
    expect(within(connectorsUsagePanel as HTMLElement).getByText("Connector 1")).toBeInTheDocument();
    fireEvent.click(within(connectorsUsagePanel as HTMLElement).getByRole("button", { name: "Go to" }));
    expect(getPanelByHeading("Edit Connector")).toBeInTheDocument();
  });

  it("edits additional accessories on catalog items", () => {
    const { store } = renderAppWithState(createInitialState());
    fireEvent.click(screen.getByRole("button", { name: "Close onboarding" }));
    switchScreenDrawerAware("modeling");
    switchSubScreenDrawerAware("catalog");

    const catalogPanel = getPanelByHeading("Catalog");
    fireEvent.click(within(catalogPanel).getByRole("button", { name: "Create catalog item" }));
    const catalogFormPanel = getPanelByHeading("Create catalog item");

    fireEvent.change(within(catalogFormPanel).getByLabelText("Manufacturer reference"), {
      target: { value: "CAT-ACCESSORY" }
    });
    fireEvent.change(within(catalogFormPanel).getByLabelText("Connection count"), {
      target: { value: "2" }
    });
    expect(screen.queryByRole("heading", { name: "Additional accessories" })).not.toBeInTheDocument();
    fireEvent.click(within(catalogFormPanel).getByLabelText("Additional accessories"));
    const catalogAccessoriesPanel = getPanelByHeading("Additional accessories");
    fireEvent.click(within(catalogAccessoriesPanel).getByRole("button", { name: "Add additional accessory" }));
    fireEvent.change(within(catalogAccessoriesPanel).getByLabelText("Accessory reference"), {
      target: { value: "LOCK-1" }
    });
    fireEvent.change(within(catalogAccessoriesPanel).getByLabelText("Accessory name"), {
      target: { value: "Secondary lock" }
    });
    fireEvent.click(within(catalogAccessoriesPanel).getByRole("button", { name: "Create" }));

    const saved = Object.values(store.getState().catalogItems.byId).find(
      (item) => item?.manufacturerReference === "CAT-ACCESSORY"
    );
    expect(saved?.additionalAccessories).toEqual([{ accessoryReference: "LOCK-1", accessoryName: "Secondary lock" }]);

    fireEvent.click(within(catalogFormPanel).getByLabelText("Additional accessories"));
    fireEvent.click(within(catalogFormPanel).getByRole("button", { name: "Save" }));
    expect(store.getState().catalogItems.byId[saved!.id]?.additionalAccessories).toBeUndefined();
  });

  it("preserves the selected catalog table view when returning to catalog", () => {
    const catalogItemId = asCatalogItemId("CAT-MFR-LINK");
    let state = appReducer(
      createUiIntegrationState(),
      appActions.upsertCatalogItem({
        id: catalogItemId,
        manufacturerReference: "CAT-MFR-LINK",
        name: "Manufacturer link sample",
        connectionCount: 2
      })
    );
    state = appReducer(
      state,
      appActions.upsertConnector({
        ...state.connectors.byId[asConnectorId("C1")]!,
        catalogItemId
      })
    );

    renderAppWithState(state);
    fireEvent.click(screen.getByRole("button", { name: "Close onboarding" }));
    switchScreenDrawerAware("modeling");
    switchSubScreenDrawerAware("catalog");

    const catalogPanel = getPanelByHeading("Catalog");
    fireEvent.click(within(catalogPanel).getByRole("button", { name: "Seal refs" }));
    expect(within(catalogPanel).getByRole("button", { name: "Seal refs" })).toHaveAttribute("aria-pressed", "true");

    switchSubScreenDrawerAware("connector");
    const connectorsPanel = getPanelByHeading("Connectors");
    fireEvent.click(within(connectorsPanel).getByRole("button", { name: "CAT-MFR-LINK" }));

    const refreshedCatalogPanel = getPanelByHeading("Catalog");
    expect(within(refreshedCatalogPanel).getByRole("button", { name: "Seal refs" })).toHaveAttribute("aria-pressed", "true");
    expect(within(refreshedCatalogPanel).getByRole("button", { name: "Items" })).toHaveAttribute("aria-pressed", "false");
  });

  it("closes catalog edit panel when clearing the catalog selection", () => {
    const catalogItemId = asCatalogItemId("CAT-CLEAR");
    const state = appReducer(
      createUiIntegrationState(),
      appActions.upsertCatalogItem({
        id: catalogItemId,
        manufacturerReference: "CAT-CLEAR",
        name: "Clear selection sample",
        connectionCount: 2
      })
    );

    const { store } = renderAppWithState(state);
    fireEvent.click(screen.getByRole("button", { name: "Close onboarding" }));
    switchScreenDrawerAware("modeling");

    const secondaryNavRow = document.querySelector(".workspace-nav-row.secondary");
    expect(secondaryNavRow).not.toBeNull();
    fireEvent.click(within(secondaryNavRow as HTMLElement).getByRole("button", { name: /^Catalog$/, hidden: true }));

    const catalogPanel = getPanelByHeading("Catalog");
    fireEvent.click(within(catalogPanel).getByText("CAT-CLEAR"));
    expect(getPanelByHeading("Edit catalog item")).toBeInTheDocument();

    act(() => {
      store.dispatch(appActions.clearSelection());
    });

    expect(screen.queryByRole("heading", { name: "Edit catalog item" })).not.toBeInTheDocument();
    expect(catalogPanel.querySelector("tr.is-selected")).toBeNull();
  });

  it("shows immediate validation when selecting an incompatible catalog item in connector and splice forms", () => {
    const catalogLargeId = asCatalogItemId("CAT-LARGE");
    const catalogSmallId = asCatalogItemId("CAT-SMALL");
    const connectorId = asConnectorId("CONN-PROTECTED");
    const spliceId = asSpliceId("SPLICE-PROTECTED");

    const state = appReducer(
      appReducer(
        appReducer(
          appReducer(
            appReducer(
              appReducer(
                createInitialState(),
                appActions.upsertCatalogItem({
                  id: catalogLargeId,
                  manufacturerReference: "CAT-6",
                  connectionCount: 6
                })
              ),
              appActions.upsertCatalogItem({
                id: catalogSmallId,
                manufacturerReference: "CAT-2",
                connectionCount: 2
              })
            ),
            appActions.upsertConnector({
              id: connectorId,
              name: "Protected connector",
              technicalId: "C-PROTECTED",
              cavityCount: 6,
              catalogItemId: catalogLargeId
            })
          ),
          appActions.occupyConnectorCavity(connectorId, 4, "WIRE-A")
        ),
        appActions.upsertSplice({
          id: spliceId,
          name: "Protected splice",
          technicalId: "S-PROTECTED",
          portCount: 6,
          catalogItemId: catalogLargeId
        })
      ),
      appActions.occupySplicePort(spliceId, 4, "WIRE-B")
    );

    renderAppWithState(state);
    fireEvent.click(screen.getByRole("button", { name: "Close onboarding" }));
    switchScreenDrawerAware("modeling");

    const secondaryNavRow = document.querySelector(".workspace-nav-row.secondary");
    expect(secondaryNavRow).not.toBeNull();

    fireEvent.click(within(secondaryNavRow as HTMLElement).getByRole("button", { name: /^Connector/, hidden: true }));
    const connectorsPanel = getPanelByHeading("Connectors");
    fireEvent.click(within(connectorsPanel).getByText("Protected connector"));

    const connectorFormPanel = getPanelByHeading("Edit Connector");
    const connectorCatalogSelect = within(connectorFormPanel).getByLabelText("Catalog item (manufacturer reference)");
    fireEvent.change(connectorCatalogSelect, { target: { value: catalogSmallId } });
    expect(
      within(connectorFormPanel).getByText(
        "Selected catalog item is incompatible: occupied way indexes exceed the catalog connection count."
      )
    ).toBeInTheDocument();
    expect(connectorCatalogSelect).toHaveValue(catalogLargeId);
    expect(within(connectorFormPanel).getByLabelText("Way count (from catalog)")).toHaveValue(6);

    fireEvent.click(within(secondaryNavRow as HTMLElement).getByRole("button", { name: /^Splice/, hidden: true }));
    const splicesPanel = getPanelByHeading("Splices");
    fireEvent.click(within(splicesPanel).getByText("Protected splice"));

    const spliceFormPanel = getPanelByHeading("Edit Splice");
    const spliceCatalogSelect = within(spliceFormPanel).getByLabelText("Catalog item (manufacturer reference)");
    fireEvent.change(spliceCatalogSelect, { target: { value: catalogSmallId } });
    expect(
      within(spliceFormPanel).getByText(
        "Selected catalog item is incompatible: occupied port indexes exceed the catalog connection count."
      )
    ).toBeInTheDocument();
    expect(spliceCatalogSelect).toHaveValue(catalogLargeId);
    expect(within(spliceFormPanel).getByLabelText("Port count (from catalog)")).toHaveValue(6);
  });

  it("applies the selected workspace currency to catalog price list and form labels", () => {
    const pricedCatalogItemId = asCatalogItemId("CAT-PRICE");
    const state = appReducer(
      createInitialState(),
      appActions.upsertCatalogItem({
        id: pricedCatalogItemId,
        manufacturerReference: "CAT-PRICE",
        name: "Priced item",
        connectionCount: 4,
        unitPriceExclTax: 3.5
      })
    );

    renderAppWithState(state);
    fireEvent.click(screen.getByRole("button", { name: "Close onboarding" }));

    switchScreenDrawerAware("settings");
    const pricingSettingsPanel = getPanelByHeading("Catalog & BOM setup");
    fireEvent.change(within(pricingSettingsPanel).getByLabelText("Currency (Catalog/BOM)"), {
      target: { value: "GBP" }
    });

    switchScreenDrawerAware("modeling");
    const secondaryNavRow = document.querySelector(".workspace-nav-row.secondary");
    expect(secondaryNavRow).not.toBeNull();
    fireEvent.click(within(secondaryNavRow as HTMLElement).getByRole("button", { name: /^Catalog$/, hidden: true }));

    const catalogPanel = getPanelByHeading("Catalog");
    expect(within(catalogPanel).getByText("3.50 £")).toBeInTheDocument();

    fireEvent.click(within(catalogPanel).getByText("CAT-PRICE"));
    const catalogFormPanel = getPanelByHeading("Edit catalog item");
    expect(within(catalogFormPanel).getByLabelText("Unit price (excl. tax) [GBP]")).toBeInTheDocument();
  });
});
