import { act, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { App } from "../app/App";
import { attachPersistenceSync, PERSISTENCE_WRITE_FAILURE_MESSAGE } from "../app/store";
import { appActions, createAppStore, createInitialState } from "../store";
import { asConnectorId } from "./helpers/app-ui-test-utils";

describe("App integration UI - persistence feedback", () => {
  it("shows the existing error banner when persistence writes fail", () => {
    const store = createAppStore(createInitialState());
    const save = vi.fn().mockReturnValue({ ok: false as const, reason: "write-failed" as const });
    const detach = attachPersistenceSync(store, { save });

    try {
      render(<App store={store} />);

      act(() => {
        store.dispatch(
          appActions.upsertConnector({
            id: asConnectorId("C1"),
            name: "Connector 1",
            technicalId: "C-1",
            cavityCount: 2
          })
        );
      });

      expect(screen.getByRole("alert")).toHaveTextContent(PERSISTENCE_WRITE_FAILURE_MESSAGE);
    } finally {
      detach();
    }
  });
});
