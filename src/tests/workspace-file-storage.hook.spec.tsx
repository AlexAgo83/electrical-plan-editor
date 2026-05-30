import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { appActions, createAppStore, createSampleNetworkState } from "../store";
import { useWorkspaceFileStorage } from "../app/hooks/useWorkspaceFileStorage";
import {
  buildWorkspaceFilePayload,
  serializeWorkspaceFilePayload
} from "../app/lib/workspaceFile";

describe("useWorkspaceFileStorage", () => {
  const originalCreateObjectUrl = Object.getOwnPropertyDescriptor(URL, "createObjectURL");
  const originalRevokeObjectUrl = Object.getOwnPropertyDescriptor(URL, "revokeObjectURL");
  const originalShowOpenFilePicker = Object.getOwnPropertyDescriptor(window, "showOpenFilePicker");
  const originalShowSaveFilePicker = Object.getOwnPropertyDescriptor(window, "showSaveFilePicker");

  beforeEach(() => {
    Object.defineProperty(URL, "createObjectURL", {
      configurable: true,
      writable: true,
      value: vi.fn(() => "blob:workspace-file")
    });
    Object.defineProperty(URL, "revokeObjectURL", {
      configurable: true,
      writable: true,
      value: vi.fn()
    });
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();

    if (originalCreateObjectUrl !== undefined) {
      Object.defineProperty(URL, "createObjectURL", originalCreateObjectUrl);
    }
    if (originalRevokeObjectUrl !== undefined) {
      Object.defineProperty(URL, "revokeObjectURL", originalRevokeObjectUrl);
    }
    if (originalShowOpenFilePicker !== undefined) {
      Object.defineProperty(window, "showOpenFilePicker", originalShowOpenFilePicker);
    } else {
      Reflect.deleteProperty(window, "showOpenFilePicker");
    }
    if (originalShowSaveFilePicker !== undefined) {
      Object.defineProperty(window, "showSaveFilePicker", originalShowSaveFilePicker);
    } else {
      Reflect.deleteProperty(window, "showSaveFilePicker");
    }
  });

  it("clears the previous linked handle when save as falls back to download", async () => {
    const state = createSampleNetworkState();
    const payload = buildWorkspaceFilePayload(state, null, "2026-05-30T09:00:00.000Z");
    const linkedCreateWritable = vi.fn(() =>
      Promise.resolve({
        write: vi.fn(),
        close: vi.fn()
      })
    );
    const linkedHandle = {
      name: "linked.epe.json",
      getFile: vi.fn(() =>
        Promise.resolve({
          text: () => Promise.resolve(serializeWorkspaceFilePayload(payload))
        } as File)
      ),
      createWritable: linkedCreateWritable,
      queryPermission: vi.fn(() => Promise.resolve("granted" as const)),
      requestPermission: vi.fn(() => Promise.resolve("granted" as const))
    };
    const store = createAppStore(state);

    Object.defineProperty(window, "showOpenFilePicker", {
      configurable: true,
      writable: true,
      value: vi.fn(() => Promise.resolve([linkedHandle]))
    });
    Object.defineProperty(window, "showSaveFilePicker", {
      configurable: true,
      writable: true,
      value: vi.fn(() => Promise.reject(new Error("disk unavailable")))
    });

    const { result } = renderHook(() =>
      useWorkspaceFileStorage({
        store,
        replaceStateWithHistory: store.replaceState,
        requestConfirmation: vi.fn(() => Promise.resolve(true)),
        notifyToast: vi.fn()
      })
    );

    act(() => {
      result.current.openWorkspaceFile();
    });
    await waitFor(() => expect(result.current.workspaceFileStatus.mode).toBe("linked"));

    act(() => {
      result.current.saveWorkspaceFileAs();
    });
    await waitFor(() => expect(result.current.workspaceFileStatus.saveTarget).toBe("download"));
    expect(result.current.workspaceFileStatus.mode).toBe("local");

    const activeNetworkId = store.getState().activeNetworkId;
    expect(activeNetworkId).not.toBeNull();
    act(() => {
      store.dispatch(appActions.renameNetwork(activeNetworkId!, "Renamed network", "RENAMED-NET"));
    });

    await new Promise((resolve) => {
      window.setTimeout(resolve, 800);
    });
    expect(linkedCreateWritable).not.toHaveBeenCalled();
  });

  it("does not overwrite a linked file that no longer parses as a workspace", async () => {
    const state = createSampleNetworkState();
    const payload = buildWorkspaceFilePayload(state, null, "2026-05-30T09:00:00.000Z");
    const linkedCreateWritable = vi.fn(() =>
      Promise.resolve({
        write: vi.fn(),
        close: vi.fn()
      })
    );
    const linkedHandle = {
      name: "linked.epe.json",
      getFile: vi
        .fn()
        .mockResolvedValueOnce({
          text: () => Promise.resolve(serializeWorkspaceFilePayload(payload))
        } as File)
        .mockResolvedValue({
          text: () => Promise.resolve("{")
        } as File),
      createWritable: linkedCreateWritable,
      queryPermission: vi.fn(() => Promise.resolve("granted" as const)),
      requestPermission: vi.fn(() => Promise.resolve("granted" as const))
    };
    const store = createAppStore(state);

    Object.defineProperty(window, "showOpenFilePicker", {
      configurable: true,
      writable: true,
      value: vi.fn(() => Promise.resolve([linkedHandle]))
    });

    const { result } = renderHook(() =>
      useWorkspaceFileStorage({
        store,
        replaceStateWithHistory: store.replaceState,
        requestConfirmation: vi.fn(() => Promise.resolve(true)),
        notifyToast: vi.fn()
      })
    );

    act(() => {
      result.current.openWorkspaceFile();
    });
    await waitFor(() => expect(result.current.workspaceFileStatus.mode).toBe("linked"));

    act(() => {
      result.current.saveWorkspaceFileNow();
    });

    await waitFor(() => expect(result.current.workspaceFileStatus.conflict).toBe(true));
    expect(result.current.workspaceFileStatus.message).toBe(
      "The linked workspace file could not be read as a valid workspace. Choose which version to keep before overwriting it."
    );
    expect(linkedCreateWritable).not.toHaveBeenCalled();
  });
});
