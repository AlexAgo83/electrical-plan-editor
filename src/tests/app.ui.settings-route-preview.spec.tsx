import { fireEvent, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import {
  createUiIntegrationState,
  getPanelByHeading,
  renderAppWithState,
  switchScreenDrawerAware
} from "./helpers/app-ui-test-utils";

describe("App integration UI - settings route preview panel", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("hides the route preview panel by default and can re-enable it from settings", () => {
    renderAppWithState(createUiIntegrationState());

    switchScreenDrawerAware("modeling");
    expect(screen.queryByRole("heading", { name: "Route preview" })).toBeNull();
    expect(screen.getByRole("region", { name: "Quick entity navigation" })).toBeInTheDocument();

    switchScreenDrawerAware("settings");
    const globalSettingsPanel = getPanelByHeading("Global preferences");
    const routePreviewToggle = within(globalSettingsPanel).getByLabelText("Show route preview panel");
    expect(routePreviewToggle).not.toBeChecked();
    fireEvent.click(routePreviewToggle);

    switchScreenDrawerAware("modeling");
    expect(screen.getByRole("heading", { name: "Route preview" })).toBeInTheDocument();
  });

  it("persists the route preview panel visibility preference across remounts", () => {
    const firstRender = renderAppWithState(createUiIntegrationState());
    switchScreenDrawerAware("settings");
    fireEvent.click(within(getPanelByHeading("Global preferences")).getByLabelText("Show route preview panel"));

    firstRender.unmount();

    renderAppWithState(createUiIntegrationState());
    switchScreenDrawerAware("settings");
    expect(within(getPanelByHeading("Global preferences")).getByLabelText("Show route preview panel")).toBeChecked();

    switchScreenDrawerAware("modeling");
    expect(screen.getByRole("heading", { name: "Route preview" })).toBeInTheDocument();
  });
});
