## item_451_callout_length_visibility_independence_and_render_regression_coverage - callout length visibility independence and render regression coverage
> From version: 0.9.18
> Status: Done
> Understanding: 100%
> Confidence: 95%
> Progress: 100%
> Complexity: Medium
> Theme: UI
> Reminder: Update status/understanding/confidence/progress and linked task references when you edit this doc.

# Problem
The critical contract in `req_089` is independence: hiding wire names must never hide wire lengths. This needs explicit rendering logic and regression tests.

# Scope
- In:
  - enforce rendering rule: length column always visible regardless of wire-name setting.
  - implement/validate both states (`wire name` on/off).
  - add focused regression tests for independence behavior.
  - verify no regressions in callout selection/show/hide behavior.
- Out:
  - broader callout styling redesign.

# Acceptance criteria
- AC1: With `Show wire names in callouts = false`, lengths remain visible.
- AC2: With setting enabled, wire names are added without altering length visibility.
- AC3: Section and technical ID remain visible in both modes.
- AC4: Automated tests cover both name-on/name-off rendering matrices.

# AC Traceability
- AC1/AC2/AC3 -> `src/app/components/NetworkSummaryPanel.tsx` render branches.
- AC4 -> `src/tests/app.ui.network-summary-workflow-polish.spec.tsx` (or equivalent targeted UI tests).

# Priority
- Impact: High (core acceptance requirement).
- Urgency: Medium-High (after 449/450, before closure).

# Notes
- Risks:
  - conditional rendering bugs can hide mandatory length data.
  - tests may be brittle if tied to exact text layout instead of semantics.
- References:
  - `logics/request/req_089_network_summary_callout_tabular_layout_with_optional_wire_name_visibility_setting.md`
  - `src/app/components/NetworkSummaryPanel.tsx`
  - `src/tests/app.ui.network-summary-workflow-polish.spec.tsx`
