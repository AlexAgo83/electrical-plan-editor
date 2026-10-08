/**
 * Shortcuts outside Settings ("Manage workspaces", recovery links) open Settings and ask the
 * Workspace storage section to take focus once it is mounted. The request survives the lazy
 * Settings mount: the section consumes it on mount or when the event fires.
 */
export const WORKSPACE_STORAGE_SECTION_ID = "settings-workspace-storage";
const FOCUS_EVENT = "app:workspace-storage-focus-requested";

let pendingTarget: string | null = null;

export function requestWorkspaceStorageFocus(target: string = WORKSPACE_STORAGE_SECTION_ID): void {
  pendingTarget = target;
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(FOCUS_EVENT));
  }
}

export function consumeWorkspaceStorageFocusRequest(): string | null {
  const target = pendingTarget;
  pendingTarget = null;
  return target;
}

export function subscribeWorkspaceStorageFocusRequests(listener: () => void): () => void {
  if (typeof window === "undefined") {
    return () => undefined;
  }
  window.addEventListener(FOCUS_EVENT, listener);
  return () => window.removeEventListener(FOCUS_EVENT, listener);
}
