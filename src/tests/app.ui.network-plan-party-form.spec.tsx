import { fireEvent, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { NetworkId } from "../core/entities";
import { buildNetworkFormDraft } from "../app/lib/networkFormDraft";
import { setActiveLocale, translateCurrent } from "../app/lib/i18n";
import { appActions, appReducer, createInitialState } from "../store";
import { getPanelByHeading, renderAppWithState, switchScreen } from "./helpers/app-ui-test-utils";

const MANUFACTURER_NAME = /Manufacturer company name \(optional\)/;
const MANUFACTURER_REFERENCE = /Manufacturer reference \(optional\)/;
const SUPPLIER_NAME = /Supplier company name \(optional\)/;
const SUPPLIER_REFERENCE = /Supplier reference \(optional\)/;

function buildTwoNetworkState() {
  return appReducer(
    createInitialState(),
    appActions.createNetwork({
      id: "net-b" as NetworkId,
      name: "Network B",
      technicalId: "NET-B",
      planSupplierName: "Supplier B",
      planSupplierReference: "SUP-009",
      createdAt: "2026-01-10T08:00:00.000Z",
      updatedAt: "2026-01-10T08:00:00.000Z"
    })
  );
}

function openEditForm(rowLabel: string): HTMLElement {
  const networkScopePanel = getPanelByHeading("Network Scope");
  fireEvent.click(within(networkScopePanel).getByText(rowLabel).closest("tr") as HTMLElement);
  return getPanelByHeading("Edit network");
}

describe("network parameters - manufacturer and supplier plan references", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    setActiveLocale("en");
  });

  it("groups the four optional inputs by role with generic placeholders and bounds", () => {
    renderAppWithState(buildTwoNetworkState());
    switchScreen("networkScope");
    const formPanel = openEditForm("Main network (Sample)");

    const manufacturerGroup = within(formPanel).getByRole("group", { name: "Manufacturer plan reference" });
    const supplierGroup = within(formPanel).getByRole("group", { name: "Supplier plan reference" });
    expect(within(manufacturerGroup).getByLabelText(MANUFACTURER_NAME)).toHaveAttribute("maxLength", "80");
    expect(within(manufacturerGroup).getByLabelText(MANUFACTURER_REFERENCE)).toHaveAttribute("maxLength", "120");
    expect(within(supplierGroup).getByLabelText(SUPPLIER_NAME)).toHaveAttribute("placeholder", "Company name");
    expect(within(supplierGroup).getByLabelText(SUPPLIER_REFERENCE)).toHaveAttribute("placeholder", "Plan reference code");
  });

  it("saves partial values on the target network only, edits a name independently and clears", async () => {
    const { store } = renderAppWithState(buildTwoNetworkState());
    switchScreen("networkScope");
    const formPanel = openEditForm("Main network (Sample)");
    const sampleId = store.getState().networks.allIds.find((id) => id !== ("net-b" as NetworkId)) as NetworkId;

    fireEvent.change(within(formPanel).getByLabelText(MANUFACTURER_NAME), { target: { value: "  Manufacturer A " } });
    fireEvent.change(within(formPanel).getByLabelText(SUPPLIER_REFERENCE), { target: { value: "007-B" } });
    fireEvent.click(within(formPanel).getByRole("button", { name: "Save network" }));

    await waitFor(() => {
      expect(store.getState().networks.byId[sampleId]).toMatchObject({
        planManufacturerName: "Manufacturer A",
        planSupplierReference: "007-B"
      });
    });
    expect(store.getState().networks.byId[sampleId]?.planManufacturerReference).toBeUndefined();
    expect(store.getState().networks.byId[sampleId]?.planSupplierName).toBeUndefined();
    expect(store.getState().networks.byId["net-b" as NetworkId]).toMatchObject({
      planSupplierName: "Supplier B",
      planSupplierReference: "SUP-009"
    });

    fireEvent.change(within(formPanel).getByLabelText(MANUFACTURER_NAME), { target: { value: "Manufacturer C" } });
    fireEvent.click(within(formPanel).getByRole("button", { name: "Save network" }));
    await waitFor(() => {
      expect(store.getState().networks.byId[sampleId]?.planManufacturerName).toBe("Manufacturer C");
    });
    expect(store.getState().networks.byId[sampleId]?.planSupplierReference).toBe("007-B");

    fireEvent.change(within(formPanel).getByLabelText(MANUFACTURER_NAME), { target: { value: "" } });
    fireEvent.change(within(formPanel).getByLabelText(SUPPLIER_REFERENCE), { target: { value: "   " } });
    fireEvent.click(within(formPanel).getByRole("button", { name: "Save network" }));
    await waitFor(() => {
      expect(store.getState().networks.byId[sampleId]?.planManufacturerName).toBeUndefined();
      expect(store.getState().networks.byId[sampleId]?.planSupplierReference).toBeUndefined();
    });
  });

  it("does not leak unsaved drafts across cancel, reopen, network switch or create", () => {
    const { store } = renderAppWithState(buildTwoNetworkState());
    switchScreen("networkScope");
    let formPanel = openEditForm("Network B");
    expect(within(formPanel).getByLabelText(SUPPLIER_NAME)).toHaveValue("Supplier B");
    expect(within(formPanel).getByLabelText(SUPPLIER_REFERENCE)).toHaveValue("SUP-009");

    fireEvent.change(within(formPanel).getByLabelText(SUPPLIER_NAME), { target: { value: "Unsaved supplier" } });
    formPanel = openEditForm("Main network (Sample)");
    expect(within(formPanel).getByLabelText(SUPPLIER_NAME)).toHaveValue("");
    expect(within(formPanel).getByLabelText(SUPPLIER_REFERENCE)).toHaveValue("");

    fireEvent.change(within(formPanel).getByLabelText(MANUFACTURER_REFERENCE), { target: { value: "MFG-UNSAVED" } });
    fireEvent.click(within(formPanel).getByRole("button", { name: "Cancel" }));
    formPanel = openEditForm("Main network (Sample)");
    expect(within(formPanel).getByLabelText(MANUFACTURER_REFERENCE)).toHaveValue("");

    formPanel = openEditForm("Network B");
    expect(within(formPanel).getByLabelText(SUPPLIER_NAME)).toHaveValue("Supplier B");
    expect(store.getState().networks.byId["net-b" as NetworkId]?.planSupplierName).toBe("Supplier B");

    fireEvent.click(within(getPanelByHeading("Network Scope")).getByRole("button", { name: "New" }));
    const createPanel = getPanelByHeading("Create network");
    expect(within(createPanel).getByLabelText(SUPPLIER_NAME)).toHaveValue("");
    expect(within(createPanel).getByLabelText(SUPPLIER_REFERENCE)).toHaveValue("");
  });

  it("creates a network with reference-only and name-only roles", async () => {
    const { store } = renderAppWithState(createInitialState());
    switchScreen("networkScope");
    fireEvent.click(within(getPanelByHeading("Network Scope")).getByRole("button", { name: "New" }));
    const createPanel = getPanelByHeading("Create network");
    fireEvent.change(within(createPanel).getByLabelText("Network name"), { target: { value: "Plan parties" } });
    fireEvent.change(within(createPanel).getByLabelText("Network technical ID"), { target: { value: "NET-PARTIES" } });
    fireEvent.change(within(createPanel).getByLabelText(MANUFACTURER_REFERENCE), { target: { value: "000123" } });
    fireEvent.change(within(createPanel).getByLabelText(SUPPLIER_NAME), { target: { value: "Supplier B" } });
    fireEvent.click(within(createPanel).getByRole("button", { name: "Create network" }));

    await waitFor(() => {
      const created = Object.values(store.getState().networks.byId).find((network) => network?.technicalId === "NET-PARTIES");
      expect(created).toMatchObject({ planManufacturerReference: "000123", planSupplierName: "Supplier B" });
      expect(created?.planManufacturerName).toBeUndefined();
      expect(created?.planSupplierReference).toBeUndefined();
    });
  });

  it("rejects multiline and over-limit values in the shared form draft", () => {
    const baseInput = {
      name: "Body",
      technicalId: "NET-BODY",
      createdAtDate: "2026-01-10",
      description: "",
      author: "",
      voltageV: "",
      projectCode: "",
      entityPrefix: "",
      logoUrl: "",
      exportNotes: "",
      planRevision: "",
      planIssueDate: ""
    };
    const parties = { planManufacturerName: "", planManufacturerReference: "", planSupplierName: "", planSupplierReference: "" };
    expect(buildNetworkFormDraft({ ...baseInput, planParties: { ...parties, planSupplierName: "Line\nbreak" } }).kind).toBe(
      "error"
    );
    expect(buildNetworkFormDraft({ ...baseInput, planParties: { ...parties, planManufacturerName: "x".repeat(81) } }).kind).toBe(
      "error"
    );
    const valid = buildNetworkFormDraft({
      ...baseInput,
      planParties: { ...parties, planManufacturerReference: ` ${"0".repeat(120)} ` }
    });
    expect(valid.kind === "valid" ? valid.draft.planParties.planManufacturerReference : null).toBe("0".repeat(120));
  });

  it("provides French role labels", () => {
    setActiveLocale("fr");
    expect(translateCurrent("ui.planManufacturerRole")).toBe("Référence plan fabricant");
    expect(translateCurrent("ui.planSupplierReferenceOptional")).toBe("Référence fournisseur (facultatif)");
  });
});
