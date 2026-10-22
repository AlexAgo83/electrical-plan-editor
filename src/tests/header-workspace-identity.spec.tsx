import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { AppHeaderAndStats } from "../app/components/workspace/AppHeaderAndStats";
import { setActiveLocale } from "../app/lib/i18n";
import { describeHeaderWorkspaceIdentity } from "../app/lib/lineage/lineageStatus";
import type { LineageSessionSnapshot } from "../app/lib/lineage/lineageSessionController";

function snapshot(overrides: Partial<LineageSessionSnapshot> = {}): LineageSessionSnapshot {
  return {
    ready: true,
    libraryDurable: true,
    directoryAccessSupported: false,
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

function active(displayName: string): LineageSessionSnapshot["active"] {
  return {
    workspaceId: `workspace_${displayName}`,
    displayName,
    slug: "slug-not-shown",
    storage: "browser",
    folderName: null,
    manifest: null,
    versionLabels: new Map(),
    baseVersionId: null,
    restoredFromVersionId: null,
    issues: []
  };
}

function renderHeader(identity: ReturnType<typeof describeHeaderWorkspaceIdentity>) {
  return render(
    <AppHeaderAndStats
      headerBlockRef={createRef()}
      isNavigationDrawerOpen={false}
      onToggleNavigationDrawer={() => undefined}
      navigationToggleButtonRef={createRef()}
      onOpenHome={() => undefined}
      isSettingsActive={false}
      onOpenSettings={() => undefined}
      isInstallPromptAvailable={false}
      isDockedNavigationVisible={false}
      onInstallApp={() => undefined}
      isPwaUpdateReady={false}
      onApplyPwaUpdate={() => undefined}
      isOperationsPanelOpen={false}
      onToggleOperationsPanel={() => undefined}
      operationsButtonRef={createRef()}
      validationIssuesCount={0}
      validationErrorCount={0}
      lastError={null}
      onClearError={() => undefined}
      bootRecoveryMessage={null}
      onCommitBootRecovery={() => undefined}
      workspaceIdentity={identity}
    />
  );
}

describe("header workspace identity", () => {
  afterEach(() => {
    setActiveLocale("en");
  });

  it("derives loading, unnamed, named and historical states from the lineage session only", () => {
    expect(describeHeaderWorkspaceIdentity(undefined)).toBeNull();
    expect(describeHeaderWorkspaceIdentity(snapshot({ ready: false }))).toMatchObject({ kind: "loading", name: "Loading workspace…" });
    expect(describeHeaderWorkspaceIdentity(snapshot())).toMatchObject({ kind: "unnamed", name: "Unnamed workspace" });
    expect(describeHeaderWorkspaceIdentity(snapshot({ active: active("Série A") }))).toEqual({
      kind: "named",
      name: "Série A",
      context: null,
      fullText: "Current workspace: Série A"
    });
    const historical = describeHeaderWorkspaceIdentity(
      snapshot({ active: active("Série A"), historical: { versionId: "v2", label: "v002", title: "", createdAtIso: "2026-10-01T10:00:00Z" } })
    );
    expect(historical).toMatchObject({ kind: "historical", name: "Série A", context: "read-only v002" });
    expect(historical?.fullText).toBe("Current workspace: Série A (read-only v002)");
  });

  it("localizes identity states in French", () => {
    setActiveLocale("fr");
    expect(describeHeaderWorkspaceIdentity(snapshot())?.name).toBe("Espace sans nom");
    expect(describeHeaderWorkspaceIdentity(snapshot({ active: active("Protos") }))?.fullText).toBe("Espace actuel : Protos");
  });

  it("renders the identity immediately after the brand with accessible full text for long names", () => {
    const longName = "Série de production — faisceau principal véhicule utilitaire 2027 variante longue";
    renderHeader(describeHeaderWorkspaceIdentity(snapshot({ active: active(longName) })));
    const brand = screen.getByRole("heading", { level: 1 });
    const identity = brand.nextElementSibling as HTMLElement;
    expect(identity).toHaveClass("header-workspace-identity", "is-named");
    expect(identity).toHaveAttribute("title", `Current workspace: ${longName}`);
    expect(identity).toHaveTextContent(`Current workspace: ${longName}`);
    expect(identity.querySelector(".header-workspace-name")).toHaveTextContent(longName);
    expect(screen.queryByText("slug-not-shown")).toBeNull();
  });

  it("shows the read-only context while a version is consulted and nothing without a lineage runtime", () => {
    const { unmount } = renderHeader(
      describeHeaderWorkspaceIdentity(
        snapshot({ active: active("Série A"), historical: { versionId: "v2", label: "v002", title: "", createdAtIso: "2026-10-01T10:00:00Z" } })
      )
    );
    expect(document.querySelector(".header-workspace-context")).toHaveTextContent("read-only v002");
    unmount();
    renderHeader(null);
    expect(document.querySelector(".header-workspace-identity")).toBeNull();
  });
});
