import { fireEvent, waitFor, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { createUiIntegrationState, getPanelByHeading, renderAppWithState, switchScreen } from "./helpers/app-ui-test-utils";

describe("App integration UI - import/export", () => {
  it("reports export capability feedback from settings", () => {
    renderAppWithState(createUiIntegrationState());
    switchScreen("settings");

    const panel = getPanelByHeading("Import / Export networks");
    fireEvent.click(within(panel).getByRole("button", { name: "Export all" }));

    expect(
      within(panel).queryByText(/Exported 1 network\(s\)/) ?? within(panel).getByText("Export is not available in this environment.")
    ).toBeInTheDocument();
  });

  it("keeps active context stable when import file is invalid", async () => {
    const { store } = renderAppWithState(createUiIntegrationState());
    switchScreen("settings");
    const initialActiveNetworkId = store.getState().activeNetworkId;

    const panel = getPanelByHeading("Import / Export networks");
    const fileInput = panel.querySelector('input[type="file"]');
    expect(fileInput).not.toBeNull();

    const invalidFile = new File(["{bad-json"], "broken.json", { type: "application/json" });
    fireEvent.change(fileInput as HTMLInputElement, {
      target: { files: [invalidFile] }
    });

    await waitFor(() => {
      expect(
        within(panel).queryByText("Invalid JSON file.") ?? within(panel).getByText("Unable to read selected file.")
      ).toBeInTheDocument();
    });
    expect(store.getState().activeNetworkId).toBe(initialActiveNetworkId);
  });
});
