import { act, fireEvent, render, renderHook, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { HomeWorkspaceLineagesPanel } from "../app/components/workspace/WorkspaceLineagePanels";
import type { WorkspaceLineageModel } from "../app/hooks/useWorkspaceLineages";
import { useStoreHistory } from "../app/hooks/useStoreHistory";
import { setActiveLocale, translateCurrentPlural } from "../app/lib/i18n";
import { formatLineageDateTime } from "../app/lib/lineage/lineageFormat";
import { MemoryLineageLibraryStore, type LineageRegistryRecord } from "../app/lib/lineage/lineageLibrary";
import { LineageSessionController, type LineageSessionSnapshot } from "../app/lib/lineage/lineageSessionController";
import { describeLineageExportReminder, describeLineageSaveStatus, EXPORT_REMINDER_WARNING_AFTER_DAYS } from "../app/lib/lineage/lineageStatus";
import { resetWorkspaceSessionGateForTests, setProjectMutationBlocked, subscribeBlockedMutationAttempts } from "../app/lib/workspaceSessionGate";
import {
  appActions,
  appReducer,
  createAppStore,
  createEmptyWorkspaceState,
  createSampleNetworkState,
  isUnmodifiedBuiltInSample,
  isWorkspaceEmpty,
  type AppState
} from "../store";

const DAY_MS = 24 * 60 * 60 * 1000;

function renamedSample(): AppState {
  const sample = createSampleNetworkState();
  const id = sample.networks.allIds[0]!;
  return appReducer(sample, appActions.updateNetwork(id, "Customer harness", sample.networks.byId[id]!.technicalId, "2026-10-01T08:00:00.000Z"));
}

class SampleAwareHost {
  constructor(public state: AppState) {}
  getState = (): AppState => this.state;
  replaceState = (state: AppState): void => {
    this.state = state;
  };
  resetHistory = (): void => undefined;
  isWorkspaceEmpty = (state: AppState): boolean => isWorkspaceEmpty(state);
  isUnmodifiedBuiltInSample = (state: AppState): boolean => isUnmodifiedBuiltInSample(state);
  downloadBytes = (): boolean => true;
}

async function createFirstLineage(initial: AppState, library = new MemoryLineageLibraryStore({ durable: true })) {
  const controller = new LineageSessionController(library, new SampleAwareHost(initial), { deviceLabel: "PC-A" });
  await controller.initialize();
  const result = await controller.createLineage({ displayName: "Série", start: "empty", storage: "browser", emptyState: createEmptyWorkspaceState() });
  expect(result.ok).toBe(true);
  return { controller, library };
}

function record(overrides: Partial<LineageRegistryRecord> = {}): LineageRegistryRecord {
  return {
    workspaceId: "workspace_a",
    displayName: "Série",
    slug: "serie",
    storage: "browser",
    folderName: null,
    createdAtIso: "2026-10-01T08:00:00.000Z",
    lastOpenedAtIso: "2026-10-01T08:00:00.000Z",
    pendingPortableExport: true,
    lastDurableSaveIso: "2026-10-01T08:00:00.000Z",
    versionCount: 0,
    latestVersionLabel: null,
    ...overrides
  };
}

describe("workspace UX remediation (req_169)", () => {
  beforeEach(() => {
    resetWorkspaceSessionGateForTests();
    setActiveLocale("en");
  });
  afterEach(() => {
    resetWorkspaceSessionGateForTests();
    setActiveLocale("en");
  });

  it("recognises only the untouched built-in sample", () => {
    expect(isUnmodifiedBuiltInSample(createSampleNetworkState())).toBe(true);
    expect(isUnmodifiedBuiltInSample(renamedSample())).toBe(false);
    expect(isUnmodifiedBuiltInSample(createEmptyWorkspaceState())).toBe(false);
  });

  it("never preserves nor announces the untouched sample, but keeps edited content and older snapshots", async () => {
    const pristine = await createFirstLineage(createSampleNetworkState());
    expect(await pristine.library.readPreservedLegacySnapshot()).toBeNull();
    expect(pristine.controller.getSnapshot().preservedLegacySnapshot).toBe(false);

    const edited = await createFirstLineage(renamedSample());
    expect(await edited.library.readPreservedLegacySnapshot()).not.toBeNull();
    expect(edited.controller.getSnapshot().preservedLegacySnapshot).toBe(true);

    // A sample-only snapshot preserved by an earlier release stays stored but is not announced.
    const library = new MemoryLineageLibraryStore({ durable: true });
    await library.writePreservedLegacySnapshot({ stateJson: JSON.stringify(createSampleNetworkState()), preservedAtIso: "2026-10-01T08:00:00.000Z" });
    const restarted = new LineageSessionController(library, new SampleAwareHost(createEmptyWorkspaceState()), { deviceLabel: "PC-A" });
    await restarted.initialize();
    expect(restarted.getSnapshot().preservedLegacySnapshot).toBe(false);
    expect(await library.readPreservedLegacySnapshot()).not.toBeNull();
  });

  it("reports a browser save as success and escalates the export hint only past seven days", () => {
    const createdMs = Date.parse("2026-10-01T08:00:00.000Z");
    expect(EXPORT_REMINDER_WARNING_AFTER_DAYS).toBe(7);
    expect(describeLineageExportReminder(record({ storage: "folder" }), createdMs + 30 * DAY_MS)).toBeNull();
    expect(describeLineageExportReminder(record({ pendingPortableExport: false }), createdMs + 30 * DAY_MS)).toBeNull();
    expect(describeLineageExportReminder(record(), createdMs + 7 * DAY_MS)?.tone).toBe("neutral");
    expect(describeLineageExportReminder(record(), createdMs + 7 * DAY_MS + 1)).toEqual({
      tone: "warning",
      label: "Created 7 days ago and never exported as a package: export a copy."
    });
    const exported = record({ lastPortableExportIso: "2026-10-05T08:00:00.000Z" });
    expect(describeLineageExportReminder(exported, createdMs + 9 * DAY_MS)?.tone).toBe("neutral");
    expect(describeLineageExportReminder(exported, createdMs + 12 * DAY_MS)?.label).toBe("Last package export 8 days ago: export an up-to-date copy.");
  });

  it("records the export date on the registry record and keeps the browser status successful", async () => {
    const { controller, library } = await createFirstLineage(createSampleNetworkState());
    const snapshotBefore = controller.getSnapshot();
    expect(snapshotBefore.save.pendingPortableExport).toBe(true);
    expect(describeLineageSaveStatus(snapshotBefore).tone).toBe("success");
    expect((await controller.exportPackage()).ok).toBe(true);
    const stored = (await library.listRecords())[0]!;
    expect(stored.pendingPortableExport).toBe(false);
    expect(stored.lastPortableExportIso).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it("formats lineage dates and counts with the app locale", () => {
    const iso = "2026-10-08T14:41:00.000Z";
    const english = formatLineageDateTime(iso);
    setActiveLocale("fr");
    const french = formatLineageDateTime(iso);
    expect(french).toBe(new Date(iso).toLocaleString("fr", { dateStyle: "medium", timeStyle: "short" }));
    expect(french).not.toBe(english);
    expect(french).not.toMatch(/AM|PM/);
    expect(translateCurrentPlural("ui.workspaceStorageVersionsCount", 0)).toBe("0 version");
    expect(translateCurrentPlural("ui.workspaceStorageHandoffsCount", 2)).toBe("2 remises fournisseur");
    setActiveLocale("en");
    expect(translateCurrentPlural("ui.workspaceStorageVersionsCount", 0)).toBe("0 versions");
    expect(translateCurrentPlural("ui.workspaceStorageVersionsCount", 1)).toBe("1 version");
  });

  it("drops background writes silently while read-only and still reports user edits", () => {
    const store = createAppStore(createSampleNetworkState());
    const { result } = renderHook(() => useStoreHistory({ store, historyLimit: 10 }));
    const reports: string[] = [];
    subscribeBlockedMutationAttempts((reason) => reports.push(reason));
    setProjectMutationBlocked("Read-only v001");
    const before = store.getState();
    const networkId = before.networks.allIds[0]!;
    const viewState = appActions.setNetworkSummaryViewState(networkId, { scale: 2, offset: { x: 1, y: 1 } } as never);

    act(() => result.current.dispatchAction(viewState, { trackHistory: false, background: true }));
    expect(store.getState()).toBe(before);
    expect(reports).toEqual([]);

    act(() => result.current.dispatchAction(viewState, { trackHistory: false }));
    expect(store.getState()).toBe(before);
    expect(reports).toEqual(["Read-only v001"]);
  });
});

function homeModel(records: LineageRegistryRecord[], activeId: string | null): WorkspaceLineageModel {
  const snapshot = {
    ready: true,
    busy: false,
    records,
    active: activeId === null ? null : { workspaceId: activeId, displayName: activeId, storage: "browser" },
    historical: null,
    save: { pendingPortableExport: false }
  } as unknown as LineageSessionSnapshot;
  return {
    snapshot,
    openDialog: vi.fn(),
    switchTo: vi.fn(() => Promise.resolve(true))
  } as unknown as WorkspaceLineageModel;
}

describe("Home named workspaces panel (req_169 AC5)", () => {
  it("creates the first workspace in one step from an empty library", () => {
    const model = homeModel([], null);
    render(<HomeWorkspaceLineagesPanel model={model} onResume={vi.fn()} onManage={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: "Create your first workspace" }));
    expect(model.openDialog).toHaveBeenCalledWith("create");
    expect(screen.queryByRole("combobox")).toBeNull();
  });

  it("lists the other workspaces as compact themed rows, most recent first, resuming on click", async () => {
    const model = homeModel(
      [
        record({ workspaceId: "a", displayName: "Alpha", lastDurableSaveIso: "2026-10-01T08:00:00.000Z" }),
        record({ workspaceId: "b", displayName: "Bravo", lastDurableSaveIso: "2026-10-07T08:00:00.000Z" }),
        record({ workspaceId: "c", displayName: "Charlie (active)", lastDurableSaveIso: "2026-10-08T08:00:00.000Z" })
      ],
      "c"
    );
    const onResume = vi.fn();
    const { container } = render(<HomeWorkspaceLineagesPanel model={model} onResume={onResume} onManage={vi.fn()} />);
    const rows = within(screen.getByRole("list", { name: "Other workspaces" })).getAllByRole("button");
    expect(rows.map((row) => row.getAttribute("aria-label"))).toEqual(["Resume Bravo", "Resume Alpha"]);
    expect(rows[0]).toHaveTextContent("0 versions");
    fireEvent.click(rows[0]!);
    expect(model.switchTo).toHaveBeenCalledWith("b");
    await waitFor(() => expect(onResume).toHaveBeenCalledTimes(1));
    // Every button uses the themed row-actions convention.
    expect([...container.querySelectorAll("button")].filter((button) => button.closest(".row-actions") === null)).toEqual([]);
  });
});
