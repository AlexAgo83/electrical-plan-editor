import { fireEvent, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { createUiIntegrationState, getPanelByHeading, renderAppWithState, switchScreenDrawerAware } from "./helpers/app-ui-test-utils";

describe("App integration UI - hover descriptions", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("applies deterministic title fallbacks to button/select/option and keeps explicit title values intact", async () => {
    renderAppWithState(createUiIntegrationState());
    switchScreenDrawerAware("settings");

    const appearancePanel = getPanelByHeading("Appearance preferences");
    const themeModeSelect = within(appearancePanel).getByLabelText("Theme mode");
    await waitFor(() => {
      expect(themeModeSelect).toHaveAttribute("title", "Theme mode");
    });

    const themeLightOption = within(themeModeSelect).getByRole("option", { name: "Light" });
    await waitFor(() => {
      expect(themeLightOption).toHaveAttribute("title", "Theme mode");
    });

    const disabledButton = document.createElement("button");
    disabledButton.type = "button";
    disabledButton.disabled = true;
    disabledButton.textContent = "Disabled control";
    document.body.appendChild(disabledButton);

    await waitFor(() => {
      expect(disabledButton).toHaveAttribute("title", "Disabled control");
    });

    const explicitTitleButton = document.createElement("button");
    explicitTitleButton.type = "button";
    explicitTitleButton.setAttribute("title", "Explicit hover title");
    explicitTitleButton.setAttribute("aria-label", "Different aria label");
    document.body.appendChild(explicitTitleButton);

    fireEvent.mouseEnter(explicitTitleButton);
    await waitFor(() => {
      expect(explicitTitleButton).toHaveAttribute("title", "Explicit hover title");
    });
    expect(explicitTitleButton.getAttribute("data-auto-hover-title")).not.toBe("true");
  });
});
