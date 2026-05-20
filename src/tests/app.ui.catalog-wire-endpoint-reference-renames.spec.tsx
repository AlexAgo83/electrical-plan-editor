import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { appActions, appReducer } from "../store";
import {
  asCatalogItemId,
  asWireId,
  createUiIntegrationDenseWiresState,
  getPanelByHeading,
  renderAppWithState,
  switchScreenDrawerAware,
  switchSubScreenDrawerAware
} from "./helpers/app-ui-test-utils";

describe("App integration UI - catalog wire endpoint reference renames", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("opens matching wires from endpoint and seal reference table refs", async () => {
    const baseState = createUiIntegrationDenseWiresState();
    const firstWire = baseState.wires.byId[asWireId("W1")];
    const secondWire = baseState.wires.byId[asWireId("W2")];
    if (firstWire === undefined || secondWire === undefined) {
      throw new Error("Expected dense wire integration state.");
    }

    const state = appReducer(
      appReducer(
        appReducer(
          appReducer(
            baseState,
            appActions.upsertCatalogItem({
              id: asCatalogItemId("CAT-LINK"),
              manufacturerReference: "CAT-LINK",
              name: "Linked catalog item",
              connectionCount: 1
            })
          ),
          appActions.upsertCatalogItem({
            id: asCatalogItemId("CAT-LINK-2"),
            manufacturerReference: "CAT-LINK-2",
            name: "Second linked catalog item",
            connectionCount: 1
          })
        ),
        appActions.saveWire({
          ...firstWire,
          endpointAConnectionReference: "TERM-LINK"
        })
      ),
      appActions.saveWire({
        ...secondWire,
        endpointBSealReference: "SEAL-LINK"
      })
    );

    renderAppWithState(state);
    fireEvent.click(screen.getByRole("button", { name: "Close onboarding" }));
    switchScreenDrawerAware("modeling");
    switchSubScreenDrawerAware("catalog");

    const catalogPanel = getPanelByHeading("Catalog");
    fireEvent.click(within(catalogPanel).getByRole("button", { name: "Endpoint refs" }));
    fireEvent.click(await within(catalogPanel).findByRole("button", { name: "TERM-LINK" }));
    expect(within(getPanelByHeading("Edit Wire")).getByDisplayValue("W-1")).toBeInTheDocument();

    switchSubScreenDrawerAware("catalog");
    const refreshedCatalogPanel = getPanelByHeading("Catalog");
    fireEvent.click(within(refreshedCatalogPanel).getByRole("button", { name: "Seal refs" }));
    fireEvent.click(await within(refreshedCatalogPanel).findByRole("button", { name: "SEAL-LINK" }));
    expect(within(getPanelByHeading("Edit Wire")).getByDisplayValue("W-2")).toBeInTheDocument();
  });

  it("edits wire endpoint reference names from the catalog view and propagates matching names after confirmation", async () => {
    const baseState = createUiIntegrationDenseWiresState();
    const firstWire = baseState.wires.byId[asWireId("W1")];
    const secondWire = baseState.wires.byId[asWireId("W2")];
    if (firstWire === undefined || secondWire === undefined) {
      throw new Error("Expected dense wire integration state.");
    }

    const state = appReducer(
      appReducer(
        appReducer(
          baseState,
          appActions.upsertCatalogItem({
            id: asCatalogItemId("CAT-WIRES"),
            manufacturerReference: "CAT-WIRES",
            name: "Wires catalog item",
            connectionCount: 2
          })
        ),
        appActions.saveWire({
          ...firstWire,
          endpointAConnectionReference: "TERM-SHARED",
          endpointAConnectionName: "Old Alpha"
        })
      ),
      appActions.saveWire({
        ...secondWire,
        endpointAConnectionReference: "TERM-SHARED",
        endpointAConnectionName: "Old Beta"
      })
    );

    const { store } = renderAppWithState(state);
    fireEvent.click(screen.getByRole("button", { name: "Close onboarding" }));
    switchScreenDrawerAware("modeling");
    switchSubScreenDrawerAware("catalog");

    const catalogPanel = getPanelByHeading("Catalog");
    fireEvent.click(within(catalogPanel).getByText("CAT-WIRES"));
    fireEvent.click(within(catalogPanel).getByRole("button", { name: "Endpoint refs" }));

    const connectionHeading = await screen.findByRole("heading", { name: "Wire endpoint references" });
    const connectionPanel = connectionHeading.closest<HTMLElement>(".panel");
    expect(connectionPanel).not.toBeNull();
    if (connectionPanel === null) {
      throw new Error("Expected wire endpoint references panel.");
    }

    const sharedRow = within(connectionPanel).getByText("TERM-SHARED").closest("tr");
    expect(sharedRow).not.toBeNull();
    if (sharedRow === null) {
      throw new Error("Expected shared connection reference row.");
    }

    const sharedNameInput = within(sharedRow).getByRole("textbox");
    fireEvent.change(sharedNameInput, {
      target: { value: "Shared Connection" }
    });
    await waitFor(() => expect(sharedNameInput).toHaveValue("Shared Connection"));
    fireEvent.click(within(sharedRow).getByRole("button", { name: "Save" }));

    const dialog = await screen.findByRole("dialog", { name: "Choose connection name" });
    fireEvent.click(within(dialog).getByRole("button", { name: "Shared Connection" }));

    await waitFor(() => {
      const nextState = store.getState();
      expect(nextState.wires.byId[asWireId("W1")]?.endpointAConnectionName).toBe("Shared Connection");
      expect(nextState.wires.byId[asWireId("W2")]?.endpointAConnectionName).toBe("Shared Connection");
    });
  });

  it("propagates an overwrite choice from the catalog view to matching references on both endpoint sides", async () => {
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
          appReducer(
            baseState,
            appActions.upsertCatalogItem({
              id: asCatalogItemId("CAT-GLOBAL"),
              manufacturerReference: "CAT-GLOBAL",
              name: "Global wires catalog item",
              connectionCount: 2
            })
          ),
          appActions.saveWire({
            ...firstWire,
            endpointAConnectionReference: "TERM-CATALOG",
            endpointAConnectionName: "Old Alpha"
          })
        ),
        appActions.saveWire({
          ...secondWire,
          endpointBConnectionReference: "TERM-CATALOG",
          endpointBConnectionName: "Old Beta"
        })
      ),
      appActions.saveWire({
        ...thirdWire,
        endpointAConnectionReference: "TERM-CATALOG",
        endpointAConnectionName: "Old Gamma"
      })
    );

    const { store } = renderAppWithState(state);
    fireEvent.click(screen.getByRole("button", { name: "Close onboarding" }));
    switchScreenDrawerAware("modeling");
    switchSubScreenDrawerAware("catalog");

    const catalogPanel = getPanelByHeading("Catalog");
    fireEvent.click(within(catalogPanel).getByText("CAT-GLOBAL"));
    fireEvent.click(within(catalogPanel).getByRole("button", { name: "Endpoint refs" }));

    const connectionHeading = await screen.findByRole("heading", { name: "Wire endpoint references" });
    const connectionPanel = connectionHeading.closest<HTMLElement>(".panel");
    expect(connectionPanel).not.toBeNull();
    if (connectionPanel === null) {
      throw new Error("Expected wire endpoint references panel.");
    }

    const sharedRow = within(connectionPanel).getByText("TERM-CATALOG").closest("tr");
    expect(sharedRow).not.toBeNull();
    if (sharedRow === null) {
      throw new Error("Expected shared connection reference row.");
    }

    fireEvent.change(within(sharedRow).getByRole("textbox"), {
      target: { value: "Chosen Catalog" }
    });
    fireEvent.click(within(sharedRow).getByRole("button", { name: "Save" }));

    const dialog = await screen.findByRole("dialog", { name: "Choose connection name" });
    fireEvent.click(within(dialog).getByRole("button", { name: "Chosen Catalog" }));

    await waitFor(() => {
      const nextState = store.getState();
      expect(nextState.wires.byId[asWireId("W1")]?.endpointAConnectionName).toBe("Chosen Catalog");
      expect(nextState.wires.byId[asWireId("W2")]?.endpointBConnectionName).toBe("Chosen Catalog");
      expect(nextState.wires.byId[asWireId("W3")]?.endpointAConnectionName).toBe("Chosen Catalog");
    });
  });
});
