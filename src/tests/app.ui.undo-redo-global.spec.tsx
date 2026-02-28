import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CATALOG_CSV_HEADERS } from "../app/lib/catalogCsv";
import { appActions, appReducer, createInitialState } from "../store";
import {
  asCatalogItemId,
  getPanelByHeading,
  renderAppWithState,
  switchScreenDrawerAware
} from "./helpers/app-ui-test-utils";

function createStateWithCatalog() {
  return appReducer(
    createInitialState(),
    appActions.upsertCatalogItem({
      id: asCatalogItemId("CAT-UNDO"),
      manufacturerReference: "UNDO-CAT-REF",
      connectionCount: 4
    })
  );
}

function openOpsPanel(): void {
  fireEvent.click(screen.getByRole("button", { name: "Ops & Health" }));
}

describe("App integration UI - global undo/redo", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("supports undo/redo keyboard shortcuts with input-focus guard and clears redo after a new mutation", () => {
    renderAppWithState(createStateWithCatalog());
    fireEvent.click(screen.getByRole("button", { name: "Close onboarding" }));
    switchScreenDrawerAware("modeling");

    const connectorsPanel = getPanelByHeading("Connectors");
    fireEvent.click(within(connectorsPanel).getByRole("button", { name: "New" }));
    let connectorFormPanel = getPanelByHeading("Create Connector");
    fireEvent.change(within(connectorFormPanel).getByLabelText("Functional name"), { target: { value: "Undo keyboard A" } });
    fireEvent.change(within(connectorFormPanel).getByLabelText("Technical ID"), { target: { value: "C-UNDO-A" } });
    fireEvent.click(within(connectorFormPanel).getByRole("button", { name: "Create" }));
    expect(within(connectorsPanel).getByText("Undo keyboard A")).toBeInTheDocument();

    fireEvent.keyDown(window, { key: "z", ctrlKey: true });
    expect(within(connectorsPanel).queryByText("Undo keyboard A")).not.toBeInTheDocument();

    fireEvent.keyDown(window, { key: "y", ctrlKey: true });
    expect(within(connectorsPanel).getByText("Undo keyboard A")).toBeInTheDocument();

    const filterInput = within(connectorsPanel).getByLabelText("Connector filter field query");
    fireEvent.focus(filterInput);
    fireEvent.keyDown(filterInput, { key: "z", ctrlKey: true });
    expect(within(connectorsPanel).getByText("Undo keyboard A")).toBeInTheDocument();

    fireEvent.blur(filterInput);
    fireEvent.keyDown(window, { key: "z", ctrlKey: true });
    expect(within(connectorsPanel).queryByText("Undo keyboard A")).not.toBeInTheDocument();

    fireEvent.click(within(connectorsPanel).getByRole("button", { name: "New" }));
    connectorFormPanel = getPanelByHeading("Create Connector");
    fireEvent.change(within(connectorFormPanel).getByLabelText("Functional name"), { target: { value: "Undo keyboard B" } });
    fireEvent.change(within(connectorFormPanel).getByLabelText("Technical ID"), { target: { value: "C-UNDO-B" } });
    fireEvent.click(within(connectorFormPanel).getByRole("button", { name: "Create" }));
    expect(within(connectorsPanel).getByText("Undo keyboard B")).toBeInTheDocument();

    openOpsPanel();
    expect(screen.getByRole("button", { name: "Redo" })).toBeDisabled();
  });

  it("treats catalog CSV import as one undo step and excludes theme-only changes from history", async () => {
    const { store } = renderAppWithState(createStateWithCatalog());
    fireEvent.click(screen.getByRole("button", { name: "Close onboarding" }));

    switchScreenDrawerAware("settings");
    const settingsPanel = getPanelByHeading("Appearance preferences");
    fireEvent.change(within(settingsPanel).getByLabelText("Theme mode"), { target: { value: "normal" } });
    openOpsPanel();
    expect(screen.getByRole("button", { name: "Undo" })).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: "Ops & Health" }));

    switchScreenDrawerAware("modeling");
    const secondaryNavRow = document.querySelector(".workspace-nav-row.secondary");
    expect(secondaryNavRow).not.toBeNull();
    fireEvent.click(within(secondaryNavRow as HTMLElement).getByRole("button", { name: /^Catalog$/, hidden: true }));

    let catalogPanel = getPanelByHeading("Catalog");
    const fileInput = catalogPanel.querySelector('input[type="file"][accept="text/csv,.csv"]');
    expect(fileInput).not.toBeNull();
    vi.spyOn(window, "confirm").mockReturnValue(true);

    const csvText = [
      CATALOG_CSV_HEADERS.join(","),
      "UNDO-CAT-REF,6,Updated undo item,1.00,https://example.com/undo-cat-ref",
      "UNDO-CAT-NEW,2,Imported new item,2.00,https://example.com/undo-cat-new"
    ].join("\r\n");
    const file = new File([csvText], "undo-import.csv", { type: "text/csv" });
    Object.defineProperty(file, "text", {
      configurable: true,
      value: vi.fn().mockResolvedValue(csvText)
    });
    fireEvent.change(fileInput as HTMLInputElement, {
      target: { files: [file] }
    });
    const confirmDialog = await screen.findByRole("dialog", { name: "Import catalog CSV" });
    fireEvent.click(within(confirmDialog).getByRole("button", { name: "Confirm" }));

    await waitFor(() => {
      catalogPanel = getPanelByHeading("Catalog");
      expect(within(catalogPanel).getByText("Imported 2 catalog row(s): 1 created / 1 updated.")).toBeInTheDocument();
    });

    let catalogValues = Object.values(store.getState().catalogItems.byId).map((item) => item?.manufacturerReference ?? "").sort();
    expect(catalogValues).toEqual(["UNDO-CAT-NEW", "UNDO-CAT-REF"]);

    openOpsPanel();
    fireEvent.click(screen.getByRole("button", { name: "Undo" }));
    catalogValues = Object.values(store.getState().catalogItems.byId).map((item) => item?.manufacturerReference ?? "").sort();
    expect(catalogValues).toEqual(["UNDO-CAT-REF"]);
    expect(store.getState().catalogItems.byId[asCatalogItemId("CAT-UNDO")]?.connectionCount).toBe(4);

    fireEvent.click(screen.getByRole("button", { name: "Redo" }));
    catalogValues = Object.values(store.getState().catalogItems.byId).map((item) => item?.manufacturerReference ?? "").sort();
    expect(catalogValues).toEqual(["UNDO-CAT-NEW", "UNDO-CAT-REF"]);
    expect(store.getState().catalogItems.byId[asCatalogItemId("CAT-UNDO")]?.connectionCount).toBe(6);
  });

  it("keeps Network Scope recent changes aligned with undo stack", () => {
    renderAppWithState(createStateWithCatalog());
    fireEvent.click(screen.getByRole("button", { name: "Close onboarding" }));
    switchScreenDrawerAware("modeling");

    const connectorsPanel = getPanelByHeading("Connectors");
    fireEvent.click(within(connectorsPanel).getByRole("button", { name: "New" }));
    const connectorFormPanel = getPanelByHeading("Create Connector");
    fireEvent.change(within(connectorFormPanel).getByLabelText("Functional name"), { target: { value: "Undo stack recent change" } });
    fireEvent.change(within(connectorFormPanel).getByLabelText("Technical ID"), { target: { value: "C-UNDO-SYNC" } });
    fireEvent.click(within(connectorFormPanel).getByRole("button", { name: "Create" }));

    switchScreenDrawerAware("networkScope");
    expect(getPanelByHeading("Recent changes")).toBeInTheDocument();
    expect(screen.getByText("Connector 'C-UNDO-SYNC' created")).toBeInTheDocument();

    openOpsPanel();
    fireEvent.click(screen.getByRole("button", { name: "Undo" }));
    fireEvent.click(screen.getByRole("button", { name: "Ops & Health" }));
    expect(screen.queryByRole("heading", { name: "Recent changes" })).not.toBeInTheDocument();
  });

  it("restores recent changes on reload without restoring undo stack snapshots", async () => {
    const firstRender = renderAppWithState(createStateWithCatalog());
    fireEvent.click(screen.getByRole("button", { name: "Close onboarding" }));
    switchScreenDrawerAware("modeling");

    const connectorsPanel = getPanelByHeading("Connectors");
    fireEvent.click(within(connectorsPanel).getByRole("button", { name: "New" }));
    const connectorFormPanel = getPanelByHeading("Create Connector");
    fireEvent.change(within(connectorFormPanel).getByLabelText("Functional name"), { target: { value: "Persisted recent change" } });
    fireEvent.change(within(connectorFormPanel).getByLabelText("Technical ID"), { target: { value: "C-PERSIST" } });
    fireEvent.click(within(connectorFormPanel).getByRole("button", { name: "Create" }));
    firstRender.unmount();

    renderAppWithState(createStateWithCatalog());
    fireEvent.click(screen.getByRole("button", { name: "Close onboarding" }));
    switchScreenDrawerAware("networkScope");
    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Recent changes" })).toBeInTheDocument();
    });
    expect(screen.getByText("Connector 'C-PERSIST' created")).toBeInTheDocument();

    openOpsPanel();
    expect(screen.getByRole("button", { name: "Undo" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Redo" })).toBeDisabled();
  });
});
