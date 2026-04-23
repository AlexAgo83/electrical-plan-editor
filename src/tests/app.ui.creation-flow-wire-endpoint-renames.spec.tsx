import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { appActions, appReducer } from "../store";
import {
  asWireId,
  createUiIntegrationDenseWiresState,
  getPanelByHeading,
  renderAppWithState,
  switchScreenDrawerAware,
  switchSubScreenDrawerAware
} from "./helpers/app-ui-test-utils";

describe("App integration UI - creation flow wire endpoint renames", () => {
  beforeEach(() => localStorage.clear());

  it("does not partially apply wire endpoint reference renames when a conflicting choice is discarded", async () => {
    const baseState = createUiIntegrationDenseWiresState();
    const firstWire = baseState.wires.byId[asWireId("W1")];
    const secondWire = baseState.wires.byId[asWireId("W2")];
    const thirdWire = baseState.wires.byId[asWireId("W3")];
    if (firstWire === undefined || secondWire === undefined || thirdWire === undefined) {
      throw new Error("Expected dense wire integration state.");
    }

    const state = appReducer(
      appReducer(
        appReducer(
          baseState,
          appActions.saveWire({
            ...firstWire,
            endpointAConnectionReference: "TERM-A-1",
            endpointAConnectionName: "Current Alpha",
            endpointBConnectionReference: "TERM-B-1",
            endpointBConnectionName: "Current Beta"
          })
        ),
        appActions.saveWire({
          ...secondWire,
          endpointAConnectionReference: "TERM-A-1",
          endpointAConnectionName: "Existing Alpha"
        })
      ),
      appActions.saveWire({
        ...thirdWire,
        endpointAConnectionReference: "TERM-B-1",
        endpointAConnectionName: "Existing Beta"
      })
    );

    const { store } = renderAppWithState(state);
    fireEvent.click(screen.getByRole("button", { name: "Close onboarding" }));
    switchScreenDrawerAware("modeling");
    switchSubScreenDrawerAware("wire");

    fireEvent.click(within(getPanelByHeading("Wires")).getByText("Wire 1"));

    const editWirePanel = getPanelByHeading("Edit Wire");
    const endpointAFieldset = within(editWirePanel).getByRole("group", { name: "Endpoint A" });
    const endpointBFieldset = within(editWirePanel).getByRole("group", { name: "Endpoint B" });
    fireEvent.change(within(endpointAFieldset).getByLabelText("Connection name"), { target: { value: "Alpha Updated" } });
    fireEvent.change(within(endpointBFieldset).getByLabelText("Connection name"), { target: { value: "Beta Updated" } });
    fireEvent.click(within(editWirePanel).getByRole("button", { name: "Save" }));

    const dialog = await screen.findByRole("dialog", { name: "Choose connection name" });
    fireEvent.click(within(dialog).getByRole("button", { name: "Discard" }));

    await waitFor(() => {
      const nextState = store.getState();
      expect(nextState.wires.byId[asWireId("W1")]?.endpointAConnectionName).toBe("Current Alpha");
      expect(nextState.wires.byId[asWireId("W1")]?.endpointBConnectionName).toBe("Current Beta");
      expect(nextState.wires.byId[asWireId("W2")]?.endpointAConnectionName).toBe("Existing Alpha");
      expect(nextState.wires.byId[asWireId("W3")]?.endpointAConnectionName).toBe("Existing Beta");
    });
  });

  it("does not open a false conflict dialog when the opposite endpoint uses a different connection reference", async () => {
    const baseState = createUiIntegrationDenseWiresState();
    const firstWire = baseState.wires.byId[asWireId("W1")];
    const secondWire = baseState.wires.byId[asWireId("W2")];
    if (firstWire === undefined || secondWire === undefined) {
      throw new Error("Expected dense wire integration state.");
    }

    const state = appReducer(
      appReducer(
        baseState,
        appActions.saveWire({
          ...firstWire,
          endpointAConnectionReference: "TERM-SHARED",
          endpointAConnectionName: "Shared Alpha",
          endpointBConnectionReference: "TERM-OTHER",
          endpointBConnectionName: "Other Beta"
        })
      ),
      appActions.saveWire({
        ...secondWire,
        endpointAConnectionReference: "TERM-SHARED",
        endpointAConnectionName: "Shared Alpha"
      })
    );

    const { store } = renderAppWithState(state);
    fireEvent.click(screen.getByRole("button", { name: "Close onboarding" }));
    switchScreenDrawerAware("modeling");
    switchSubScreenDrawerAware("wire");

    fireEvent.click(within(getPanelByHeading("Wires")).getByText("Wire 1"));

    const editWirePanel = getPanelByHeading("Edit Wire");
    const endpointAFieldset = within(editWirePanel).getByRole("group", { name: "Endpoint A" });
    fireEvent.change(within(endpointAFieldset).getByLabelText("Connection name"), { target: { value: "Shared Alpha" } });
    fireEvent.click(within(editWirePanel).getByRole("button", { name: "Save" }));

    await waitFor(() => {
      const nextState = store.getState();
      expect(nextState.wires.byId[asWireId("W1")]?.endpointAConnectionName).toBe("Shared Alpha");
      expect(nextState.wires.byId[asWireId("W1")]?.endpointBConnectionName).toBe("Other Beta");
      expect(nextState.wires.byId[asWireId("W2")]?.endpointAConnectionName).toBe("Shared Alpha");
    });
    expect(screen.queryByRole("dialog", { name: "Choose connection name" })).not.toBeInTheDocument();
  });

  it("does not propagate shared seal names onto endpoints that do not carry the seal reference", async () => {
    const baseState = createUiIntegrationDenseWiresState();
    const firstWire = baseState.wires.byId[asWireId("W1")];
    const secondWire = baseState.wires.byId[asWireId("W2")];
    if (firstWire === undefined || secondWire === undefined) {
      throw new Error("Expected dense wire integration state.");
    }

    const state = appReducer(
      appReducer(
        baseState,
        appActions.saveWire({
          ...firstWire,
          endpointAConnectionReference: "CON_01",
          endpointAConnectionName: "NOM_01",
          endpointBSealReference: "SEAL_SHARED",
          endpointBSealName: "Seal Shared"
        })
      ),
      appActions.saveWire({
        ...secondWire,
        endpointAConnectionReference: "CON_01",
        endpointAConnectionName: "NOM_01",
        endpointASealReference: "SEAL_SHARED",
        endpointASealName: "Seal Shared",
        endpointBSealReference: undefined,
        endpointBSealName: undefined
      })
    );

    const { store } = renderAppWithState(state);
    fireEvent.click(screen.getByRole("button", { name: "Close onboarding" }));
    switchScreenDrawerAware("modeling");
    switchSubScreenDrawerAware("wire");

    fireEvent.click(within(getPanelByHeading("Wires")).getByText("Wire 1"));

    const editWirePanel = getPanelByHeading("Edit Wire");
    const endpointAFieldset = within(editWirePanel).getByRole("group", { name: "Endpoint A" });
    const endpointBFieldset = within(editWirePanel).getByRole("group", { name: "Endpoint B" });
    fireEvent.change(within(endpointAFieldset).getByLabelText("Connection name"), { target: { value: "NOM_01" } });
    fireEvent.change(within(endpointBFieldset).getByLabelText("Seal name"), { target: { value: "Seal Shared" } });
    fireEvent.click(within(editWirePanel).getByRole("button", { name: "Save" }));

    await waitFor(() => {
      const nextState = store.getState();
      expect(nextState.wires.byId[asWireId("W1")]?.endpointBSealName).toBe("Seal Shared");
      expect(nextState.wires.byId[asWireId("W2")]?.endpointASealName).toBe("Seal Shared");
      expect(nextState.wires.byId[asWireId("W2")]?.endpointBSealReference).toBeUndefined();
      expect(nextState.wires.byId[asWireId("W2")]?.endpointBSealName).toBeUndefined();
    });
    expect(screen.queryByRole("dialog", { name: "Choose seal name" })).not.toBeInTheDocument();
  });

  it("propagates a confirmed connection name overwrite to every matching reference occurrence in the dataset", async () => {
    const baseState = createUiIntegrationDenseWiresState();
    const firstWire = baseState.wires.byId[asWireId("W1")];
    const secondWire = baseState.wires.byId[asWireId("W2")];
    const thirdWire = baseState.wires.byId[asWireId("W3")];
    if (firstWire === undefined || secondWire === undefined || thirdWire === undefined) {
      throw new Error("Expected dense wire integration state.");
    }

    const state = appReducer(
      appReducer(
        appReducer(
          baseState,
          appActions.saveWire({
            ...firstWire,
            endpointAConnectionReference: "TERM-GLOBAL",
            endpointAConnectionName: "Old Alpha"
          })
        ),
        appActions.saveWire({
          ...secondWire,
          endpointBConnectionReference: "TERM-GLOBAL",
          endpointBConnectionName: "Old Beta"
        })
      ),
      appActions.saveWire({
        ...thirdWire,
        endpointAConnectionReference: "TERM-GLOBAL",
        endpointAConnectionName: "Old Gamma"
      })
    );

    const { store } = renderAppWithState(state);
    fireEvent.click(screen.getByRole("button", { name: "Close onboarding" }));
    switchScreenDrawerAware("modeling");
    switchSubScreenDrawerAware("wire");

    fireEvent.click(within(getPanelByHeading("Wires")).getByText("Wire 1"));

    const editWirePanel = getPanelByHeading("Edit Wire");
    const endpointAFieldset = within(editWirePanel).getByRole("group", { name: "Endpoint A" });
    fireEvent.change(within(endpointAFieldset).getByLabelText("Connection name"), { target: { value: "Chosen Global" } });
    fireEvent.click(within(editWirePanel).getByRole("button", { name: "Save" }));

    const dialog = await screen.findByRole("dialog", { name: "Choose connection name" });
    fireEvent.click(within(dialog).getByRole("button", { name: "Chosen Global" }));

    await waitFor(() => {
      const nextState = store.getState();
      expect(nextState.wires.byId[asWireId("W1")]?.endpointAConnectionName).toBe("Chosen Global");
      expect(nextState.wires.byId[asWireId("W2")]?.endpointBConnectionName).toBe("Chosen Global");
      expect(nextState.wires.byId[asWireId("W3")]?.endpointAConnectionName).toBe("Chosen Global");
    });
  });

  it("propagates a selected existing connection name choice to every matching reference occurrence", async () => {
    const baseState = createUiIntegrationDenseWiresState();
    const firstWire = baseState.wires.byId[asWireId("W1")];
    const secondWire = baseState.wires.byId[asWireId("W2")];
    const thirdWire = baseState.wires.byId[asWireId("W3")];
    if (firstWire === undefined || secondWire === undefined || thirdWire === undefined) {
      throw new Error("Expected dense wire integration state.");
    }

    const state = appReducer(
      appReducer(
        appReducer(
          baseState,
          appActions.saveWire({
            ...firstWire,
            endpointAConnectionReference: "TERM-EXISTING",
            endpointAConnectionName: "Name Alpha"
          })
        ),
        appActions.saveWire({
          ...secondWire,
          endpointBConnectionReference: "TERM-EXISTING",
          endpointBConnectionName: "Name Beta"
        })
      ),
      appActions.saveWire({
        ...thirdWire,
        endpointAConnectionReference: "TERM-EXISTING",
        endpointAConnectionName: "Name Gamma"
      })
    );

    const { store } = renderAppWithState(state);
    fireEvent.click(screen.getByRole("button", { name: "Close onboarding" }));
    switchScreenDrawerAware("modeling");
    switchSubScreenDrawerAware("wire");

    fireEvent.click(within(getPanelByHeading("Wires")).getByText("Wire 1"));

    const editWirePanel = getPanelByHeading("Edit Wire");
    const endpointAFieldset = within(editWirePanel).getByRole("group", { name: "Endpoint A" });
    fireEvent.change(within(endpointAFieldset).getByLabelText("Connection name"), { target: { value: "Draft Delta" } });
    fireEvent.click(within(editWirePanel).getByRole("button", { name: "Save" }));

    const dialog = await screen.findByRole("dialog", { name: "Choose connection name" });
    fireEvent.click(within(dialog).getByRole("button", { name: "Name Beta" }));

    await waitFor(() => {
      const nextState = store.getState();
      expect(nextState.wires.byId[asWireId("W1")]?.endpointAConnectionName).toBe("Name Beta");
      expect(nextState.wires.byId[asWireId("W2")]?.endpointBConnectionName).toBe("Name Beta");
      expect(nextState.wires.byId[asWireId("W3")]?.endpointAConnectionName).toBe("Name Beta");
    });
  });

  it("propagates the currently edited connection name choice when another wire has a conflicting variant", async () => {
    const baseState = createUiIntegrationDenseWiresState();
    const secondWire = baseState.wires.byId[asWireId("W2")];
    const thirdWire = baseState.wires.byId[asWireId("W3")];
    if (secondWire === undefined || thirdWire === undefined) {
      throw new Error("Expected dense wire integration state.");
    }

    const state = appReducer(
      appReducer(
        baseState,
        appActions.saveWire({
          ...secondWire,
          technicalId: "W-2",
          endpointBConnectionReference: "DJ627A-7.8CL",
          endpointBConnectionName: "DJ7011-8-11 connectio",
          endpointBSealReference: "HDI014",
          endpointBSealName: "DJ7021-8-11 seal"
        })
      ),
      appActions.saveWire({
        ...thirdWire,
        technicalId: "W-3",
        endpointAConnectionReference: "DJ627A-7.8CL",
        endpointAConnectionName: "DJ7011-8-11 connection",
        endpointASealReference: "HDI014",
        endpointASealName: "DJ7021-8-11 seal"
      })
    );

    const { store } = renderAppWithState(state);
    fireEvent.click(screen.getByRole("button", { name: "Close onboarding" }));
    switchScreenDrawerAware("modeling");
    switchSubScreenDrawerAware("wire");

    fireEvent.click(within(getPanelByHeading("Wires")).getByText("W-2"));

    const editWirePanel = getPanelByHeading("Edit Wire");
    fireEvent.click(within(editWirePanel).getByRole("button", { name: "Save" }));

    const dialog = await screen.findByRole("dialog", { name: "Choose connection name" });
    fireEvent.click(within(dialog).getByRole("button", { name: "DJ7011-8-11 connectio" }));

    await waitFor(() => {
      const nextState = store.getState();
      const nextWire2 = Object.values(nextState.wires.byId).find((wire) => wire.technicalId === "W-2");
      const nextWire3 = Object.values(nextState.wires.byId).find((wire) => wire.technicalId === "W-3");
      expect(nextWire2?.endpointBConnectionName).toBe("DJ7011-8-11 connectio");
      expect(nextWire3?.endpointAConnectionName).toBe("DJ7011-8-11 connectio");
    });
  });
});
