import { render, renderHook, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { WireRecomputeReportEntry } from "../store";
import type { WireId } from "../core/entities";
import { useAppControllerNetworkRecomputeReport } from "../app/hooks/controller/useAppControllerNetworkRecomputeReport";
import { FileFeedbackDialog } from "../app/components/dialogs/FileFeedbackDialog";

function entry(technicalId: string, message: string): WireRecomputeReportEntry {
  return { wireId: `wire-${technicalId}` as WireId, technicalId, kinds: ["sideB"], message };
}

describe("useAppControllerNetworkRecomputeReport", () => {
  it("does not open a dialog when there is no recompute signal", () => {
    const onConsume = vi.fn();
    const { result } = renderHook(() => useAppControllerNetworkRecomputeReport(null, onConsume));
    expect(result.current.networkRecomputeReportDialog).toBeNull();
    expect(onConsume).not.toHaveBeenCalled();
  });

  it("opens an explicit no-change dialog when the recompute found nothing", () => {
    const onConsume = vi.fn();
    // Stable reference: the real signal comes from store state, not a per-render literal.
    const empty: WireRecomputeReportEntry[] = [];
    const { result } = renderHook(() => useAppControllerNetworkRecomputeReport(empty, onConsume));
    const dialog = result.current.networkRecomputeReportDialog;
    expect(dialog).not.toBeNull();
    expect(dialog?.items).toEqual([]);
    expect(dialog?.message).toMatch(/no changes were needed/i);
    expect(onConsume).toHaveBeenCalledTimes(1);
  });

  it("lists each change and reports the count when the recompute applied changes", () => {
    const onConsume = vi.fn();
    const entries = [
      entry("W-1", "Wire 'W-1': splice side B L -> R."),
      entry("W-2", "Wire 'W-2': route 5 -> 3 segment(s).")
    ];
    const { result } = renderHook(() => useAppControllerNetworkRecomputeReport(entries, onConsume));
    const dialog = result.current.networkRecomputeReportDialog;
    expect(dialog?.items).toEqual([
      "Wire 'W-1': splice side B L -> R.",
      "Wire 'W-2': route 5 -> 3 segment(s)."
    ]);
    expect(dialog?.message).toMatch(/2 changes were applied/i);
    expect(onConsume).toHaveBeenCalledTimes(1);
  });
});

describe("FileFeedbackDialog scroll region", () => {
  it("renders report items inside the shared scrollable feedback list", () => {
    render(
      <FileFeedbackDialog
        isOpen
        title="Recompute report"
        message="Recomputed all wire routes and directional splice sides. 1 change was applied."
        items={["Wire 'W-1': splice side B L -> R."]}
        intent="neutral"
        onClose={() => undefined}
      />
    );

    const list = document.querySelector(".confirm-dialog-feedback-list");
    expect(list).not.toBeNull();
    expect(list?.tagName.toLowerCase()).toBe("ul");
    expect(screen.getByText("Wire 'W-1': splice side B L -> R.")).toBeInTheDocument();
  });
});
