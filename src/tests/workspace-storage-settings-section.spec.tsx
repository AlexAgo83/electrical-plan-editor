import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { SettingsWorkspaceStorageSection, type LegacyWorkspaceFileControls } from "../app/components/workspace/SettingsWorkspaceStorageSection";
import { HomeWorkspaceLineagesPanel, WorkspaceLineageReadOnlyBanner } from "../app/components/workspace/WorkspaceLineagePanels";
import type { WorkspaceLineageModel } from "../app/hooks/useWorkspaceLineages";
import type { LineageSessionSnapshot } from "../app/lib/lineage/lineageSessionController";
import { lineageNoticeTargetId } from "../app/lib/lineage/lineageNotices";
import { consumeWorkspaceStorageFocusRequest, requestWorkspaceStorageFocus } from "../app/lib/workspaceStorageFocus";
import type { WorkspaceFileStorageStatus } from "../app/hooks/useWorkspaceFileStorage";

function legacyStatus(overrides: Partial<WorkspaceFileStorageStatus> = {}): WorkspaceFileStorageStatus {
  return {
    mode: "local",
    label: "Local",
    fileName: null,
    resumeFileName: null,
    canResume: false,
    resumeStatus: "none",
    fileAvailability: "unknown",
    directFileAccessSupported: true,
    saveTarget: "local-cache",
    lastSavedAtIso: null,
    permission: "unknown",
    message: null,
    conflict: false,
    isSaving: false,
    ...overrides
  };
}

function legacyControls(status: WorkspaceFileStorageStatus): LegacyWorkspaceFileControls {
  return {
    workspaceFileStatus: status,
    openWorkspaceFile: vi.fn(),
    relinkWorkspaceFile: vi.fn(),
    resumeWorkspaceFile: vi.fn(),
    saveWorkspaceFileNow: vi.fn(),
    saveWorkspaceFileAs: vi.fn(),
    unlinkWorkspaceFile: vi.fn(),
    openLinkedWorkspaceFile: vi.fn(),
    openResumableWorkspaceFile: vi.fn(),
    loadLinkedFileVersion: vi.fn(),
    keepLocalWorkspaceVersion: vi.fn()
  };
}

function snapshot(overrides: Partial<LineageSessionSnapshot> = {}): LineageSessionSnapshot {
  return {
    ready: true,
    libraryDurable: true,
    directoryAccessSupported: true,
    records: [],
    active: null,
    save: {
      dirty: false,
      saving: false,
      durability: "none",
      lastDurableSaveIso: null,
      localRecovery: "none",
      pendingPortableExport: false,
      downloadInitiatedIso: null,
      permission: "not-applicable",
      conflict: false,
      error: null
    },
    historical: null,
    busy: false,
    preservedLegacySnapshot: false,
    lastReconcileReport: null,
    ...overrides
  };
}

function folderSnapshot(overrides: Partial<LineageSessionSnapshot> = {}, manifest: unknown = { versions: [], handoffs: [], divergentHeads: [] }): LineageSessionSnapshot {
  return snapshot({
    records: [{ workspaceId: "workspace_a", displayName: "Série", storage: "folder", folderName: "serie" } as LineageSessionSnapshot["records"][number]],
    active: {
      workspaceId: "workspace_a",
      displayName: "Série",
      slug: "serie",
      storage: "folder",
      folderName: "serie",
      manifest,
      versionLabels: new Map(),
      baseVersionId: null,
      restoredFromVersionId: null,
      issues: []
    } as unknown as LineageSessionSnapshot["active"],
    ...overrides
  });
}

function fakeModel(state: LineageSessionSnapshot): WorkspaceLineageModel {
  const ok = vi.fn(() => Promise.resolve(true));
  return {
    snapshot: state,
    dialog: { kind: "none" },
    openDialog: vi.fn(),
    closeDialog: vi.fn(),
    switchTo: ok,
    saveNow: ok,
    createLineage: ok,
    rename: ok,
    createVersion: ok,
    openHistorical: ok,
    returnToWorking: vi.fn(),
    restoreFromVersion: ok,
    createHandoff: ok,
    verifyHandoff: vi.fn(() => Promise.resolve(null)),
    downloadAttachment: ok,
    downloadVersion: ok,
    exportPackage: ok,
    importPackageFile: ok,
    openFolder: ok,
    relinkFolder: ok,
    chooseWorkingHead: ok,
    adoptOrphanVersions: ok,
    previewLegacyFiles: vi.fn(),
    applyLegacyImport: ok,
    downloadPreservedLegacySnapshot: ok,
    discardPreservedLegacySnapshot: vi.fn(() => Promise.resolve())
  } as unknown as WorkspaceLineageModel;
}

describe("Settings > Workspace storage section", () => {
  afterEach(() => {
    consumeWorkspaceStorageFocusRequest();
  });

  it("hides an unrelated linked-file conflict and autosave link while a named workspace is active", () => {
    const legacy = legacyControls(legacyStatus({ mode: "linked", fileName: "old.epe.json", conflict: true, saveTarget: "linked-file" }));
    render(<SettingsWorkspaceStorageSection model={fakeModel(folderSnapshot())} legacy={legacy} normalizedQuery="" />);
    expect(screen.queryByRole("region", { name: "Single-file compatibility" })).toBeNull();
    expect(screen.queryByRole("alert")).toBeNull();
    for (const name of ["Use a file for autosave", "Stop autosave link", "Load file version", "Keep local version", "Resume workspace file"]) {
      expect(screen.queryByRole("button", { name })).toBeNull();
    }
    expect(screen.queryByText(/old\.epe\.json/)).toBeNull();
  });

  it("keeps a legacy linked session able to save, relink, unlink and resolve its conflict, with a single create action", () => {
    const legacy = legacyControls(legacyStatus({ mode: "linked", fileName: "plan.epe.json", conflict: true, saveTarget: "linked-file", permission: "granted" }));
    const model = fakeModel(snapshot());
    render(<SettingsWorkspaceStorageSection model={model} legacy={legacy} normalizedQuery="" />);
    const subsection = screen.getByRole("region", { name: "Single-file compatibility" });
    fireEvent.click(within(subsection).getByRole("button", { name: "Save workspace file now" }));
    fireEvent.click(within(subsection).getByRole("button", { name: "Use a file for autosave" }));
    fireEvent.click(within(subsection).getByRole("button", { name: "Unlink workspace file" }));
    const conflict = within(subsection).getByRole("alert");
    fireEvent.click(within(conflict).getByRole("button", { name: "Keep local version" }));
    fireEvent.click(within(conflict).getByRole("button", { name: "Load file version" }));
    expect(legacy.saveWorkspaceFileNow).toHaveBeenCalledTimes(1);
    expect(legacy.relinkWorkspaceFile).toHaveBeenCalledTimes(1);
    expect(legacy.unlinkWorkspaceFile).toHaveBeenCalledTimes(1);
    expect(legacy.keepLocalWorkspaceVersion).toHaveBeenCalledTimes(1);
    expect(legacy.loadLinkedFileVersion).toHaveBeenCalledTimes(1);
    // Legacy mode: one create action in Current workspace, no disabled selector, no redundant chip.
    expect(within(subsection).queryByRole("button", { name: /named workspace/i })).toBeNull();
    expect(screen.queryByRole("combobox", { name: "Workspace" })).toBeNull();
    expect(screen.queryByText("No named workspace")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "New workspace" }));
    expect(model.openDialog).toHaveBeenCalledWith("create");
  });

  it("disables mutations while viewing a version read-only and while busy", () => {
    const readOnly = folderSnapshot({ historical: { versionId: "v1", label: "v001", title: "", createdAtIso: "2026-10-01T10:00:00Z" } });
    const { unmount } = render(<SettingsWorkspaceStorageSection model={fakeModel(readOnly)} legacy={legacyControls(legacyStatus())} normalizedQuery="" />);
    for (const name of ["Save", "Rename", "Create version", "Record supplier handoff", "Import package (ZIP)", "Import old workspace files"]) {
      expect(screen.getByRole("button", { name })).toBeDisabled();
    }
    expect(screen.getByRole("button", { name: "History" })).toBeEnabled();
    // The global banner is the only read-only signal; Settings explains why actions are disabled.
    expect(screen.queryByRole("button", { name: "Return to working copy" })).toBeNull();
    expect(screen.queryByRole("alert")).toBeNull();
    expect(screen.queryByText("Read-only v001")).toBeNull();
    expect(screen.getByText(/Viewing v001 read-only: actions that change this workspace are disabled/)).toBeInTheDocument();
    unmount();

    render(<SettingsWorkspaceStorageSection model={fakeModel(folderSnapshot({ busy: true }))} legacy={legacyControls(legacyStatus())} normalizedQuery="" />);
    for (const name of ["Save", "New workspace", "Export package (ZIP)", "Open workspace folder"]) {
      expect(screen.getByRole("button", { name })).toBeDisabled();
    }
  });

  it("shows no permanent bar outside Settings, only the read-only warning while a version is consulted", () => {
    const { container, unmount } = render(<WorkspaceLineageReadOnlyBanner model={fakeModel(folderSnapshot())} />);
    expect(container).toBeEmptyDOMElement();
    unmount();

    const model = fakeModel(folderSnapshot({ historical: { versionId: "v1", label: "v001", title: "", createdAtIso: "2026-10-01T10:00:00Z" } }));
    render(<WorkspaceLineageReadOnlyBanner model={model} />);
    expect(screen.getByRole("alert")).toHaveTextContent("Read-only: viewing v001");
    fireEvent.click(screen.getByRole("button", { name: "Return to working copy" }));
    expect(model.returnToWorking).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByRole("button", { name: "Resume from this version" }));
    expect(model.restoreFromVersion).toHaveBeenCalledWith("v1");
  });

  it("offers the themed workspace selector on Home and switches from it", () => {
    const state = folderSnapshot({
      records: [
        { workspaceId: "workspace_a", displayName: "Série", storage: "folder", folderName: "serie", latestVersionLabel: null, versionCount: 0, lastDurableSaveIso: null, pendingPortableExport: false },
        { workspaceId: "workspace_b", displayName: "Protos", storage: "browser", folderName: null, latestVersionLabel: null, versionCount: 0, lastDurableSaveIso: null, pendingPortableExport: false }
      ] as unknown as LineageSessionSnapshot["records"]
    });
    const model = fakeModel(state);
    render(<HomeWorkspaceLineagesPanel model={model} onResume={vi.fn()} onManage={vi.fn()} />);
    const select = screen.getByRole("combobox", { name: "Workspace" });
    expect(select.closest("label")).toHaveClass("stack-label");
    fireEvent.change(select, { target: { value: "workspace_b" } });
    expect(model.switchTo).toHaveBeenCalledWith("workspace_b");
  });

  it("focuses the matching Settings recovery action when a focus target is requested", async () => {
    const state = folderSnapshot({ preservedLegacySnapshot: true }, { versions: [], handoffs: [], divergentHeads: [{ headId: "h1", sourceLabel: "laptop", updatedAtIso: "2026-10-01T10:00:00Z", baseVersionId: null }] });
    requestWorkspaceStorageFocus(lineageNoticeTargetId("divergence"));
    const model = fakeModel(state);
    render(<SettingsWorkspaceStorageSection model={model} legacy={legacyControls(legacyStatus())} normalizedQuery="" />);
    const chooseHead = screen.getByRole("button", { name: "Choose working state" });
    await waitFor(() => expect(document.activeElement).toBe(chooseHead));
    fireEvent.click(chooseHead);
    expect(model.openDialog).toHaveBeenCalledWith("divergence");
    fireEvent.click(screen.getByRole("button", { name: "Download preserved snapshot" }));
    expect(model.downloadPreservedLegacySnapshot).toHaveBeenCalledTimes(1);
  });
});
