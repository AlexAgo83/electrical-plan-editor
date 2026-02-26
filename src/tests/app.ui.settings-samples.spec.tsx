import { fireEvent, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { createInitialState } from "../store";
import { getPanelByHeading, renderAppWithState, switchScreenDrawerAware } from "./helpers/app-ui-test-utils";

describe("App integration UI - settings sample controls", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("recreates a catalog validation issues sample from settings", () => {
    renderAppWithState(createInitialState());

    switchScreenDrawerAware("settings");
    const sampleControlsPanel = getPanelByHeading("Sample network controls");
    fireEvent.click(
      within(sampleControlsPanel).getByRole("button", { name: "Recreate catalog validation issues sample" })
    );

    switchScreenDrawerAware("networkScope");
    const networkScopePanel = getPanelByHeading("Network Scope");
    expect(within(networkScopePanel).getByText("Catalog validation issues sample")).toBeInTheDocument();

    switchScreenDrawerAware("validation");
    const validationPanel = getPanelByHeading("Validation center");
    fireEvent.click(within(validationPanel).getByRole("button", { name: /Catalog integrity/i }));
    expect(within(validationPanel).getByText(/CAT-VAL-URL.*invalid URL/i)).toBeInTheDocument();
  });

  it("recreates a pricing and BOM QA sample from settings", () => {
    renderAppWithState(createInitialState());

    switchScreenDrawerAware("settings");
    const sampleControlsPanel = getPanelByHeading("Sample network controls");
    fireEvent.click(within(sampleControlsPanel).getByRole("button", { name: "Recreate pricing / BOM QA sample" }));

    switchScreenDrawerAware("networkScope");
    const networkScopePanel = getPanelByHeading("Network Scope");
    expect(within(networkScopePanel).getByText("Pricing / BOM QA sample")).toBeInTheDocument();

    switchScreenDrawerAware("modeling");
    const connectorsPanel = getPanelByHeading("Connectors");
    expect(within(connectorsPanel).getByText("QA BOM Connector A")).toBeInTheDocument();
    expect(within(connectorsPanel).getAllByText("QA-BOM-PRICE-19-99")).toHaveLength(2);
    expect(within(connectorsPanel).getByText("QA BOM Connector B")).toBeInTheDocument();

    fireEvent.click(within(screen.getByRole("region", { name: "Quick entity navigation" })).getByRole("button", { name: /Splices/i }));
    const splicesPanel = getPanelByHeading("Splices");
    expect(within(splicesPanel).getByText("QA BOM Splice")).toBeInTheDocument();
    expect(within(splicesPanel).getByText("QA-BOM-NOPRICE")).toBeInTheDocument();
  });
});
