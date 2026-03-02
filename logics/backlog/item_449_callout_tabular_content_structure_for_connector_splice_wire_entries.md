## item_449_callout_tabular_content_structure_for_connector_splice_wire_entries - callout tabular content structure for connector splice wire entries
> From version: 0.9.18
> Status: Ready
> Understanding: 100%
> Confidence: 95%
> Progress: 0%
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
