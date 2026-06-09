import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useAppControllerWorkspaceRuntime } from "../app/hooks/controller/useAppControllerWorkspaceRuntime";
import { appActions, createAppStore, createSampleNetworkState } from "../store";

describe("useAppControllerWorkspaceRuntime", () => {
  it("exposes workspace status and dispatches history actions with toasts", async () => {
    const state = createSampleNetworkState();
    const store = createAppStore(state);
    const activeNetworkId = state.activeNetworkId;
    expect(activeNetworkId).not.toBeNull();

    const { result } = renderHook(() =>
      useAppControllerWorkspaceRuntime({
        store,
        state: store.getState(),
        restoreViewportOnUndo: true,
        setPendingNewNodePosition: vi.fn(),
        setActiveScreen: vi.fn(),
        setActiveSubScreen: vi.fn(),
        setInteractionMode: vi.fn(),
        requestConfirmation: vi.fn(() => Promise.resolve(true))
      })
    );

    expect(result.current.isCurrentWorkspaceEmpty).toBe(false);
    expect(result.current.hasBuiltInSampleState).toBe(true);
    expect(typeof result.current.workspaceFileStorage.openWorkspaceFile).toBe("function");

    act(() => {
      result.current.dispatchAction(appActions.renameNetwork(activeNetworkId!, "Runtime boundary", "2026-06-09T12:00:00.000Z"));
    });

    await waitFor(() => expect(result.current.undoHistoryEntries).toHaveLength(1));
    await waitFor(() => expect(result.current.toasts.length).toBeGreaterThan(0));
    expect(result.current.undoHistoryEntries[0]?.label).toBe("Network 'NET-MAIN-SAMPLE' renamed");
    expect(result.current.toasts[0]?.title).toBe("Network updated");
  });
});
