import { describe, expect, it } from "vitest";
import { appActions, createAppStore } from "../store";
import { asConnectorId } from "./helpers/store-reducer-test-utils";

describe("createAppStore", () => {
  it("notifies subscribers on state change", () => {
    const store = createAppStore();
    let notifications = 0;
    const unsubscribe = store.subscribe(() => {
      notifications += 1;
    });

    store.dispatch(
      appActions.upsertConnector({ id: asConnectorId("C1"), name: "Connector 1", technicalId: "C-1", cavityCount: 2 })
    );

    unsubscribe();

    expect(notifications).toBe(1);
    expect(store.getState().connectors.allIds).toEqual([asConnectorId("C1")]);
  });
});

