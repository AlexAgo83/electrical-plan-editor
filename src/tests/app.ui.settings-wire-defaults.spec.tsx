import { fireEvent, within } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import {
  createUiIntegrationState,
  getPanelByHeading,
  renderAppWithState,
  switchScreenDrawerAware,
  switchSubScreenDrawerAware
} from "./helpers/app-ui-test-utils";

describe("App integration UI - settings wire/create defaults", () => {
  function clickNewFromPanel(panelHeading: "Connectors" | "Splices" | "Wires"): void {
    fireEvent.click(within(getPanelByHeading(panelHeading)).getByRole("button", { name: "New" }));
  }

  beforeEach(() => {
    localStorage.clear();
  });

  it("persists global defaults for wire section and auto-create linked nodes and reuses them in create forms", () => {
    const firstRender = renderAppWithState(createUiIntegrationState());

    switchScreenDrawerAware("settings");
    const globalPreferencesPanel = getPanelByHeading("Global preferences");
    const defaultWireSectionInput = within(globalPreferencesPanel).getByLabelText("Default wire section (mm²)");
    const defaultAutoCreateLinkedNodesCheckbox = within(globalPreferencesPanel).getByLabelText(
      "Default auto-create linked nodes for connectors/splices"
    );
    expect(defaultWireSectionInput).toHaveValue(0.5);
    expect(defaultAutoCreateLinkedNodesCheckbox).toBeChecked();

    fireEvent.change(defaultWireSectionInput, { target: { value: "0.75" } });
    fireEvent.click(defaultAutoCreateLinkedNodesCheckbox);
    expect(defaultWireSectionInput).toHaveValue(0.75);
    expect(defaultAutoCreateLinkedNodesCheckbox).not.toBeChecked();

    switchScreenDrawerAware("modeling");
    switchSubScreenDrawerAware("wire");
    clickNewFromPanel("Wires");
    const createWirePanel = getPanelByHeading("Create Wire");
    expect(within(createWirePanel).getByLabelText("Section (mm²)")).toHaveValue(0.75);
    fireEvent.click(within(createWirePanel).getByRole("button", { name: "Cancel" }));

    switchSubScreenDrawerAware("connector");
    clickNewFromPanel("Connectors");
    const createConnectorPanel = getPanelByHeading("Create Connector");
    expect(within(createConnectorPanel).getByLabelText("Auto-create linked node on connector creation")).not.toBeChecked();
    fireEvent.click(within(createConnectorPanel).getByRole("button", { name: "Cancel" }));

    switchSubScreenDrawerAware("splice");
    clickNewFromPanel("Splices");
    const createSplicePanel = getPanelByHeading("Create Splice");
    expect(within(createSplicePanel).getByLabelText("Auto-create linked node on splice creation")).not.toBeChecked();

    firstRender.unmount();

    renderAppWithState(createUiIntegrationState());
    switchScreenDrawerAware("settings");
    const restoredGlobalPreferencesPanel = getPanelByHeading("Global preferences");
    expect(within(restoredGlobalPreferencesPanel).getByLabelText("Default wire section (mm²)")).toHaveValue(0.75);
    expect(
      within(restoredGlobalPreferencesPanel).getByLabelText("Default auto-create linked nodes for connectors/splices")
    ).not.toBeChecked();
  });
});
