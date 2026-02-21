import { fireEvent, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import type { NetworkId } from "../core/entities";
import {
  createUiIntegrationState,
  getPanelByHeading,
  renderAppWithState,
  switchScreen
} from "./helpers/app-ui-test-utils";

function setViewportWidth(width: number): void {
  Object.defineProperty(window, "innerWidth", {
    configurable: true,
    writable: true,
    value: width
  });
  fireEvent(window, new Event("resize"));
}

describe("App integration UI - inspector floating shell", () => {
  beforeEach(() => {
    localStorage.clear();
    setViewportWidth(1280);
  });

  it("keeps inspector collapsed when no entity is selected", () => {
    renderAppWithState(createUiIntegrationState());
    switchScreen("modeling");

    const inspectorShell = screen.getByLabelText("Inspector context panel");
    expect(inspectorShell).toHaveClass("is-collapsed");
    expect(within(getPanelByHeading("Inspector context")).getByText(/No entity selected/i)).toBeInTheDocument();
  });

  it("opens inspector on modeling/analysis/validation when a selection exists", () => {
    renderAppWithState(createUiIntegrationState());
    switchScreen("modeling");

    const connectorsPanel = getPanelByHeading("Connectors");
    fireEvent.click(within(connectorsPanel).getByText("Connector 1"));
    expect(screen.getByLabelText("Inspector context panel")).toHaveClass("is-open");
    expect(within(getPanelByHeading("Inspector context")).getByText("C1")).toBeInTheDocument();

    switchScreen("analysis");
    expect(screen.getByLabelText("Inspector context panel")).toHaveClass("is-open");

    switchScreen("validation");
    expect(screen.getByLabelText("Inspector context panel")).toHaveClass("is-open");
  });

  it("hides inspector on Network Scope and Settings", () => {
    renderAppWithState(createUiIntegrationState());

    switchScreen("networkScope");
    expect(screen.queryByLabelText("Inspector context panel")).not.toBeInTheDocument();

    switchScreen("settings");
    expect(screen.queryByLabelText("Inspector context panel")).not.toBeInTheDocument();
  });

  it("hides inspector when there is no active network", () => {
    const stateWithoutActiveNetwork = {
      ...createUiIntegrationState(),
      activeNetworkId: null as NetworkId | null
    };
    renderAppWithState(stateWithoutActiveNetwork);

    expect(screen.queryByLabelText("Inspector context panel")).not.toBeInTheDocument();
  });

  it("collapses on narrow viewport and supports explicit expand/collapse", () => {
    renderAppWithState(createUiIntegrationState());
    switchScreen("modeling");

    const connectorsPanel = getPanelByHeading("Connectors");
    fireEvent.click(within(connectorsPanel).getByText("Connector 1"));
    expect(screen.getByLabelText("Inspector context panel")).toHaveClass("is-open");

    setViewportWidth(860);
    expect(screen.getByLabelText("Inspector context panel")).toHaveClass("is-collapsed");

    const inspectorPanel = getPanelByHeading("Inspector context");
    fireEvent.click(within(inspectorPanel).getByRole("button", { name: "Expand" }));
    expect(screen.getByLabelText("Inspector context panel")).toHaveClass("is-open");

    fireEvent.click(within(getPanelByHeading("Inspector context")).getByRole("button", { name: "Collapse" }));
    expect(screen.getByLabelText("Inspector context panel")).toHaveClass("is-collapsed");
  });

  it("hides inspector while drawer or operations panel overlays are open", () => {
    renderAppWithState(createUiIntegrationState());
    switchScreen("modeling");

    const connectorsPanel = getPanelByHeading("Connectors");
    fireEvent.click(within(connectorsPanel).getByText("Connector 1"));
    expect(screen.getByLabelText("Inspector context panel")).toHaveClass("is-open");

    fireEvent.click(screen.getByRole("button", { name: "Open menu" }));
    expect(screen.queryByLabelText("Inspector context panel")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Close navigation menu" }));
    expect(screen.getByLabelText("Inspector context panel")).toHaveClass("is-open");

    fireEvent.click(screen.getByRole("button", { name: "Ops & Health" }));
    expect(screen.queryByLabelText("Inspector context panel")).not.toBeInTheDocument();
  });
});
