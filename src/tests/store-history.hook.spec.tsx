import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  appActions,
  createAppStore,
  createEmptyWorkspaceState,
  createSampleNetworkState
} from "../store";
import { useStoreHistory } from "../app/hooks/useStoreHistory";

describe("useStoreHistory", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it("starts a fresh recent-change list when replacing the whole workspace state", async () => {
    const state = createSampleNetworkState();
    const store = createAppStore(state);
    const activeNetworkId = state.activeNetworkId;
    expect(activeNetworkId).not.toBeNull();

    const { result } = renderHook(() =>
      useStoreHistory({
        store,
        historyLimit: 20
      })
    );

    act(() => {
      result.current.dispatchAction(
        appActions.renameNetwork(activeNetworkId!, "Renamed before replace", "2026-05-30T10:00:00.000Z")
      );
    });
    await waitFor(() => expect(result.current.undoHistoryEntries).toHaveLength(1));
    expect(result.current.undoHistoryEntries[0]?.label).toBe("Network 'NET-MAIN-SAMPLE' renamed");

    act(() => {
      result.current.replaceStateWithHistory(createEmptyWorkspaceState(store.getState().ui.themeMode));
    });

    await waitFor(() => expect(result.current.undoHistoryEntries).toHaveLength(1));
    expect(result.current.undoHistoryEntries[0]?.label).toBe("Workspace state replaced");
    expect(result.current.undoHistoryEntries.some((entry) => entry.label.includes("NET-MAIN-SAMPLE"))).toBe(false);
  });
});
