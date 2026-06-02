import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ImportOverwriteDialog, type OverwriteDecision } from "../app/components/dialogs/ImportOverwriteDialog";
import type { NetworkId } from "../core/entities";
import type { OverwriteCandidate } from "../adapters/portability";

function makeCandidate(overrides: Partial<OverwriteCandidate> = {}): OverwriteCandidate {
  return {
    importedNetworkId: "net-a",
    importedName: "Imported A",
    importedTechnicalId: "TECH-A",
    existingNetworkId: "net-a" as NetworkId,
    existingName: "Existing A",
    existingTechnicalId: "TECH-A",
    matchReason: "id",
    ...overrides
  };
}

describe("ImportOverwriteDialog", () => {
  it("exposes three radio options per candidate with Overwrite checked by default", () => {
    const onConfirm = vi.fn();
    const onCancel = vi.fn();
    render(
      <ImportOverwriteDialog
        isOpen
        candidates={[makeCandidate()]}
        onConfirm={onConfirm}
        onCancel={onCancel}
      />
    );

    const dialog = screen.getByRole("dialog", { name: "Similar networks detected" });
    expect(within(dialog).getByRole("radio", { name: "Overwrite existing" })).toBeChecked();
    expect(within(dialog).getByRole("radio", { name: "Skip" })).not.toBeChecked();
    expect(within(dialog).getByRole("radio", { name: "Keep both (rename incoming)" })).not.toBeChecked();
  });

  it("emits per-candidate decisions captured by the user", () => {
    const onConfirm = vi.fn<(decisions: Map<string, OverwriteDecision>) => void>();
    render(
      <ImportOverwriteDialog
        isOpen
        candidates={[
          makeCandidate({ importedNetworkId: "net-a", existingName: "Existing A" }),
          makeCandidate({ importedNetworkId: "net-b", existingName: "Existing B" })
        ]}
        onConfirm={onConfirm}
        onCancel={vi.fn()}
      />
    );

    const dialog = screen.getByRole("dialog");
    const groupA = within(dialog).getByRole("group", { name: "Decision for Existing A" });
    fireEvent.click(within(groupA).getByRole("radio", { name: "Skip" }));
    const groupB = within(dialog).getByRole("group", { name: "Decision for Existing B" });
    fireEvent.click(within(groupB).getByRole("radio", { name: "Keep both (rename incoming)" }));
    fireEvent.click(within(dialog).getByRole("button", { name: "Confirm" }));

    expect(onConfirm).toHaveBeenCalledTimes(1);
    const decisions = onConfirm.mock.calls[0]![0];
    expect(decisions.get("net-a")).toBe("skip");
    expect(decisions.get("net-b")).toBe("keep-both");
  });

  it("bulk row applies to candidates not yet decided individually", () => {
    const onConfirm = vi.fn<(decisions: Map<string, OverwriteDecision>) => void>();
    render(
      <ImportOverwriteDialog
        isOpen
        candidates={[
          makeCandidate({ importedNetworkId: "net-a", existingName: "Existing A" }),
          makeCandidate({ importedNetworkId: "net-b", existingName: "Existing B" }),
          makeCandidate({ importedNetworkId: "net-c", existingName: "Existing C" })
        ]}
        onConfirm={onConfirm}
        onCancel={vi.fn()}
      />
    );

    const dialog = screen.getByRole("dialog");
    const groupA = within(dialog).getByRole("group", { name: "Decision for Existing A" });
    fireEvent.click(within(groupA).getByRole("radio", { name: "Keep both (rename incoming)" }));

    const bulkRow = within(dialog).getByRole("group", { name: "Apply to all remaining candidates" });
    fireEvent.click(within(bulkRow).getByRole("button", { name: "Skip" }));

    fireEvent.click(within(dialog).getByRole("button", { name: "Confirm" }));

    expect(onConfirm).toHaveBeenCalledTimes(1);
    const decisions = onConfirm.mock.calls[0]![0];
    expect(decisions.get("net-a")).toBe("keep-both");
    expect(decisions.get("net-b")).toBe("skip");
    expect(decisions.get("net-c")).toBe("skip");
  });

  it("individual click after bulk overrides the bulk decision for that candidate", () => {
    const onConfirm = vi.fn<(decisions: Map<string, OverwriteDecision>) => void>();
    render(
      <ImportOverwriteDialog
        isOpen
        candidates={[
          makeCandidate({ importedNetworkId: "net-a", existingName: "Existing A" }),
          makeCandidate({ importedNetworkId: "net-b", existingName: "Existing B" })
        ]}
        onConfirm={onConfirm}
        onCancel={vi.fn()}
      />
    );

    const dialog = screen.getByRole("dialog");
    const bulkRow = within(dialog).getByRole("group", { name: "Apply to all remaining candidates" });
    fireEvent.click(within(bulkRow).getByRole("button", { name: "Skip" }));

    const groupB = within(dialog).getByRole("group", { name: "Decision for Existing B" });
    fireEvent.click(within(groupB).getByRole("radio", { name: "Overwrite existing" }));

    fireEvent.click(within(dialog).getByRole("button", { name: "Confirm" }));

    const decisions = onConfirm.mock.calls[0]![0];
    expect(decisions.get("net-a")).toBe("skip");
    expect(decisions.get("net-b")).toBe("overwrite");
  });

  it("hides the bulk row when only one candidate is present", () => {
    render(
      <ImportOverwriteDialog
        isOpen
        candidates={[makeCandidate()]}
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />
    );
    expect(screen.queryByRole("group", { name: "Apply to all remaining candidates" })).toBeNull();
  });
});
