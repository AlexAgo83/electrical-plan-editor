import { fireEvent, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { createInitialState } from "../store";
import { getPanelByHeading, renderAppWithState, switchScreen } from "./helpers/app-ui-test-utils";

describe("plan revision button", () => {
  beforeEach(() => localStorage.clear());

  it("advances the draft without submitting, then saves and reopens the literal index", async () => {
    const { store } = renderAppWithState(createInitialState());
    const networkId = store.getState().activeNetworkId!;
    switchScreen("networkScope");
    const openForm = () => {
      fireEvent.click(within(getPanelByHeading("Network Scope")).getByText("Main network (Sample)").closest("tr")!);
      return getPanelByHeading("Edit network");
    };
    let panel = openForm();
    const input = within(panel).getByLabelText(/Plan revision \(optional\)/);
    const next = within(panel).getByRole("button", { name: "Next plan revision" });
    for (const value of ["OR/00", "A/01", "B/02", "C/03"]) {
      fireEvent.click(next);
      expect(input).toHaveValue(value);
      expect(store.getState().networks.byId[networkId]?.planRevision).toBeUndefined();
    }
    fireEvent.click(within(panel).getByRole("button", { name: "Save network" }));
    await waitFor(() => expect(store.getState().networks.byId[networkId]?.planRevision).toBe("C/03"));
    fireEvent.click(within(panel).getByRole("button", { name: "Cancel" }));
    panel = openForm();
    expect(within(panel).getByLabelText(/Plan revision \(optional\)/)).toHaveValue("C/03");
  });

  it("steps back in the draft, saves explicitly and reopens the saved index", async () => {
    const state = createInitialState();
    const networkId = state.activeNetworkId!;
    state.networks.byId[networkId]!.planRevision = "C/03";
    const { store } = renderAppWithState(state);
    switchScreen("networkScope");
    const openForm = () => {
      fireEvent.click(within(getPanelByHeading("Network Scope")).getByText("Main network (Sample)").closest("tr")!);
      return getPanelByHeading("Edit network");
    };
    let panel = openForm();
    const input = within(panel).getByLabelText(/Plan revision \(optional\)/);
    const previous = within(panel).getByRole("button", { name: "Previous plan revision" });
    for (const value of ["B/02", "A/01", "OR/00"]) {
      fireEvent.click(previous);
      expect(input).toHaveValue(value);
      expect(store.getState().networks.byId[networkId]?.planRevision).toBe("C/03");
    }
    expect(previous).toBeDisabled();
    fireEvent.click(within(panel).getByRole("button", { name: "Save network" }));
    await waitFor(() => expect(store.getState().networks.byId[networkId]?.planRevision).toBe("OR/00"));
    fireEvent.click(within(panel).getByRole("button", { name: "Cancel" }));
    panel = openForm();
    expect(within(panel).getByLabelText(/Plan revision \(optional\)/)).toHaveValue("OR/00");
  });

  it("disables stepping back for empty, original and free-text revisions and discards cancelled changes", () => {
    renderAppWithState(createInitialState());
    switchScreen("networkScope");
    const create = () => fireEvent.click(within(getPanelByHeading("Network Scope")).getByRole("button", { name: "New" }));
    create();
    const panel = getPanelByHeading("Create network");
    const input = within(panel).getByLabelText(/Plan revision \(optional\)/);
    const previous = within(panel).getByRole("button", { name: "Previous plan revision" });
    for (const value of ["", "   ", "OR/00", "legacy B02", "A/02"]) {
      fireEvent.change(input, { target: { value } });
      expect(previous).toBeDisabled();
      fireEvent.click(previous);
      expect(input).toHaveValue(value);
      expect(input).toBeEnabled();
    }
    fireEvent.change(input, { target: { value: "Z/26" } });
    expect(previous).toBeEnabled();
    fireEvent.click(previous);
    expect(input).toHaveValue("Y/25");
    fireEvent.click(within(panel).getByRole("button", { name: "Cancel" }));
    create();
    expect(within(getPanelByHeading("Create network")).getByLabelText(/Plan revision \(optional\)/)).toHaveValue("");
  });

  it("preserves free text and Z/26 while keeping manual editing available", () => {
    renderAppWithState(createInitialState());
    switchScreen("networkScope");
    fireEvent.click(within(getPanelByHeading("Network Scope")).getByRole("button", { name: "New" }));
    const panel = getPanelByHeading("Create network");
    const input = within(panel).getByLabelText(/Plan revision \(optional\)/);
    const next = within(panel).getByRole("button", { name: "Next plan revision" });
    for (const value of ["legacy B02", "A/02", "Z/26"]) {
      fireEvent.change(input, { target: { value } });
      expect(next).toBeDisabled();
      fireEvent.click(next);
      expect(input).toHaveValue(value);
      expect(input).toBeEnabled();
    }
    fireEvent.change(input, { target: { value: "OR/00" } });
    expect(next).toBeEnabled();
    fireEvent.click(next);
    expect(input).toHaveValue("A/01");
    fireEvent.click(within(panel).getByRole("button", { name: "Cancel" }));
    fireEvent.click(within(getPanelByHeading("Network Scope")).getByRole("button", { name: "New" }));
    expect(within(getPanelByHeading("Create network")).getByLabelText(/Plan revision \(optional\)/)).toHaveValue("");
  });
});
