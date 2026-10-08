import { act, fireEvent, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { resetWorkspaceSessionGateForTests } from "../app/lib/workspaceSessionGate";
import { createUiIntegrationState, getPanelByHeading, renderAppWithState, switchScreenDrawerAware } from "./helpers/app-ui-test-utils";

// Lineage operations are asynchronous (hashing, storage); allow for a loaded CI worker.
const ASYNC_UI = { timeout: 5_000 };

function storagePanel(): HTMLElement {
  return getPanelByHeading("Workspace storage");
}

function storageGroup(name: "Current workspace" | "Versions and handoffs" | "Transfer and recovery"): HTMLElement {
  return within(storagePanel()).getByRole("region", { name });
}

function contextBar(): HTMLElement {
  return screen.getByRole("region", { name: "Named workspace" });
}

function workspaceSelect(): HTMLSelectElement {
  return within(storageGroup("Current workspace")).getByRole<HTMLSelectElement>("combobox", { name: "Workspace" });
}

async function createWorkspace(name: string, start: "current" | "empty"): Promise<void> {
  fireEvent.click(within(storageGroup("Current workspace")).getByRole("button", { name: "New workspace" }));
  const dialog = await screen.findByRole("dialog", { name: "New named workspace" }, ASYNC_UI);
  fireEvent.change(within(dialog).getByLabelText("Workspace name"), { target: { value: name } });
  fireEvent.click(within(dialog).getByLabelText(start === "current" ? "Start from the current content" : "Start empty"));
  fireEvent.click(within(dialog).getByRole("button", { name: "Create workspace" }));
  await waitFor(() => expect(screen.queryByRole("dialog", { name: "New named workspace" })).toBeNull(), ASYNC_UI);
  await waitFor(() => expect(workspaceSelect().selectedOptions[0]?.textContent).toBe(name), ASYNC_UI);
}

describe("named workspace lineages UI", () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem("electrical-plan-editor.onboarding.auto-open-enabled.v1", "false");
    resetWorkspaceSessionGateForTests();
    vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:mock");
    vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => undefined);
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    resetWorkspaceSessionGateForTests();
  });

  it("keeps Home to resume cards plus one shortcut that opens and focuses Settings > Workspace storage", async () => {
    renderAppWithState(createUiIntegrationState());
    switchScreenDrawerAware("home");
    const homePanel = screen.getByRole("region", { name: "Named workspaces" });
    expect(within(homePanel).getAllByRole("button").map((button) => button.textContent?.trim())).toEqual(["Manage workspaces"]);
    // Without an active named workspace there is no compact context outside Settings.
    expect(screen.queryByRole("region", { name: "Named workspace" })).toBeNull();

    fireEvent.click(within(homePanel).getByRole("button", { name: "Manage workspaces" }));
    await waitFor(() => expect(document.activeElement).toBe(within(storagePanel()).getByRole("heading", { level: 2, name: "Workspace storage" })), ASYNC_UI);
    // Legacy session: the compatibility subsection keeps the single-file tools and offers adoption.
    const legacy = within(storagePanel()).getByRole("region", { name: "Single-file compatibility" });
    expect(within(legacy).getByRole("button", { name: "Use a file for autosave" })).toBeEnabled();
    expect(within(legacy).getByRole("button", { name: "Create named workspace from current content" })).toBeInTheDocument();
  });

  it("manages Series and Prototypes from Settings, saves after navigation and consults history read-only", async () => {
    const initial = createUiIntegrationState();
    const { store } = renderAppWithState(initial);
    switchScreenDrawerAware("settings");
    await waitFor(() => expect(within(storageGroup("Current workspace")).getByRole("button", { name: "New workspace" })).not.toBeDisabled(), ASYNC_UI);
    const initialNetworkCount = store.getState().networks.allIds.length;
    expect(initialNetworkCount).toBeGreaterThan(0);

    await createWorkspace("Série", "current");
    await createWorkspace("Protos", "empty");
    expect(store.getState().networks.allIds).toHaveLength(0);

    // Named mode: the single-file tools and their search labels are gone; all lineage groups are present.
    expect(within(storagePanel()).queryByRole("region", { name: "Single-file compatibility" })).toBeNull();
    expect(within(storagePanel()).queryByRole("button", { name: "Use a file for autosave" })).toBeNull();
    expect(within(storagePanel()).queryByRole("button", { name: "Stop autosave link" })).toBeNull();
    expect(within(storageGroup("Transfer and recovery")).getByRole("button", { name: "Export package (ZIP)" })).toBeInTheDocument();
    expect(within(storageGroup("Transfer and recovery")).getByRole("button", { name: "Import old workspace files" })).toBeInTheDocument();
    expect(within(storageGroup("Current workspace")).getByRole("button", { name: "Rename" })).toBeEnabled();

    const serieOption = within(workspaceSelect()).getByRole<HTMLOptionElement>("option", { name: "Série" });
    fireEvent.change(workspaceSelect(), { target: { value: serieOption.value } });
    await waitFor(() => expect(store.getState().networks.allIds).toHaveLength(initialNetworkCount), ASYNC_UI);

    // Navigate away: the compact context and Ctrl/Cmd+S still use the same active model.
    switchScreenDrawerAware("home");
    expect(within(contextBar()).getByText("Série")).toBeInTheDocument();
    fireEvent.keyDown(window, { key: "s", ctrlKey: true });
    await screen.findByText("Working copy saved", {}, ASYNC_UI);

    fireEvent.click(within(contextBar()).getByRole("button", { name: "Manage workspaces" }));
    fireEvent.click(within(await waitFor(() => storageGroup("Versions and handoffs"), ASYNC_UI)).getByRole("button", { name: "Create version" }));
    const versionDialog = await screen.findByRole("dialog", { name: "Create version v001" }, ASYNC_UI);
    // One stable host: the dialog opened from Settings is mounted exactly once.
    expect(screen.getAllByRole("dialog").filter((dialog) => dialog.classList.contains("lineage-dialog"))).toHaveLength(1);
    fireEvent.change(within(versionDialog).getByLabelText("Label (optional)"), { target: { value: "Initial" } });
    const confirm = within(versionDialog).getByRole("button", { name: "Create version" });
    fireEvent.click(confirm);
    fireEvent.click(confirm);
    await waitFor(() => expect(screen.queryByRole("dialog", { name: "Create version v001" })).toBeNull(), ASYNC_UI);

    fireEvent.click(within(storageGroup("Versions and handoffs")).getByRole("button", { name: "History" }));
    const history = await screen.findByRole("dialog", { name: "History of Série" }, ASYNC_UI);
    const entries = within(history).getAllByRole("listitem").filter((item) => item.classList.contains("lineage-history-entry"));
    expect(entries).toHaveLength(1);
    fireEvent.click(within(entries[0]!).getByRole("button", { name: "Open read-only" }));
    await waitFor(() => expect(within(contextBar()).getByText("Read-only: viewing v001")).toBeInTheDocument(), ASYNC_UI);
    expect(within(storageGroup("Current workspace")).getByRole("button", { name: "Save" })).toBeDisabled();
    expect(within(storageGroup("Versions and handoffs")).getByRole("button", { name: "Create version" })).toBeDisabled();

    const before = store.getState();
    act(() => {
      fireEvent.keyDown(window, { key: "z", ctrlKey: true });
    });
    expect(store.getState().networks).toBe(before.networks);
    expect((await screen.findAllByText("Read-only version", {}, ASYNC_UI)).length).toBeGreaterThan(0);

    // The historical warning and its exit stay visible outside Settings.
    switchScreenDrawerAware("home");
    fireEvent.click(within(contextBar()).getByRole("button", { name: "Return to working copy" }));
    await waitFor(() => expect(screen.queryByText("Read-only: viewing v001")).toBeNull(), ASYNC_UI);
    switchScreenDrawerAware("settings");
    expect(within(storageGroup("Current workspace")).getByRole("button", { name: "Save" })).not.toBeDisabled();
  });

  it("indexes only the reachable storage actions in Settings search for the active mode", async () => {
    renderAppWithState(createUiIntegrationState());
    switchScreenDrawerAware("settings");
    const searchInput = screen.getByLabelText("Search settings");

    fireEvent.change(searchInput, { target: { value: "autosave" } });
    expect(within(storagePanel()).getAllByText("autosave", { selector: "mark.settings-search-highlight" }).length).toBeGreaterThan(0);
    fireEvent.change(searchInput, { target: { value: "" } });

    await waitFor(() => expect(within(storageGroup("Current workspace")).getByRole("button", { name: "New workspace" })).not.toBeDisabled(), ASYNC_UI);
    await createWorkspace("Série", "current");

    fireEvent.change(searchInput, { target: { value: "autosave" } });
    expect(within(storagePanel()).queryByText("autosave", { selector: "mark.settings-search-highlight" })).toBeNull();
    const storageNav = screen.getByRole("button", { name: /^Workspace storage/ });
    expect(storageNav).toHaveClass("is-dimmed");

    fireEvent.change(searchInput, { target: { value: "create version" } });
    expect(within(storageGroup("Versions and handoffs")).getByText("Create version", { selector: "mark.settings-search-highlight" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^Workspace storage/ })).not.toHaveClass("is-dimmed");
  });
});
