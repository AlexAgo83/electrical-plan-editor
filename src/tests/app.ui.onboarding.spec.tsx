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
    expect(within(connectorsHelpDialog).getByRole("button", { name: "Open Splices" })).toBeInTheDocument();
    fireEvent.click(within(connectorsHelpDialog).getByRole("button", { name: "Close onboarding" }));

    switchSubScreenDrawerAware("splice");
    const splicesPanel = getPanelByHeading("Splices");
    fireEvent.click(within(splicesPanel).getByRole("button", { name: "Help" }));

    const splicesHelpDialog = screen.getByRole("dialog", { name: "Build the connectors and splices library" });
    expect(within(splicesHelpDialog).getByRole("button", { name: "Scroll to Splices" })).toBeInTheDocument();
    expect(within(splicesHelpDialog).getByRole("button", { name: "Open Connectors" })).toBeInTheDocument();
  });

  it("moves focus into onboarding modal and restores focus to the trigger on Escape close", () => {
    renderAppWithState(createUiIntegrationState());
    fireEvent.click(screen.getByRole("button", { name: "Close onboarding" }));
    switchScreenDrawerAware("modeling");

    const connectorsPanel = getPanelByHeading("Connectors");
    const helpButton = within(connectorsPanel).getByRole("button", { name: "Help" });
    helpButton.focus();
    expect(helpButton).toHaveFocus();

    fireEvent.click(helpButton);

    const dialog = screen.getByRole("dialog", { name: "Build the connectors and splices library" });
    const closeButton = within(dialog).getByRole("button", { name: "Close onboarding" });
    expect(closeButton).toHaveFocus();

    fireEvent.keyDown(dialog, { key: "Escape" });
    expect(screen.queryByRole("dialog", { name: "Build the connectors and splices library" })).toBeNull();
    expect(helpButton).toHaveFocus();
  });

  it("keeps keyboard tab navigation trapped inside the onboarding modal", () => {
    renderAppWithState(createUiIntegrationState());
    fireEvent.click(screen.getByRole("button", { name: "Close onboarding" }));
    switchScreenDrawerAware("modeling");

    const connectorsPanel = getPanelByHeading("Connectors");
    fireEvent.click(within(connectorsPanel).getByRole("button", { name: "Help" }));

    const dialog = screen.getByRole("dialog", { name: "Build the connectors and splices library" });
    const closeButton = within(dialog).getByRole("button", { name: "Close onboarding" });
    const lastTargetAction = within(dialog).getByRole("button", { name: "Open Splices" });

    lastTargetAction.focus();
    expect(lastTargetAction).toHaveFocus();
    fireEvent.keyDown(lastTargetAction, { key: "Tab" });
    expect(closeButton).toHaveFocus();

    closeButton.focus();
    expect(closeButton).toHaveFocus();
    fireEvent.keyDown(closeButton, { key: "Tab", shiftKey: true });
    expect(lastTargetAction).toHaveFocus();
  });
});
