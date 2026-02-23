import { fireEvent, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { createInitialState } from "../store";
import {
  getPanelByHeading,
  renderAppWithState,
  switchScreenDrawerAware,
  switchSubScreenDrawerAware
} from "./helpers/app-ui-test-utils";

describe("App integration UI - creation flow ergonomics", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("prefills connector and splice technical IDs in create mode and does not overwrite manual edits while typing", () => {
    renderAppWithState(createInitialState());
    switchScreenDrawerAware("modeling");

    const idleConnectorFormPanel = getPanelByHeading("Connector form");
    fireEvent.click(within(idleConnectorFormPanel).getByRole("button", { name: "Create" }));
    const createConnectorPanel = getPanelByHeading("Create Connector");
    const connectorTechnicalIdInput = within(createConnectorPanel).getByLabelText("Technical ID");
    expect(connectorTechnicalIdInput).toHaveValue("C-001");

    fireEvent.change(connectorTechnicalIdInput, { target: { value: "C-CUSTOM-42" } });
    fireEvent.change(within(createConnectorPanel).getByLabelText("Functional name"), {
      target: { value: "Manual connector" }
    });
    expect(connectorTechnicalIdInput).toHaveValue("C-CUSTOM-42");

    switchSubScreenDrawerAware("splice");
    const idleSpliceFormPanel = getPanelByHeading("Splice form");
    fireEvent.click(within(idleSpliceFormPanel).getByRole("button", { name: "Create" }));
    const createSplicePanel = getPanelByHeading("Create Splice");
    const spliceTechnicalIdInput = within(createSplicePanel).getByLabelText("Technical ID");
    expect(spliceTechnicalIdInput).toHaveValue("S-001");
  });

  it("focuses the created connector row and switches the form to edit mode after creation", async () => {
    renderAppWithState(createInitialState());
    switchScreenDrawerAware("modeling");

    const idleConnectorFormPanel = getPanelByHeading("Connector form");
    fireEvent.click(within(idleConnectorFormPanel).getByRole("button", { name: "Create" }));
    const connectorFormPanel = getPanelByHeading("Create Connector");
    fireEvent.change(within(connectorFormPanel).getByLabelText("Functional name"), {
      target: { value: "Focused connector" }
    });
    fireEvent.change(within(connectorFormPanel).getByLabelText("Technical ID"), {
      target: { value: "C-FOCUS-1" }
    });
    fireEvent.change(within(connectorFormPanel).getByLabelText("Way count"), {
      target: { value: "3" }
    });
    fireEvent.click(within(connectorFormPanel).getByRole("button", { name: "Create" }));

    const connectorsPanel = getPanelByHeading("Connectors");
    const createdRow = within(connectorsPanel).getByText("Focused connector").closest("tr");
    expect(createdRow).not.toBeNull();
    expect(getPanelByHeading("Edit Connector")).toBeInTheDocument();

    await waitFor(() => {
      expect(createdRow).toHaveClass("is-selected");
      expect(document.activeElement).toBe(createdRow);
    });
  });

  it("auto-creates linked connector and splice nodes when creating entities", () => {
    renderAppWithState(createInitialState());
    switchScreenDrawerAware("modeling");

    const idleConnectorFormPanel = getPanelByHeading("Connector form");
    fireEvent.click(within(idleConnectorFormPanel).getByRole("button", { name: "Create" }));
    const connectorFormPanel = getPanelByHeading("Create Connector");
    fireEvent.change(within(connectorFormPanel).getByLabelText("Functional name"), {
      target: { value: "Auto node connector" }
    });
    fireEvent.change(within(connectorFormPanel).getByLabelText("Way count"), {
      target: { value: "2" }
    });
    fireEvent.click(within(connectorFormPanel).getByRole("button", { name: "Create" }));

    switchSubScreenDrawerAware("splice");
    const idleSpliceFormPanel = getPanelByHeading("Splice form");
    fireEvent.click(within(idleSpliceFormPanel).getByRole("button", { name: "Create" }));
    const spliceFormPanel = getPanelByHeading("Create Splice");
    fireEvent.change(within(spliceFormPanel).getByLabelText("Functional name"), {
      target: { value: "Auto node splice" }
    });
    fireEvent.change(within(spliceFormPanel).getByLabelText("Port count"), {
      target: { value: "2" }
    });
    fireEvent.click(within(spliceFormPanel).getByRole("button", { name: "Create" }));

    switchSubScreenDrawerAware("node");
    const nodesPanel = getPanelByHeading("Nodes");
    expect(within(nodesPanel).getByText("Auto node connector (C-001)")).toBeInTheDocument();
    expect(within(nodesPanel).getByText("Auto node splice (S-001)")).toBeInTheDocument();
  });
});
