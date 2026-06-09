import { fireEvent, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import {
  asConnectorId,
  createUiIntegrationState,
  getPanelByHeading,
  renderAppWithState,
  switchScreenDrawerAware
} from "./helpers/app-ui-test-utils";

describe("App integration UI - pin role mass edit", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("edits pin roles across connectors and reports CSV paste errors inline", () => {
    const { store } = renderAppWithState(createUiIntegrationState());

    switchScreenDrawerAware("modeling");
    fireEvent.click(within(getPanelByHeading("Connectors")).getByRole("button", { name: "Mass edit" }));
    const panel = screen.getByRole("dialog", { name: "Pin role mass edit" });
    expect(panel).toBeInTheDocument();
    expect(within(panel).getAllByText("C-1").length).toBeGreaterThan(0);

    fireEvent.click(within(panel).getByLabelText("Select C-1 pin 1"));
    fireEvent.change(within(panel).getByLabelText("Current (A)"), { target: { value: "3" } });
    fireEvent.change(within(panel).getByLabelText("Label"), { target: { value: "SUPPLY" } });
    fireEvent.click(within(panel).getByRole("button", { name: "Apply to selected" }));

    expect(store.getState().connectors.byId[asConnectorId("C1")]?.pinElectricalRoles?.[1]).toEqual({
      role: "source",
      currentA: 3,
      label: "SUPPLY"
    });

    const refreshedPanel = screen.getByRole("dialog", { name: "Pin role mass edit" });
    fireEvent.change(within(refreshedPanel).getByLabelText("CSV paste"), {
      target: { value: "missing,2,consumer,1,LOAD" }
    });
    fireEvent.click(within(refreshedPanel).getByRole("button", { name: "Apply CSV" }));
    expect(within(refreshedPanel).getByRole("alert")).toHaveTextContent("unknown connector");

    fireEvent.change(within(refreshedPanel).getByLabelText("CSV paste"), {
      target: { value: "connector,pin,role,currentA,label\nC-1,2,consumer,1.5,LOAD" }
    });
    fireEvent.click(within(refreshedPanel).getByRole("button", { name: "Apply CSV" }));

    expect(store.getState().connectors.byId[asConnectorId("C1")]?.pinElectricalRoles?.[2]).toEqual({
      role: "consumer",
      currentA: 1.5,
      label: "LOAD"
    });
    expect(screen.queryByText("missing,2,consumer,1,LOAD")).not.toBeInTheDocument();
  });
});
