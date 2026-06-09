import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createUiIntegrationState, getPanelByHeading, renderAppWithState, switchScreenDrawerAware } from "./helpers/app-ui-test-utils";

describe("App integration UI - wire export preview", () => {
  const originalCreateObjectUrl = Object.getOwnPropertyDescriptor(URL, "createObjectURL");
  const originalRevokeObjectUrl = Object.getOwnPropertyDescriptor(URL, "revokeObjectURL");

  afterEach(() => {
    vi.restoreAllMocks();
    if (originalCreateObjectUrl !== undefined) {
      Object.defineProperty(URL, "createObjectURL", originalCreateObjectUrl);
    }
    if (originalRevokeObjectUrl !== undefined) {
      Object.defineProperty(URL, "revokeObjectURL", originalRevokeObjectUrl);
    }
  });

  it("opens a preview for XLSX wire export before confirmation", async () => {
    Object.defineProperty(URL, "createObjectURL", {
      configurable: true,
      writable: true,
      value: vi.fn(() => "blob:wire-xlsx")
    });
    Object.defineProperty(URL, "revokeObjectURL", {
      configurable: true,
      writable: true,
      value: vi.fn()
    });
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => undefined);

    renderAppWithState(createUiIntegrationState());
    const closeOnboardingButton = screen.queryByRole("button", { name: "Close onboarding" });
    if (closeOnboardingButton !== null) {
      fireEvent.click(closeOnboardingButton);
    }

    switchScreenDrawerAware("settings");
    const bomSettingsPanel = getPanelByHeading("Catalog & BOM setup");
    fireEvent.change(within(bomSettingsPanel).getByLabelText("Tabular export format"), {
      target: { value: "xlsx" }
    });

    switchScreenDrawerAware("modeling");
    const secondaryNavRow = document.querySelector(".workspace-nav-row.secondary");
    expect(secondaryNavRow).not.toBeNull();
    fireEvent.click(within(secondaryNavRow as HTMLElement).getByRole("button", { name: /^Wire$/, hidden: true }));

    const wiresPanel = getPanelByHeading("Wires");
    fireEvent.click(within(wiresPanel).getByRole("button", { name: "XLSX" }));

    const previewDialog = await screen.findByRole("dialog", { name: "Wire export preview" });
    expect(within(previewDialog).getByText("Modeling wires")).toBeInTheDocument();
    expect(within(previewDialog).getByText(/wire-list-modeling\.xlsx/i)).toBeInTheDocument();

    expect(within(previewDialog).getByRole("button", { name: "Export" })).toBeInTheDocument();
    fireEvent.click(within(previewDialog).getByRole("button", { name: "Cancel" }));

    await waitFor(() => {
      expect(screen.queryByRole("dialog", { name: "Wire export preview" })).toBeNull();
    });
  });
});
