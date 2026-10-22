import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import type { WireId } from "../core/entities";
import type { AppState } from "../store";
import { createUiIntegrationState, getPanelByHeading, renderAppWithState, switchScreenDrawerAware } from "./helpers/app-ui-test-utils";

function createDriftedState(): { state: AppState; wireId: WireId; technicalId: string } {
  const base = createUiIntegrationState();
  const wireId = base.wires.allIds.find((id) => (base.wires.byId[id]?.routeSegmentIds.length ?? 0) > 0);
  if (wireId === undefined) {
    throw new Error("Expected a routed wire in the integration state.");
  }
  const wire = base.wires.byId[wireId]!;
  return {
    state: { ...base, wires: { ...base.wires, byId: { ...base.wires.byId, [wireId]: { ...wire, lengthMm: wire.lengthMm + 123 } } } },
    wireId,
    technicalId: wire.technicalId
  };
}

describe("App integration UI - routing drift warnings", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("surfaces drift as read-only Validation warnings, then clears after a manual recompute", async () => {
    const { state, technicalId } = createDriftedState();
    const { store } = renderAppWithState(state);
    const stateBeforeCheck = store.getState();

    switchScreenDrawerAware("validation");
    const summaryPanel = getPanelByHeading("Validation summary");
    const validationPanel = getPanelByHeading("Validation center");

    await waitFor(() => {
      expect(within(validationPanel).getByRole("heading", { name: "Routing consistency" })).toBeInTheDocument();
    });
    expect(within(summaryPanel).getByRole("status")).toHaveTextContent("1 wire would change.");
    expect(within(validationPanel).getByText(/Recompute routes would change 1 wire/)).toBeInTheDocument();
    expect(within(validationPanel).getByText(new RegExp(`Wire '${technicalId}': length`))).toBeInTheDocument();

    // The background check is read-only: no dispatch, revision bump or report dialog.
    expect(store.getState()).toBe(stateBeforeCheck);
    expect(screen.queryByRole("heading", { name: "Recompute report" })).not.toBeInTheDocument();

    const networkRow = within(validationPanel).getByText(/Recompute routes would change 1 wire/).closest("tr") as HTMLElement;
    fireEvent.click(within(networkRow).getByRole("button", { name: "Go to" }));
    const closeOnboardingButton = screen.queryByRole("button", { name: "Close onboarding" });
    if (closeOnboardingButton !== null) {
      fireEvent.click(closeOnboardingButton);
    }
    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Edit network" })).toBeInTheDocument();
    });
    const editPanel = getPanelByHeading("Edit network");
    fireEvent.click(within(editPanel).getByRole("button", { name: "Recompute routes" }));
    expect(await screen.findByText(/1 entity changed|1 change/i)).toBeInTheDocument();

    switchScreenDrawerAware("validation");
    await waitFor(() => {
      expect(within(getPanelByHeading("Validation summary")).getByRole("status")).toHaveTextContent(
        "Stored routes match Recompute routes."
      );
    });
    expect(within(getPanelByHeading("Validation center")).queryByRole("heading", { name: "Routing consistency" })).not.toBeInTheDocument();
  });
});
