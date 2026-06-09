import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { asConnectorId, asSegmentId, asWireId, getPanelByHeading, switchSubScreenDrawerAware } from "./helpers/app-ui-test-utils";
import { createSafeConnectorCascadeState, openModelingDeleteScenario, openOpsPanel } from "./helpers/delete-confirmation-test-utils";

describe("App integration UI - batch selection dialog", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("opens batch selection from multi-select actions after rows are selected", () => {
    openModelingDeleteScenario(createSafeConnectorCascadeState());

    switchSubScreenDrawerAware("connector");
    const connectorsPanel = getPanelByHeading("Connectors");
    fireEvent.click(within(connectorsPanel).getByText("Cascade connector"));
    expect(getPanelByHeading("Edit Connector")).toBeInTheDocument();

    fireEvent.click(within(connectorsPanel).getByRole("button", { name: "Select multiple" }));

    expect(screen.queryByRole("dialog", { name: "Batch selection" })).not.toBeInTheDocument();
    expect(within(connectorsPanel).getByRole("button", { name: "Open batch" })).toBeDisabled();
    fireEvent.click(within(connectorsPanel).getByText("Cascade connector"));
    fireEvent.click(within(connectorsPanel).getByRole("button", { name: "Open batch (1)" }));

    const batchDialog = screen.getByRole("dialog", { name: "Batch selection" });
    const batchPanel = within(batchDialog).getByTestId("modeling-batch-context-panel");
    expect(batchPanel).toHaveTextContent("1 connectors selected");
    fireEvent.keyDown(batchDialog, { key: "Escape" });
    expect(screen.queryByRole("dialog", { name: "Batch selection" })).not.toBeInTheDocument();
    expect(within(connectorsPanel).getByRole("button", { name: "Open batch (1)" })).toBeInTheDocument();
  });

  it("refuses partial connector batch delete when the selection mixes cascade-safe and blocked entries", async () => {
    const { store } = openModelingDeleteScenario(createSafeConnectorCascadeState());

    switchSubScreenDrawerAware("connector");
    const connectorsPanel = getPanelByHeading("Connectors");
    fireEvent.click(within(connectorsPanel).getByRole("button", { name: "Select multiple" }));
    fireEvent.click(within(connectorsPanel).getByText("Cascade connector"));
    fireEvent.click(within(connectorsPanel).getByText("Connector 1"));
    fireEvent.click(within(connectorsPanel).getByRole("button", { name: "Open batch (2)" }));

    const batchPanel = within(screen.getByRole("dialog", { name: "Batch selection" })).getByTestId("modeling-batch-context-panel");
    expect(batchPanel).toHaveTextContent("2 connectors selected");
    expect(batchPanel).toHaveTextContent("Cascade delete");
    expect(batchPanel).toHaveTextContent("Blocked");

    fireEvent.click(within(batchPanel).getByRole("button", { name: "Delete selected (2)" }));

    const dialog = await screen.findByRole("dialog", { name: "Batch delete blocked" });
    expect(dialog).toHaveTextContent("Batch delete will not remove a partial selection");
    fireEvent.click(within(dialog).getByRole("button", { name: "Close" }));

    expect(store.getState().connectors.byId[asConnectorId("C1")]).toBeDefined();
    expect(store.getState().connectors.byId[asConnectorId("C-CASCADE")]).toBeDefined();
  });

  it("allows multi-editing segment layer parameters while segment batch selection is active", async () => {
    const { store } = openModelingDeleteScenario();

    switchSubScreenDrawerAware("segment");
    const segmentsPanel = getPanelByHeading("Segments");
    fireEvent.click(within(segmentsPanel).getByRole("button", { name: "Select multiple" }));
    fireEvent.click(within(segmentsPanel).getByText("SEG-A"));
    fireEvent.click(within(segmentsPanel).getByText("SEG-B"));
    fireEvent.click(within(segmentsPanel).getByRole("button", { name: "Open batch (2)" }));

    const batchPanel = within(screen.getByRole("dialog", { name: "Batch selection" })).getByTestId("modeling-batch-context-panel");
    const layerInput = within(batchPanel).getByLabelText("Layer (optional)");
    fireEvent.change(layerInput, { target: { value: "C" } });
    expect(layerInput).toHaveValue("C");
    fireEvent.change(layerInput, { target: { value: "CT5" } });
    expect(layerInput).toHaveValue("CT5");
    fireEvent.change(within(batchPanel).getByLabelText("Insulation (optional)"), { target: { value: "XLPE" } });
    fireEvent.click(within(batchPanel).getByRole("button", { name: "Apply to selected (2)" }));

    await waitFor(() => {
      expect(store.getState().segments.byId[asSegmentId("SEG-A")]?.sheathType).toBe("CT5");
      expect(store.getState().segments.byId[asSegmentId("SEG-B")]?.sheathType).toBe("CT5");
      expect(store.getState().segments.byId[asSegmentId("SEG-A")]?.insulation).toBe("XLPE");
      expect(store.getState().segments.byId[asSegmentId("SEG-B")]?.insulation).toBe("XLPE");
    });
  });

  it("deletes multiple wires as one undoable batch operation", async () => {
    const { store } = openModelingDeleteScenario();

    switchSubScreenDrawerAware("wire");
    const wiresPanel = getPanelByHeading("Wires");
    fireEvent.click(within(wiresPanel).getByRole("button", { name: "Select multiple" }));
    fireEvent.click(within(wiresPanel).getByText("Wire 1"));
    fireEvent.click(within(wiresPanel).getByText("Wire deletable"));
    fireEvent.click(within(wiresPanel).getByRole("button", { name: "Open batch (2)" }));

    const batchPanel = within(screen.getByRole("dialog", { name: "Batch selection" })).getByTestId("modeling-batch-context-panel");
    fireEvent.click(within(batchPanel).getByRole("button", { name: "Delete selected (2)" }));

    const dialog = await screen.findByRole("dialog", { name: "Delete selected wires" });
    fireEvent.click(within(dialog).getByRole("button", { name: "Delete selected" }));

    await waitFor(() => {
      expect(store.getState().wires.byId[asWireId("W1")]).toBeUndefined();
      expect(store.getState().wires.byId[asWireId("W-DEL")]).toBeUndefined();
    });

    openOpsPanel();
    fireEvent.click(screen.getByRole("button", { name: "Undo" }));

    expect(store.getState().wires.byId[asWireId("W1")]).toBeDefined();
    expect(store.getState().wires.byId[asWireId("W-DEL")]).toBeDefined();
  });
});
