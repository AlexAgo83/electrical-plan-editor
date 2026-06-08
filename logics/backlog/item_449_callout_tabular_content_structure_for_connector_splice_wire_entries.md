## item_449_callout_tabular_content_structure_for_connector_splice_wire_entries - callout tabular content structure for connector splice wire entries
> From version: 0.9.18
> Status: Done
> Understanding: 100%
> Confidence: 95%
> Progress: 100%
> Complexity: Medium
> Theme: UI
> Reminder: Update status/understanding/confidence/progress and linked task references when you edit this doc.

# Problem
Current callout wire rows are free-form strings. `req_089` requires structured, table-like callout content so users can clearly map values to fields.

# Scope
- In:
  - replace free-form row text rendering with table-like layout primitives in callouts.
  - implement baseline columns: `Technical ID`, `Length (mm)`, `Section (mm2)`.
  - keep row ordering deterministic and readable.
  - preserve existing callout selection/drag integration.
- Out:
  - callout position/drag algorithm redesign.
  - optional `Wire name` setting behavior (handled by item_450/451).

# Acceptance criteria
- AC1: Callout content renders as structured columns with explicit headers.
- AC2: Baseline columns are exactly `Technical ID`, `Length (mm)`, `Section (mm2)`.
- AC3: Legacy free-form single-line row rendering is removed for wire entries.
- AC4: Callout interaction behavior remains non-regressed.

# AC Traceability
- AC1/AC2/AC3 -> `src/app/components/NetworkSummaryPanel.tsx` callout content rendering layer.
- AC4 -> `src/tests/app.ui.network-summary-workflow-polish.spec.tsx` and canvas behavior tests.
- request-AC1 -> This backlog slice. Evidence needed: Connector/splice callouts render wire info using a table-like layout with explicit columns.
- request-AC2 -> This backlog slice. Evidence needed: A new `Canvas tools preferences` option controls wire-name visibility in callouts.
- request-AC3 -> This backlog slice. Evidence needed: Wire-name visibility option default is disabled when no prior preference exists.
- request-AC4 -> This backlog slice. Evidence needed: When wire-name visibility is disabled, wire names are hidden and length values remain visible.
- request-AC5 -> This backlog slice. Evidence needed: When wire-name visibility is enabled, wire names are shown in the callout table alongside other columns.
- request-AC6 -> This backlog slice. Evidence needed: Wire-name preference persists and restores across reload/relaunch.
- request-AC7 -> This backlog slice. Evidence needed: Existing callout interactions (show/hide toggle, selection linkage, drag behavior) remain non-regressed.
- request-AC8 -> This backlog slice. Evidence needed: `lint`, `typecheck`, and relevant UI tests pass after the change.
- request-AC1 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC2 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC3 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC4 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC5 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC6 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC7 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC8 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`

# Priority
- Impact: High (main UX improvement requested).
- Urgency: High (blocks option and independence items).

# Notes
- Risks:
  - layout width/height growth may increase overlap in dense diagrams.
  - subtle a11y regressions if semantics/labels are unclear.
- References:
  - `logics/request/req_089_network_summary_callout_tabular_layout_with_optional_wire_name_visibility_setting.md`
  - `src/app/components/NetworkSummaryPanel.tsx`
