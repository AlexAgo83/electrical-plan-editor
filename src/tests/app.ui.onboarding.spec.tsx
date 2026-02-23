import { fireEvent, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import {
  createUiIntegrationState,
  getPanelByHeading,
  renderAppWithState,
  switchScreenDrawerAware,
  switchSubScreenDrawerAware
} from "./helpers/app-ui-test-utils";

describe("App integration UI - onboarding", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("opens shared connector/splice contextual onboarding help from both panels with in-context CTA", () => {
    renderAppWithState(createUiIntegrationState());
    fireEvent.click(screen.getByRole("button", { name: "Close onboarding" }));
    switchScreenDrawerAware("modeling");

    const connectorsPanel = getPanelByHeading("Connectors");
    fireEvent.click(within(connectorsPanel).getByRole("button", { name: "Help" }));

    const connectorsHelpDialog = screen.getByRole("dialog", { name: "Build the connectors and splices library" });
    expect(within(connectorsHelpDialog).getByLabelText("Do not open automatically on app load")).toBeInTheDocument();
    expect(within(connectorsHelpDialog).getByRole("button", { name: "Scroll to Connectors" })).toBeInTheDocument();
    fireEvent.click(within(connectorsHelpDialog).getByRole("button", { name: "Close onboarding" }));

    switchSubScreenDrawerAware("splice");
    const splicesPanel = getPanelByHeading("Splices");
    fireEvent.click(within(splicesPanel).getByRole("button", { name: "Help" }));

    expect(screen.getByRole("dialog", { name: "Build the connectors and splices library" })).toBeInTheDocument();
  });
});
