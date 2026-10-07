import { act, fireEvent, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { resetWorkspaceSessionGateForTests } from "../app/lib/workspaceSessionGate";
import { createUiIntegrationState, renderAppWithState } from "./helpers/app-ui-test-utils";

// Lineage operations are asynchronous (hashing, storage); allow for a loaded CI worker.
const ASYNC_UI = { timeout: 5_000 };

function lineageBar(): HTMLElement {
  return screen.getByRole("region", { name: "Named workspace" });
}

async function createWorkspace(name: string, start: "current" | "empty"): Promise<void> {
  fireEvent.click(within(lineageBar()).getByRole("button", { name: "New workspace" }));
  const dialog = await screen.findByRole("dialog", { name: "New named workspace" }, ASYNC_UI);
  fireEvent.change(within(dialog).getByLabelText("Workspace name"), { target: { value: name } });
  fireEvent.click(within(dialog).getByLabelText(start === "current" ? "Start from the current content" : "Start empty"));
  fireEvent.click(within(dialog).getByRole("button", { name: "Create workspace" }));
  await waitFor(() => expect(screen.queryByRole("dialog", { name: "New named workspace" })).toBeNull(), ASYNC_UI);
  await waitFor(() => expect(within(lineageBar()).getByRole<HTMLSelectElement>("combobox", { name: "Workspace" }).selectedOptions[0]?.textContent).toBe(name), ASYNC_UI);
}

describe("named workspace lineages UI", () => {
  beforeEach(() => {
    localStorage.clear();
    resetWorkspaceSessionGateForTests();
    vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:mock");
    vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => undefined);
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    resetWorkspaceSessionGateForTests();
  });

  it("creates and switches Series and Prototypes independently, versions, and consults history read-only", async () => {
    const initial = createUiIntegrationState();
    const { store } = renderAppWithState(initial);
    await waitFor(() => expect(within(lineageBar()).getByLabelText("Workspace")).not.toBeDisabled(), ASYNC_UI);
    const initialNetworkCount = store.getState().networks.allIds.length;
    expect(initialNetworkCount).toBeGreaterThan(0);

    await createWorkspace("Série", "current");
    await createWorkspace("Protos", "empty");
    expect(store.getState().networks.allIds).toHaveLength(0);

    const select = within(lineageBar()).getByLabelText("Workspace");
    const serieOption = within(select).getByRole<HTMLOptionElement>("option", { name: "Série" });
    fireEvent.change(select, { target: { value: serieOption.value } });
    await waitFor(() => expect(store.getState().networks.allIds).toHaveLength(initialNetworkCount), ASYNC_UI);

    fireEvent.keyDown(window, { key: "s", ctrlKey: true });
    await screen.findByText("Working copy saved", {}, ASYNC_UI);

    fireEvent.click(within(lineageBar()).getByRole("button", { name: "Create version" }));
    const versionDialog = await screen.findByRole("dialog", { name: "Create version v001" }, ASYNC_UI);
    fireEvent.change(within(versionDialog).getByLabelText("Label (optional)"), { target: { value: "Initial" } });
    const confirm = within(versionDialog).getByRole("button", { name: "Create version" });
    fireEvent.click(confirm);
    fireEvent.click(confirm);
    await waitFor(() => expect(screen.queryByRole("dialog", { name: "Create version v001" })).toBeNull(), ASYNC_UI);

    fireEvent.click(within(lineageBar()).getByRole("button", { name: "History" }));
    const history = await screen.findByRole("dialog", { name: "History of Série" }, ASYNC_UI);
    const entries = within(history).getAllByRole("listitem").filter((item) => item.classList.contains("lineage-history-entry"));
    expect(entries).toHaveLength(1);
    fireEvent.click(within(entries[0]!).getByRole("button", { name: "Open read-only" }));
    await screen.findByText("Read-only: viewing v001", {}, ASYNC_UI);
    expect(within(lineageBar()).getByRole("button", { name: "Save" })).toBeDisabled();

    const before = store.getState();
    act(() => {
      fireEvent.keyDown(window, { key: "z", ctrlKey: true });
    });
    expect(store.getState().networks).toBe(before.networks);
    expect((await screen.findAllByText("Read-only version", {}, ASYNC_UI)).length).toBeGreaterThan(0);

    fireEvent.click(within(lineageBar()).getByRole("button", { name: "Return to working copy" }));
    await waitFor(() => expect(screen.queryByText("Read-only: viewing v001")).toBeNull(), ASYNC_UI);
    expect(within(lineageBar()).getByRole("button", { name: "Save" })).not.toBeDisabled();
  });
});
