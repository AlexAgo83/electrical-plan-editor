import { fireEvent, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import {
  createUiIntegrationDenseWiresState, getPanelByHeading, renderAppWithState,
  switchScreenDrawerAware, switchSubScreenDrawerAware
} from "./helpers/app-ui-test-utils";

describe("rejected Modeling edits", () => {
  beforeEach(() => localStorage.clear());

  it.each([
    { side: "A", field: "Way index", message: "Way 2 of connector Connector 1 (C-1) is already occupied by wire Wire 2 (W-2)." },
    { side: "B", field: "Port index", message: "Port 2 of splice Splice 1 (S-1) is already occupied by wire Wire 2 (W-2)." }
  ])("shows an error for an occupied endpoint $side, preserves the draft and allows retry", ({ side, field, message }) => {
    const { store } = renderAppWithState(createUiIntegrationDenseWiresState());
    fireEvent.click(screen.getByRole("button", { name: "Close onboarding" }));
    switchScreenDrawerAware("modeling");
    switchSubScreenDrawerAware("wire");
    fireEvent.click(within(getPanelByHeading("Wires")).getByText("Wire 1"));
    const panel = getPanelByHeading("Edit Wire");
    const endpoint = within(panel).getByRole("group", { name: `Endpoint ${side}` });
    fireEvent.change(within(endpoint).getByLabelText(field), { target: { value: "2" } });
    const wiresBefore = store.getState().wires;
    const occupancyBefore = store.getState().connectorCavityOccupancy;
    const save = within(panel).getByRole("button", { name: "Save" });
    fireEvent.click(save);
    const notification = within(screen.getByRole("region", { name: "Notifications" })).getByRole("status");
    expect(notification).toHaveClass("is-error");
    expect(notification).toHaveTextContent("Action rejected");
    expect(notification).toHaveTextContent(message);
    expect(store.getState().wires).toBe(wiresBefore);
    expect(store.getState().connectorCavityOccupancy).toBe(occupancyBefore);
    expect(within(endpoint).getByLabelText(field)).toHaveValue(2);
    expect(screen.queryByText("Wire updated")).not.toBeInTheDocument();

    fireEvent.click(within(notification).getByRole("button", { name: "Dismiss notification: Action rejected" }));
    fireEvent.click(save);
    expect(within(screen.getByRole("region", { name: "Notifications" })).getByRole("status")).toHaveTextContent(message);
    fireEvent.change(within(endpoint).getByLabelText(field), { target: { value: "5" } });
    fireEvent.click(save);
    expect(store.getState().ui.lastError).toBeNull();
    expect(screen.getByText("Wire updated")).toBeInTheDocument();
  });
});
