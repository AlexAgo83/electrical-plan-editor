import { fireEvent, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { appActions, appReducer } from "../store";
import {
  asCatalogItemId,
  asConnectorId,
  createUiIntegrationState,
  getPanelByHeading,
  renderAppWithState,
  switchScreenDrawerAware
} from "./helpers/app-ui-test-utils";
import {
  getConnectorLayoutKeyingControls,
  getConnectorLayoutKeyingRow
} from "./helpers/app-ui-form-test-utils";

describe("App integration UI - catalog layout", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders catalog connector layouts in the connector physical analysis view", () => {
    const catalogItemId = asCatalogItemId("CAT-PHYSICAL");
    const connectorId = asConnectorId("C1");
    const state = [
      appActions.upsertCatalogItem({
        id: catalogItemId,
        manufacturerReference: "CAT-PHYSICAL",
        connectionCount: 2,
        connectorLayout: {
          version: 1,
          units: "grid",
          width: 6,
          height: 5,
          shellShape: "circle",
          shellPadding: 1.25,
          keyings: [
            { side: "top", shape: "square", color: "#ff8800", position: 2 },
            { side: "bottom", shape: "diamond", position: 4 }
          ],
          ways: [
            { cavityIndex: 1, x: 2, y: 2, shape: "square", label: "A10" },
            { cavityIndex: 2, x: 4, y: 2, shape: "slot", strokeStyle: "dashed", label: "A2" }
          ]
        }
      }),
      appActions.upsertConnector({
        id: connectorId,
        name: "Connector 1",
        technicalId: "C-1",
        catalogItemId,
        manufacturerReference: "CAT-PHYSICAL",
        cavityCount: 2
      })
    ].reduce(appReducer, createUiIntegrationState());

    renderAppWithState(state);
    fireEvent.click(screen.getByRole("button", { name: "Close onboarding" }));
    switchScreenDrawerAware("modeling");

    const secondaryNavRow = document.querySelector(".workspace-nav-row.secondary");
    expect(secondaryNavRow).not.toBeNull();
    fireEvent.click(within(secondaryNavRow as HTMLElement).getByRole("button", { name: /^Connector$/, hidden: true }));
    const connectorsPanel = getPanelByHeading("Connectors");
    fireEvent.click(within(connectorsPanel).getByText("Connector 1"));

    const connectorAnalysisPanel = getPanelByHeading("Connector analysis");
    fireEvent.click(within(connectorAnalysisPanel).getByRole("button", { name: "Physical" }));

    expect(within(connectorAnalysisPanel).getByLabelText("Connector physical view")).toBeInTheDocument();
    expect(within(connectorAnalysisPanel).queryByText("Using catalog physical layout.")).not.toBeInTheDocument();
    expect(
      within(connectorAnalysisPanel).queryByText("Using generated layout. Edit the catalog item to define the physical face.")
    ).not.toBeInTheDocument();
    expect(within(connectorAnalysisPanel).getByText("A10")).toBeInTheDocument();
    expect(within(connectorAnalysisPanel).getByText("A2")).toBeInTheDocument();
    expect(within(connectorAnalysisPanel).getByText("A10")).toHaveClass("is-long-label");
    expect(within(connectorAnalysisPanel).getByText("A2")).not.toHaveClass("is-long-label");
    expect(connectorAnalysisPanel.querySelector(".connector-physical-wire-technical-id")?.textContent).toBe("W-1");
    expect(connectorAnalysisPanel.querySelector(".connector-physical-wire-technical-id-bg")).not.toBeNull();
    expect(connectorAnalysisPanel.querySelector("ellipse.connector-physical-shell")).not.toBeNull();
    expect(connectorAnalysisPanel.querySelector("ellipse.connector-physical-shell")?.getAttribute("rx")).toBe("3.75");
    expect(connectorAnalysisPanel.querySelectorAll(".connector-physical-keying")).toHaveLength(2);
    const squareKeying = connectorAnalysisPanel.querySelector(".connector-physical-keying");
    expect(squareKeying?.getAttribute("style")).toMatch(/fill: (#ff8800|rgb\(255, 136, 0\))/);
    expect(Number(squareKeying?.getAttribute("y"))).toBeGreaterThan(0);
    expect(connectorAnalysisPanel.querySelector('.connector-physical-way-shape.is-dashed[width="0.66"]')).not.toBeNull();
  });

  it("supports keyboard layout moves without allowing overlapping ways", () => {
    renderAppWithState(createUiIntegrationState());
    fireEvent.click(screen.getByRole("button", { name: "Close onboarding" }));
    switchScreenDrawerAware("modeling");

    const secondaryNavRow = document.querySelector(".workspace-nav-row.secondary");
    expect(secondaryNavRow).not.toBeNull();
    fireEvent.click(within(secondaryNavRow as HTMLElement).getByRole("button", { name: /^Catalog$/, hidden: true }));

    const catalogPanel = getPanelByHeading("Catalog");
    fireEvent.click(within(catalogPanel).getByRole("button", { name: "Create catalog item" }));
    const catalogFormPanel = getPanelByHeading("Create catalog item");
    expect(screen.queryByRole("heading", { name: "Connector physical layout" })).not.toBeInTheDocument();
    fireEvent.click(within(catalogFormPanel).getByLabelText("Connector physical layout"));
    const catalogLayoutPanel = getPanelByHeading("Connector physical layout");

    fireEvent.change(within(catalogFormPanel).getByLabelText("Connection count"), {
      target: { value: "4" }
    });
    fireEvent.click(within(catalogLayoutPanel).getByRole("button", { name: "Auto layout" }));
    expect(catalogLayoutPanel.querySelectorAll(".connector-layout-grid-line")).toHaveLength(6);
    expect(catalogLayoutPanel.querySelectorAll(".connector-layout-grid-center-line")).toHaveLength(4);
    expect(within(catalogLayoutPanel).getByRole("button", { name: "Remove column on right" })).toBeDisabled();
    fireEvent.click(within(catalogLayoutPanel).getByRole("button", { name: "Add column on left" }));
    expect(within(catalogLayoutPanel).getByLabelText("Grid width")).toHaveValue(3);
    expect(catalogLayoutPanel.querySelectorAll(".connector-layout-grid-line")).toHaveLength(7);
    expect(catalogLayoutPanel.querySelectorAll(".connector-layout-grid-center-line")).toHaveLength(5);
    expect(within(catalogLayoutPanel).getByRole("button", { name: "Remove column on left" })).toBeEnabled();
    fireEvent.click(within(catalogLayoutPanel).getByRole("button", { name: "Remove column on left" }));
    expect(within(catalogLayoutPanel).getByLabelText("Grid width")).toHaveValue(2);
    fireEvent.click(within(catalogLayoutPanel).getByRole("button", { name: "Add row on top" }));
    expect(within(catalogLayoutPanel).getByLabelText("Grid height")).toHaveValue(3);
    expect(within(catalogLayoutPanel).getByRole("button", { name: "Remove row on top" })).toBeEnabled();
    fireEvent.click(within(catalogLayoutPanel).getByRole("button", { name: "Remove row on top" }));
    expect(within(catalogLayoutPanel).getByLabelText("Grid height")).toHaveValue(2);
    expect(within(catalogLayoutPanel).queryByText("No keying features.")).not.toBeInTheDocument();
    const shellPaddingSlider = within(catalogLayoutPanel).getByLabelText(/Shell padding/i);
    expect(shellPaddingSlider).toHaveValue("0.5");
    fireEvent.change(shellPaddingSlider, {
      target: { value: "1.1" }
    });
    expect(shellPaddingSlider).toHaveValue("1.1");
    const roundedSlider = within(catalogLayoutPanel).getByLabelText(/Rounded/i);
    expect(roundedSlider).toHaveValue("1");
    fireEvent.change(roundedSlider, {
      target: { value: "0" }
    });
    expect(roundedSlider).toHaveValue("0");
    expect(catalogLayoutPanel.querySelector(".connector-layout-shell")?.getAttribute("rx")).toBe("0");
    const shapeThicknessSlider = within(catalogLayoutPanel).getByLabelText(/Shape thickness/i);
    expect(shapeThicknessSlider).toHaveValue("0.08");
    fireEvent.change(shapeThicknessSlider, {
      target: { value: "0.16" }
    });
    expect(shapeThicknessSlider).toHaveValue("0.16");
    expect(catalogLayoutPanel.querySelector(".connector-layout-shell")?.getAttribute("style")).toContain("stroke-width: 0.16");
    const cellPaddingSlider = within(catalogLayoutPanel).getByLabelText(/Cell padding/i);
    expect(cellPaddingSlider).toHaveValue("0.36");
    fireEvent.change(cellPaddingSlider, {
      target: { value: "0.52" }
    });
    expect(cellPaddingSlider).toHaveValue("0.52");
    fireEvent.change(within(catalogLayoutPanel).getByLabelText("Grid width"), {
      target: { value: "1" }
    });
    expect(within(catalogLayoutPanel).getByLabelText("Grid width")).toHaveValue(2);
    expect(within(catalogLayoutPanel).getByText("Cannot reduce grid width: move C2, C4 inside the new width first.")).toBeInTheDocument();
    fireEvent.keyDown(within(catalogLayoutPanel).getByRole("button", { name: "Select and move way 2" }), {
      key: "ArrowLeft"
    });
    expect(within(catalogLayoutPanel).getByLabelText("X")).toHaveValue(2);
    fireEvent.change(within(catalogLayoutPanel).getByLabelText("X"), {
      target: { value: "1" }
    });
    expect(within(catalogLayoutPanel).getByLabelText("X")).toHaveValue(2);
    fireEvent.change(within(catalogLayoutPanel).getByLabelText("Y"), {
      target: { value: "2" }
    });
    expect(within(catalogLayoutPanel).getByLabelText("Y")).toHaveValue(1);
    const shapeLineSelect = within(catalogLayoutPanel).getByLabelText("Line style");
    expect(shapeLineSelect).toHaveValue("solid");
    const smallWaySizeSelect = within(catalogLayoutPanel).getByLabelText("Way size");
    expect(smallWaySizeSelect).toHaveValue("normal");
    fireEvent.change(smallWaySizeSelect, {
      target: { value: "small" }
    });
    expect(smallWaySizeSelect).toHaveValue("small");
    expect(catalogLayoutPanel.querySelector(".connector-layout-way-shape.is-selected.is-small")).not.toBeNull();
    fireEvent.change(shapeLineSelect, {
      target: { value: "dashed" }
    });
    expect(shapeLineSelect).toHaveValue("dashed");
    expect(catalogLayoutPanel.querySelector(".connector-layout-way-shape.is-selected.is-dashed")).not.toBeNull();
    fireEvent.click(within(catalogLayoutPanel).getByRole("button", { name: "Keying features" }));
    fireEvent.click(within(catalogLayoutPanel).getByRole("button", { name: "Add keying" }));
    expect(catalogLayoutPanel.querySelector(".connector-layout-keying")?.getAttribute("style")).toBeNull();
    const { placementSelect, shapeSelect, colorInput, positionSlider, scaleInput } = getConnectorLayoutKeyingControls(
      getConnectorLayoutKeyingRow(catalogLayoutPanel)
    );
    expect(placementSelect).toHaveValue("guided");
    expect(shapeSelect).toHaveValue("arrow");
    expect(positionSlider).toHaveValue("0.375");
    expect(scaleInput).toHaveValue("1");
    expect(within(getConnectorLayoutKeyingRow(catalogLayoutPanel)).getByLabelText("Snap")).toBeChecked();
    fireEvent.change(colorInput, {
      target: { value: "#123456" }
    });
    expect(catalogLayoutPanel.querySelector(".connector-layout-keying")?.getAttribute("style")).toMatch(/fill: (#123456|rgb\(18, 52, 86\))/);
    fireEvent.click(within(getConnectorLayoutKeyingRow(catalogLayoutPanel)).getByRole("button", { name: "Use default keying color" }));
    expect(catalogLayoutPanel.querySelector(".connector-layout-keying")?.getAttribute("style") ?? "").toBe("");
    fireEvent.change(shapeSelect, {
      target: { value: "square" }
    });
    expect(shapeSelect).toHaveValue("square");
    fireEvent.change(positionSlider as HTMLElement, {
      target: { value: "0.55" }
    });
    expect(positionSlider).toHaveValue("0.5469");
    fireEvent.change(placementSelect, {
      target: { value: "free" }
    });
    expect(placementSelect).toHaveValue("free");
    const freeControls = getConnectorLayoutKeyingControls(getConnectorLayoutKeyingRow(catalogLayoutPanel));
    expect(freeControls.positionSlider).toBeNull();
    expect(within(getConnectorLayoutKeyingRow(catalogLayoutPanel)).getByLabelText("Snap")).toBeChecked();
    fireEvent.click(within(getConnectorLayoutKeyingRow(catalogLayoutPanel)).getByLabelText("Snap"));
    expect(within(getConnectorLayoutKeyingRow(catalogLayoutPanel)).getByLabelText("Snap")).not.toBeChecked();
    expect(within(getConnectorLayoutKeyingRow(catalogLayoutPanel)).queryByText("Drag in preview")).not.toBeInTheDocument();
    fireEvent.change(scaleInput, {
      target: { value: "1.6" }
    });
    expect(scaleInput).toHaveValue("1.6");
    expect(within(catalogLayoutPanel).queryByText("Overlapping ways: C1/C2.")).not.toBeInTheDocument();
    fireEvent.click(within(catalogLayoutPanel).getByRole("button", { name: "Select and move way 3" }));
    expect(within(catalogLayoutPanel).getByRole("button", { name: "Selected way" })).toHaveAttribute("aria-pressed", "true");
    expect(within(catalogLayoutPanel).queryByRole("heading", { name: "Keying features" })).not.toBeInTheDocument();
    expect(catalogLayoutPanel.querySelector(".connector-layout-control-card-selected .connector-layout-control-card-header span")?.textContent).toBe(
      "C3"
    );
  });

  it("only enables big ways when the 2x2 footprint is free", () => {
    renderAppWithState(createUiIntegrationState());
    fireEvent.click(screen.getByRole("button", { name: "Close onboarding" }));
    switchScreenDrawerAware("modeling");

    const secondaryNavRow = document.querySelector(".workspace-nav-row.secondary");
    expect(secondaryNavRow).not.toBeNull();
    fireEvent.click(within(secondaryNavRow as HTMLElement).getByRole("button", { name: /^Catalog$/, hidden: true }));

    const catalogPanel = getPanelByHeading("Catalog");
    fireEvent.click(within(catalogPanel).getByRole("button", { name: "Create catalog item" }));
    const catalogFormPanel = getPanelByHeading("Create catalog item");
    fireEvent.click(within(catalogFormPanel).getByLabelText("Connector physical layout"));
    const catalogLayoutPanel = getPanelByHeading("Connector physical layout");

    fireEvent.change(within(catalogFormPanel).getByLabelText("Connection count"), {
      target: { value: "4" }
    });
    fireEvent.click(within(catalogLayoutPanel).getByRole("button", { name: "Auto layout" }));
    fireEvent.click(within(catalogLayoutPanel).getByRole("button", { name: "Select and move way 1" }));
    let waySizeSelect = within(catalogLayoutPanel).getByLabelText("Way size");
    expect(within(waySizeSelect).getByRole("option", { name: "Big (2 x 2)" })).toBeDisabled();

    fireEvent.change(within(catalogFormPanel).getByLabelText("Connection count"), {
      target: { value: "1" }
    });
    fireEvent.click(within(catalogLayoutPanel).getByRole("button", { name: "Auto layout" }));
    fireEvent.click(within(catalogLayoutPanel).getByRole("button", { name: "Add column on right" }));
    fireEvent.click(within(catalogLayoutPanel).getByRole("button", { name: "Add row on bottom" }));
    fireEvent.click(within(catalogLayoutPanel).getByRole("button", { name: "Select and move way 1" }));
    waySizeSelect = within(catalogLayoutPanel).getByLabelText("Way size");
    expect(within(waySizeSelect).getByRole("option", { name: "Big (2 x 2)" })).toBeEnabled();
    fireEvent.change(waySizeSelect, {
      target: { value: "big" }
    });
    expect(waySizeSelect).toHaveValue("big");
    expect(catalogLayoutPanel.querySelector(".connector-layout-way-shape.is-selected.is-big")).not.toBeNull();
  });
});
