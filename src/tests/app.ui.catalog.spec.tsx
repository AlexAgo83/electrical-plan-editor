import { fireEvent, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { createInitialState } from "../store";
import {
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
    expect(getPanelByHeading("Edit catalog item")).toBeInTheDocument();
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
    fireEvent.click(within(catalogPanel).getByRole("button", { name: "Create Connector" }));

    connectorFormPanel = getPanelByHeading("Create Connector");
    expect(within(connectorFormPanel).getByDisplayValue("TE-1-967616-1")).toBeInTheDocument();
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
});
