import { fireEvent, within } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { createInitialState } from "../store";
import { getPanelByHeading, renderAppWithState, switchScreenDrawerAware } from "./helpers/app-ui-test-utils";

describe("App integration UI - settings sample controls", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("recreates a catalog validation issues sample from settings", () => {
    renderAppWithState(createInitialState());

    switchScreenDrawerAware("settings");
    const sampleControlsPanel = getPanelByHeading("Sample network controls");
    fireEvent.click(
      within(sampleControlsPanel).getByRole("button", { name: "Recreate catalog validation issues sample" })
    );

    switchScreenDrawerAware("networkScope");
    const networkScopePanel = getPanelByHeading("Network Scope");
    expect(within(networkScopePanel).getByText("Catalog validation issues sample")).toBeInTheDocument();

    switchScreenDrawerAware("validation");
    const validationPanel = getPanelByHeading("Validation center");
    fireEvent.click(within(validationPanel).getByRole("button", { name: /Catalog integrity/i }));
    expect(within(validationPanel).getByText(/CAT-VAL-URL.*invalid URL/i)).toBeInTheDocument();
  });
});
