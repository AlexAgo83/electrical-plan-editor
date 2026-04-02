import { waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { appActions, createAppStore } from "../store";
import { attachPersistenceSync, PERSISTENCE_WRITE_FAILURE_MESSAGE } from "../app/store";
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

  it("surfaces persistence write failures and clears the warning after recovery", async () => {
    const store = createAppStore();
    const save = vi
      .fn()
      .mockReturnValueOnce({ ok: false as const, reason: "write-failed" as const })
      .mockReturnValueOnce({ ok: true as const });
    const detach = attachPersistenceSync(store, { save });

    try {
      store.dispatch(
        appActions.upsertConnector({ id: asConnectorId("C1"), name: "Connector 1", technicalId: "C-1", cavityCount: 2 })
      );
      await waitFor(() => {
        expect(store.getState().ui.lastError?.message).toBe(PERSISTENCE_WRITE_FAILURE_MESSAGE);
      });
      expect(save).toHaveBeenCalledTimes(1);

      store.dispatch(
        appActions.upsertConnector({ id: asConnectorId("C2"), name: "Connector 2", technicalId: "C-2", cavityCount: 2 })
      );
      await waitFor(() => {
        expect(store.getState().ui.lastError).toBeNull();
      });
      expect(save).toHaveBeenCalledTimes(2);
    } finally {
      detach();
    }
  });
});
