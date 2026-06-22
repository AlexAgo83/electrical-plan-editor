## item_635_network_scope_manual_recompute_action_with_scrollable_change_report - Network scope manual recompute action with scrollable change report
> From version: 1.16.6
> Schema version: 1.0
> Status: Done
> Understanding: 95
> Confidence: 87
> Progress: 100%
> Complexity: High
> Theme: Operator workflow and runtime integration
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
The operator needs an explicit action to recompute all wire routes and directional splice sides for an entire network on demand, instead of relying on incidental recomputes that only fire when a wire, splice, or segment is edited. This is the operator-facing complement to the geometric splice-side fix (`req_148`): already-saved workspaces only correct their stored `portIndex` / `spliceSideOverride` on the next recompute, and there is currently no way to trigger that for the whole harness.
The action must be a button placed next to the Cancel button in the network edit form (network scope), shown when a network is being edited.
After the recompute, a popup must list the changes that were found (routes rewritten, lengths changed, directional splice sides re-inferred), so the operator can see what the recompute did rather than having it happen silently.
The popup must be reliably scrollable: when many changes are found the list must scroll inside the dialog instead of overflowing off-screen. This explicitly fixes the readability defect seen on the existing splice "floating" migration report popup, which was not scrollable.
When no changes are found, the popup must clearly say so (empty/no-change state) rather than appearing broken or empty.

# Scope
- In:
  - A "recompute network" action button in the `row-actions` row of the network edit form (`NetworkScopeWorkspaceContent.tsx`), shown next to Cancel in edit mode only, following the existing icon/button + DOM-translation i18n conventions.
  - A store action / controller path that runs the full-network recompute via `recomputeAllWiresForNetwork` semantics and returns a structured before/after change report (per wire: route rewritten, length changed, directional splice side A/B re-inferred) with a deterministic ordering.
  - A dedicated scrollable result dialog listing the changes, with an explicit no-change empty state and a clear error path when a wire cannot be recomputed (no partial commit).
  - Fix the shared `confirm-dialog-feedback-list` / dialog-body styling so both the new dialog and the existing splice "floating" migration report popup (`FileFeedbackDialog`) scroll within a bounded height (`min-height: 0; max-height; overflow: auto` on the scroll region) without overflowing the viewport, including small/mobile viewports.
  - i18n labels for the new button and popup strings; targeted tests for the report builder, the no-change state, edit-mode-only button visibility, and the dialog scroll-region markup/styling.
- Out:
  - Changing the routing/recompute algorithm or the directional splice side geometry (owned by `req_148`).
  - Automatic recompute on every workspace load, multi-network batch recompute, persistence schema changes, or an undo/redo redesign.

# Acceptance criteria
- AC1: In network scope, while editing a network, a recompute action button is shown next to the Cancel button (edit mode only; not shown in create mode). It uses the app icon/button conventions and is keyboard and screen-reader accessible.
- AC2: Activating the button recomputes all wire routes and directional splice sides for the focused network and persists the corrected wires (same result the incidental recompute path produces), with corrected `portIndex` / `spliceSideOverride` for affected directional splices.
- AC3: After recompute, a popup lists every change found, grouped or labeled by kind (route rewritten, length changed, directional splice side A/B re-inferred), each entry naming the wire technical ID and showing before/after values where applicable.
- AC4: The popup is scrollable — with many entries the list scrolls within a bounded dialog height and never pushes content off-screen or beyond the viewport, including on small/mobile viewports. The header and close action remain visible while the list scrolls.
- AC5: When the recompute finds no changes, the popup shows an explicit no-change message instead of an empty or broken-looking dialog.
- AC6: If the recompute fails for any wire (e.g. an invalid locked route), the operator is shown a clear error message and no partial/inconsistent state is committed.
- AC7: The existing splice "floating" migration report popup becomes scrollable through the same shared styling fix (regression-checked), so long migration reports are also readable.
- AC8: Targeted tests cover the change-report builder (before/after diff for route, length, and side changes), the no-change empty state, the edit-mode-only button visibility, and the dialog scroll-region styling/markup.

# AC Traceability
- request-AC1 -> This backlog slice. Proof: AC1: In network scope, while editing a network, a recompute action button is shown next to the Cancel button (edit mode only; not shown in create mode). It uses the app icon/button conventions and is keyboard and screen-reader accessible.
- request-AC2 -> This backlog slice. Proof: AC2: Activating the button recomputes all wire routes and directional splice sides for the focused network and persists the corrected wires (same result the incidental recompute path produces), with corrected `portIndex` / `spliceSideOverride` for affected directional splices.
- request-AC3 -> This backlog slice. Proof: AC3: After recompute, a popup lists every change found, grouped or labeled by kind (route rewritten, length changed, directional splice side A/B re-inferred), each entry naming the wire technical ID and showing before/after values where applicable.
- request-AC4 -> This backlog slice. Proof: AC4: The popup is scrollable — with many entries the list scrolls within a bounded dialog height and never pushes content off-screen or beyond the viewport, including on small/mobile viewports. The header and close action remain visible while the list scrolls.
- request-AC5 -> This backlog slice. Proof: AC5: When the recompute finds no changes, the popup shows an explicit no-change message instead of an empty or broken-looking dialog.
- request-AC6 -> This backlog slice. Proof: AC6: If the recompute fails for any wire (e.g. an invalid locked route), the operator is shown a clear error message and no partial/inconsistent state is committed.
- request-AC7 -> This backlog slice. Proof: AC7: The existing splice "floating" migration report popup becomes scrollable through the same shared styling fix (regression-checked), so long migration reports are also readable.
- request-AC8 -> This backlog slice. Proof: AC8: Targeted tests cover the change-report builder (before/after diff for route, length, and side changes), the no-change empty state, the edit-mode-only button visibility, and the dialog scroll-region styling/markup.

# Decision framing
- Product framing: Not needed
- Product signals: (none detected)
- Product follow-up: No product brief follow-up is expected based on current signals.
- Architecture framing: Not needed
- Architecture signals: (none detected)
- Architecture follow-up: No architecture decision follow-up is expected based on current signals.

# Links
- Product brief(s): (none yet)
- Architecture decision(s): (none yet)
- Request: `logics/request/req_149_network_scope_manual_recompute_action_with_scrollable_change_report.md`
- Primary task(s): (none yet)

# AI Context
- Summary: Network scope manual recompute action with scrollable change report
- Keywords: backlog-groom, request, network scope manual recompute action with scrollable change report, bounded slice
- Use when: Use when implementing or reviewing the delivery slice for Network scope manual recompute action with scrollable change report.
- Skip when: Skip when the change is unrelated to this delivery slice or its linked request.

# Priority
- Impact:
- Urgency:

# Notes
- Hybrid rationale: Derived from request `req_149_network_scope_manual_recompute_action_with_scrollable_change_report` and kept bounded to one coherent delivery slice.
- Source file: `logics/request/req_149_network_scope_manual_recompute_action_with_scrollable_change_report.md`.
- Generated locally by logics-manager.
- Task `task_144_network_scope_manual_recompute_action_with_scrollable_change_report` was finished via `logics-manager flow finish task` on 2026-06-22.

# Tasks
- `task_144_network_scope_manual_recompute_action_with_scrollable_change_report`
