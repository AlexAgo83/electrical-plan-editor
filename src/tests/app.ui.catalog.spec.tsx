import { fireEvent, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { appActions, appReducer, createInitialState } from "../store";
import {
  asCatalogItemId,
  asConnectorId,
  asSpliceId,
  createUiIntegrationState,
  getPanelByHeading,
  renderAppWithState,
  switchScreenDrawerAware
} from "./helpers/app-ui-test-utils";

describe("App integration UI - catalog", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("adds Catalog before connectors in modeling navigation and quick entity navigation", () => {
    renderAppWithState(createUiIntegrationState());
    fireEvent.click(screen.getByRole("button", { name: "Close onboarding" }));

    switchScreenDrawerAware("modeling");

    const secondaryNavRow = document.querySelector(".workspace-nav-row.secondary");
    expect(secondaryNavRow).not.toBeNull();
    const secondaryButtons = within(secondaryNavRow as HTMLElement).getAllByRole("button", { hidden: true });
    const secondaryLabels = secondaryButtons.map((button) => button.textContent?.trim() ?? "");
    expect(secondaryLabels[0]).toMatch(/^Catalog\d*$/);
    expect(secondaryLabels[1]).toMatch(/^Connector\d*$/);

    const quickNavGroup = document.querySelector(".network-summary-quick-entity-nav");
    expect(quickNavGroup).not.toBeNull();
    const quickNavButtons = within(quickNavGroup as HTMLElement).getAllByRole("button");
    const quickNavLabels = quickNavButtons.map((button) => button.textContent?.trim() ?? "");
    expect(quickNavLabels[0]).toMatch(/^Catalog\d+$/);
    expect(quickNavLabels[1]).toMatch(/^Connectors\d+$/);

    fireEvent.click(within(quickNavGroup as HTMLElement).getByRole("button", { name: /^Catalog\b/i }));
    expect(getPanelByHeading("Catalog")).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Catalog item form" })).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Edit catalog item" })).not.toBeInTheDocument();
  });

  it("enforces catalog-first connector creation and supports catalog creation with URL validation", () => {
    renderAppWithState(createInitialState());
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
    expect(within(catalogFormPanel).getByText("Use an absolute http/https URL.")).toBeInTheDocument();
    expect(within(catalogFormPanel).getByRole("button", { name: "Create" })).toBeDisabled();

    fireEvent.change(within(catalogFormPanel).getByLabelText("URL"), {
      target: { value: "https://example.com/te-1-967616-1" }
    });
    fireEvent.click(within(catalogFormPanel).getByRole("button", { name: "Create" }));

    expect(within(catalogPanel).getByText("TE-1-967616-1")).toBeInTheDocument();
    fireEvent.click(within(catalogPanel).getByText("TE-1-967616-1"));
    const catalogAnalysisGrid = getPanelByHeading("Catalog analysis").closest(".analysis-panel-grid");
    expect(catalogAnalysisGrid).not.toBeNull();
    const connectorsUsageHeading = within(catalogAnalysisGrid as HTMLElement).getByRole("heading", { name: "Connectors" });
    const connectorsUsagePanel = connectorsUsageHeading.closest(".panel");
    expect(connectorsUsagePanel).not.toBeNull();
    fireEvent.click(within(connectorsUsagePanel as HTMLElement).getByRole("button", { name: "Create Connector" }));

    connectorFormPanel = getPanelByHeading("Create Connector");
    expect(within(connectorFormPanel).getByDisplayValue(/TE-1-967616-1 \(6\)/)).toBeInTheDocument();
    expect(within(connectorFormPanel).getByText("Manufacturer reference: TE-1-967616-1")).toBeInTheDocument();
    expect(within(connectorFormPanel).getByLabelText("Way count (from catalog)")).toHaveValue(6);

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
    const state = appReducer(
      appReducer(
        appReducer(
          createUiIntegrationState(),
          appActions.upsertCatalogItem({
            id: catalogItemId,
            manufacturerReference: "CAT-ANALYSIS",
            name: "Analysis sample item",
            connectionCount: 2,
            unitPriceExclTax: 3.5
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

    renderAppWithState(state);
    fireEvent.click(screen.getByRole("button", { name: "Close onboarding" }));
    switchScreenDrawerAware("modeling");

    const secondaryNavRow = document.querySelector(".workspace-nav-row.secondary");
    expect(secondaryNavRow).not.toBeNull();
    fireEvent.click(within(secondaryNavRow as HTMLElement).getByRole("button", { name: /^Catalog$/, hidden: true }));

    const catalogPanel = getPanelByHeading("Catalog");
    fireEvent.click(within(catalogPanel).getByText("CAT-ANALYSIS"));
    expect(within(catalogPanel).getByRole("button", { name: "Delete" })).toBeDisabled();

    const catalogAnalysisPanel = getPanelByHeading("Catalog analysis");
    const catalogAnalysisGrid = catalogAnalysisPanel.closest(".analysis-panel-grid");
    expect(catalogAnalysisGrid).not.toBeNull();
    expect(within(catalogAnalysisPanel).getByText("CAT-ANALYSIS")).toBeInTheDocument();
    expect(within(catalogAnalysisPanel).getByText("1 connectors / 1 splices")).toBeInTheDocument();
    expect(within(catalogAnalysisGrid as HTMLElement).getByRole("heading", { name: "Connectors" })).toBeInTheDocument();
    expect(within(catalogAnalysisGrid as HTMLElement).getByRole("heading", { name: "Splices" })).toBeInTheDocument();

    const splicesUsageHeading = within(catalogAnalysisGrid as HTMLElement).getByRole("heading", { name: "Splices" });
    const splicesUsagePanel = splicesUsageHeading.closest(".panel");
    expect(splicesUsagePanel).not.toBeNull();
    expect(within(splicesUsagePanel as HTMLElement).getByText("Splice 1")).toBeInTheDocument();
    fireEvent.click(within(splicesUsagePanel as HTMLElement).getByRole("button", { name: "Go to" }));
    expect(getPanelByHeading("Edit Splice")).toBeInTheDocument();

    fireEvent.click(within(secondaryNavRow as HTMLElement).getByRole("button", { name: /^Catalog$/, hidden: true }));
    fireEvent.click(within(getPanelByHeading("Catalog")).getByText("CAT-ANALYSIS"));
    const refreshedAnalysisGrid = getPanelByHeading("Catalog analysis").closest(".analysis-panel-grid");
    expect(refreshedAnalysisGrid).not.toBeNull();
    const connectorsUsageHeading = within(refreshedAnalysisGrid as HTMLElement).getByRole("heading", { name: "Connectors" });
    const connectorsUsagePanel = connectorsUsageHeading.closest(".panel");
    expect(connectorsUsagePanel).not.toBeNull();
    expect(within(connectorsUsagePanel as HTMLElement).getByText("Connector 1")).toBeInTheDocument();
    fireEvent.click(within(connectorsUsagePanel as HTMLElement).getByRole("button", { name: "Go to" }));
    expect(getPanelByHeading("Edit Connector")).toBeInTheDocument();
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
});
