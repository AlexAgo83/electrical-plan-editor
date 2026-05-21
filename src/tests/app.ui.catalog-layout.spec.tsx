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
            { cavityIndex: 2, x: 4, y: 2, shape: "slot", label: "A2" }
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
    expect(within(connectorAnalysisPanel).getByText("Using catalog physical layout.")).toBeInTheDocument();
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
    expect(squareKeying?.getAttribute("style")).toContain("fill: #ff8800");
    expect(Number(squareKeying?.getAttribute("y"))).toBeGreaterThan(0);
    expect(connectorAnalysisPanel.querySelector('.connector-physical-way-shape[width="0.66"]')).not.toBeNull();
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

    fireEvent.change(within(catalogFormPanel).getByLabelText("Connection count"), {
      target: { value: "4" }
    });
    fireEvent.click(within(catalogFormPanel).getByRole("button", { name: "Auto layout" }));
    expect(within(catalogFormPanel).getByText("No keying features.")).toBeInTheDocument();
    const shellPaddingSlider = within(catalogFormPanel).getByLabelText(/Shell padding/i);
    expect(shellPaddingSlider).toHaveValue("0.5");
    fireEvent.change(shellPaddingSlider, {
      target: { value: "1.1" }
    });
    expect(shellPaddingSlider).toHaveValue("1.1");
    fireEvent.change(within(catalogFormPanel).getByLabelText("Grid width"), {
      target: { value: "1" }
    });
    expect(within(catalogFormPanel).getByLabelText("Grid width")).toHaveValue(2);
    expect(within(catalogFormPanel).getByText("Cannot reduce grid width: move C2, C4 inside the new width first.")).toBeInTheDocument();
    fireEvent.keyDown(within(catalogFormPanel).getByRole("button", { name: "Select and move way 2" }), {
      key: "ArrowLeft"
    });
    expect(within(catalogFormPanel).getByLabelText("X")).toHaveValue(2);
    fireEvent.click(within(catalogFormPanel).getByRole("button", { name: "Add keying" }));
    expect(catalogFormPanel.querySelector(".connector-layout-keying")?.getAttribute("style")).toBeNull();
    const { sideSelect, shapeSelect, positionInput, scaleInput } = getConnectorLayoutKeyingControls(
      getConnectorLayoutKeyingRow(catalogFormPanel)
    );
    expect(sideSelect).toHaveValue("right");
    expect(shapeSelect).toHaveValue("arrow");
    expect(positionInput).toHaveValue(1.5);
    expect(scaleInput).toHaveValue("1");
    fireEvent.change(sideSelect, {
      target: { value: "bottom" }
    });
    expect(sideSelect).toHaveValue("bottom");
    fireEvent.change(shapeSelect, {
      target: { value: "square" }
    });
    expect(shapeSelect).toHaveValue("square");
    fireEvent.change(positionInput, {
      target: { value: "2" }
    });
    expect(positionInput).toHaveValue(2);
    fireEvent.change(scaleInput, {
      target: { value: "1.6" }
    });
    expect(scaleInput).toHaveValue("1.6");
    expect(within(catalogFormPanel).queryByText("Overlapping ways: C1/C2.")).not.toBeInTheDocument();
  });
});
