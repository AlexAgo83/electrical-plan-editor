/**
 * Central guard for named-workspace sessions.
 *
 * - While a historical version is consulted read-only, every project mutation route (dispatch,
 *   undo/redo, state replacement used by imports and the AI agent) and every background save
 *   (browser persistence, linked-file autosave, lineage autosave) is blocked. Navigation, selection
 *   and exports stay available.
 * - The session token changes whenever the active workspace or session changes, so delayed
 *   callbacks that captured an older token can detect that they are stale and drop their write.
 */
type BlockedMutationListener = (reason: string) => void;

let mutationBlockReason: string | null = null;
let sessionToken = 0;
const blockedMutationListeners = new Set<BlockedMutationListener>();

export function setProjectMutationBlocked(reason: string | null): void {
  mutationBlockReason = reason;
}

export function getProjectMutationBlockReason(): string | null {
  return mutationBlockReason;
}

export function isProjectMutationBlocked(): boolean {
  return mutationBlockReason !== null;
}

/** Background persistence is suspended exactly when project mutations are blocked. */
export function isWorkspacePersistenceSuspended(): boolean {
  return mutationBlockReason !== null;
}

export function reportBlockedMutationAttempt(): void {
  if (mutationBlockReason === null) {
    return;
  }
  for (const listener of blockedMutationListeners) {
    listener(mutationBlockReason);
  }
}

export function subscribeBlockedMutationAttempts(listener: BlockedMutationListener): () => void {
  blockedMutationListeners.add(listener);
  return () => {
    blockedMutationListeners.delete(listener);
  };
}

export function getWorkspaceSessionToken(): number {
  return sessionToken;
}

export function advanceWorkspaceSessionToken(): number {
  sessionToken += 1;
  return sessionToken;
}

export function resetWorkspaceSessionGateForTests(): void {
  mutationBlockReason = null;
  sessionToken = 0;
  blockedMutationListeners.clear();
}
