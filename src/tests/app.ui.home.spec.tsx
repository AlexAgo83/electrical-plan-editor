import { fireEvent, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  createUiIntegrationState,
  createValidationIssueState,
  getPanelByHeading,
  renderAppWithState,
  switchScreenDrawerAware
} from "./helpers/app-ui-test-utils";

describe("home workspace screen", () => {
  it("exposes Home as a primary workspace entry and opens the home panels", () => {
    renderAppWithState(createUiIntegrationState());

    switchScreenDrawerAware("home");

    expect(getPanelByHeading("Start")).toBeInTheDocument();
    expect(getPanelByHeading("Resume")).toBeInTheDocument();
  });

  it("shows active workspace resume summary details", () => {
    renderAppWithState(createUiIntegrationState());

    switchScreenDrawerAware("home");

    const resumePanel = getPanelByHeading("Resume");
    expect(within(resumePanel).getByText(/Active network: Main network sample/i)).toBeInTheDocument();
    expect(within(resumePanel).getByText("Networks")).toBeInTheDocument();
    expect(within(resumePanel).getByText("State")).toBeInTheDocument();
  });

  it("routes home resume CTA to validation", () => {
    renderAppWithState(createValidationIssueState());

    switchScreenDrawerAware("home");
    const resumePanel = getPanelByHeading("Resume");
    fireEvent.click(within(resumePanel).getByRole("button", { name: "Validation" }));

    expect(getPanelByHeading("Validation center")).toBeInTheDocument();
  });
});
