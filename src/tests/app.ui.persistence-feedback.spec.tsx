import { act, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  clearPendingPersistenceRecovery,
  loadState,
  STORAGE_KEY
} from "../adapters/persistence";
import { App } from "../app/App";
import {
  attachPersistenceSync,
  PERSISTENCE_STORAGE_WARNING_MESSAGE,
  PERSISTENCE_WRITE_FAILURE_MESSAGE
} from "../app/store";
import { appActions, createAppStore, createInitialState } from "../store";
import { asConnectorId } from "./helpers/app-ui-test-utils";

describe("App integration UI - persistence feedback", () => {
  afterEach(() => {
    clearPendingPersistenceRecovery();
  });

  it("shows the existing error banner when persistence writes fail", async () => {
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

      await waitFor(() => {
        expect(screen.getByRole("alert")).toHaveTextContent(PERSISTENCE_WRITE_FAILURE_MESSAGE);
      });
    } finally {
      detach();
    }
  });

  it("shows a non-blocking warning banner when persistence is near the storage quota", async () => {
    const store = createAppStore(createInitialState());
    const save = vi.fn().mockResolvedValue({ ok: true as const, warning: "storage-near-quota" as const });
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

      await waitFor(() => {
        expect(screen.getByRole("alert")).toHaveTextContent(PERSISTENCE_STORAGE_WARNING_MESSAGE);
      });
    } finally {
      detach();
    }
  });

  it("shows boot recovery UI for corrupted persisted storage and commits reset explicitly", async () => {
    const storage = {
      getItem: vi.fn((key: string) => (key === STORAGE_KEY ? "{invalid-json" : null)),
      setItem: vi.fn(),
      removeItem: vi.fn()
    };
    const store = createAppStore(loadState(storage, () => "2026-04-02T08:00:00.000Z"));

    render(<App store={store} />);

    expect(screen.getByRole("alert")).toHaveTextContent(/could not be loaded safely/i);
    const resetButton = screen.getByRole("button", { name: "Reset stored workspace" });
    expect(resetButton).toBeInTheDocument();

    act(() => {
      resetButton.click();
    });

    await waitFor(() => {
      expect(storage.setItem).toHaveBeenCalled();
    });
  });
});
