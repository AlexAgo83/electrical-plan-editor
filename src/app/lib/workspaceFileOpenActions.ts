import { openWorkspaceFileHandleInNewTab, type WorkspaceFileHandle } from "./workspaceFileAccess";

type NotifyToast = (title: string, options?: { message?: string; variant?: "success" | "info" | "warning" | "error" }) => void;

interface OpenWorkspaceHandleWithFeedbackParams {
  handle: WorkspaceFileHandle;
  blockedMessage: string;
  unavailableMessage: string;
  notifyToast: NotifyToast;
  onUnavailable: () => void;
}

export async function openWorkspaceHandleWithFeedback({
  handle,
  blockedMessage,
  unavailableMessage,
  notifyToast,
  onUnavailable
}: OpenWorkspaceHandleWithFeedbackParams): Promise<void> {
  try {
    if (await openWorkspaceFileHandleInNewTab(handle) === "blocked") {
      notifyToast("Workspace file blocked", {
        message: blockedMessage,
        variant: "warning"
      });
    }
  } catch {
    notifyToast("Workspace file cannot be opened", {
      message: unavailableMessage,
      variant: "error"
    });
    onUnavailable();
  }
}
