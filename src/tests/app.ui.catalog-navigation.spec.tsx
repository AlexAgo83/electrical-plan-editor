import { act, fireEvent, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { appActions, appReducer } from "../store";
import {
  asConnectorId,
  createUiIntegrationState,
  getPanelByHeading,
  renderAppWithState,
  switchScreenDrawerAware
} from "./helpers/app-ui-test-utils";

describe("App integration UI - catalog navigation", () => {
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

    const quickNavPanel = document.querySelector("[data-quick-entity-nav-source='true']");
    const quickNavGroup = quickNavPanel?.querySelector(".network-summary-quick-entity-nav");
    expect(quickNavGroup).not.toBeNull();
    const networkSummaryPanel = screen.getByRole("heading", { name: "Network summary" }).closest(".panel");
    expect(quickNavPanel).not.toBeNull();
    expect(networkSummaryPanel).not.toBeNull();
    expect((quickNavPanel as HTMLElement).compareDocumentPosition(networkSummaryPanel as HTMLElement) & Node.DOCUMENT_POSITION_FOLLOWING).not.toBe(0);
    const quickNavButtons = within(quickNavGroup as HTMLElement).getAllByRole("button");
    const quickNavLabels = quickNavButtons.map((button) => button.textContent?.trim() ?? "");
    expect(quickNavLabels[0]).toMatch(/^Catalog\d+$/);
    expect(quickNavLabels[1]).toMatch(/^Connectors\d+$/);

    fireEvent.click(within(quickNavGroup as HTMLElement).getByRole("button", { name: /^Catalog/i }));
    expect(getPanelByHeading("Catalog")).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Catalog item form" })).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Edit catalog item" })).not.toBeInTheDocument();
  });

  it("abbreviates counted navigation labels when an entity count exceeds 9", () => {
    const stateWithManyConnectors = Array.from({ length: 10 }, (_, index) => index + 1).reduce(
      (state, index) =>
        appReducer(
          state,
          appActions.upsertConnector({
            id: asConnectorId(`C-MANY-${index}`),
            name: `Connector many ${index}`,
            technicalId: `C-MANY-${index}`,
            cavityCount: 2
          })
        ),
      createUiIntegrationState()
    );

    renderAppWithState(stateWithManyConnectors);
    fireEvent.click(screen.getByRole("button", { name: "Close onboarding" }));

    switchScreenDrawerAware("modeling");

    const secondaryNavRow = document.querySelector(".workspace-nav-row.secondary");
    expect(secondaryNavRow).not.toBeNull();
    const connectorSecondaryButton = within(secondaryNavRow as HTMLElement).getByRole("button", {
      name: /^Connector\s+\d+$/,
      hidden: true
    });
    expect(connectorSecondaryButton.textContent).toMatch(/^Conn\.\d+$/);

    const quickNavPanel = document.querySelector("[data-quick-entity-nav-source='true']");
    const quickNavGroup = quickNavPanel?.querySelector(".network-summary-quick-entity-nav");
    expect(quickNavGroup).not.toBeNull();
    const connectorQuickNavButton = within(quickNavGroup as HTMLElement).getByRole("button", { name: /^Connectors\s+\d+$/ });
    expect(connectorQuickNavButton.textContent).toMatch(/^Conn\.\d+$/);
  });

  it("docks quick entity navigation into the header after the source strip scrolls under it", async () => {
    renderAppWithState(createUiIntegrationState());
    fireEvent.click(screen.getByRole("button", { name: "Close onboarding" }));

    switchScreenDrawerAware("modeling");

    const headerBlock = document.querySelector(".header-block");
    const quickNavPanel = document.querySelector("[data-quick-entity-nav-source='true']");
    expect(headerBlock).not.toBeNull();
    expect(quickNavPanel).not.toBeNull();
    expect(document.querySelector(".header-docked-nav-shell")).toBeNull();

    Object.defineProperty(headerBlock, "getBoundingClientRect", {
      configurable: true,
      value: () => ({ top: 0, right: 1200, bottom: 72, left: 0, width: 1200, height: 72, x: 0, y: 0 })
    });
    Object.defineProperty(quickNavPanel, "getBoundingClientRect", {
      configurable: true,
      value: () => ({ top: 48, right: 800, bottom: 96, left: 240, width: 560, height: 48, x: 240, y: 48 })
    });

    act(() => {
      window.dispatchEvent(new Event("scroll"));
    });

    await waitFor(() => expect(document.querySelector(".header-docked-nav-shell")).toHaveClass("is-visible"));
    const dockedNav = document.querySelector(".header-quick-entity-nav") as HTMLElement;
    fireEvent.click(within(dockedNav).getByRole("button", { name: /^Catalog/i }));
    expect(getPanelByHeading("Catalog")).toBeInTheDocument();
  });

  it("compacts header actions as soon as docked quick navigation blends in", async () => {
    renderAppWithState(createUiIntegrationState());
    fireEvent.click(screen.getByRole("button", { name: "Close onboarding" }));

    switchScreenDrawerAware("modeling");

    const headerBlock = document.querySelector(".header-block");
    const quickNavPanel = document.querySelector("[data-quick-entity-nav-source='true']");
    expect(headerBlock).not.toBeNull();
    expect(quickNavPanel).not.toBeNull();

    Object.defineProperty(headerBlock, "getBoundingClientRect", {
      configurable: true,
      value: () => ({ top: 0, right: 1200, bottom: 72, left: 0, width: 1200, height: 72, x: 0, y: 0 })
    });
    Object.defineProperty(quickNavPanel, "getBoundingClientRect", {
      configurable: true,
      value: () => {
        const top = 132 - window.scrollY;
        return { top, right: 800, bottom: top + 48, left: 240, width: 560, height: 48, x: 240, y: top };
      }
    });
    Object.defineProperty(window, "scrollY", { configurable: true, writable: true, value: 60 });

    act(() => {
      window.dispatchEvent(new Event("scroll"));
    });

    await waitFor(() => expect(document.querySelector(".header-docked-nav-shell")).toHaveClass("is-visible"));
    expect(headerBlock).toHaveClass("has-center-content");

    Object.defineProperty(window, "scrollY", { configurable: true, writable: true, value: 80 });
    act(() => {
      window.dispatchEvent(new Event("scroll"));
    });

    await waitFor(() => expect(headerBlock).toHaveClass("has-center-content"));
  });
});
