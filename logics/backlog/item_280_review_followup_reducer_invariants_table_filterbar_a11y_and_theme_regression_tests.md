## item_280_review_followup_reducer_invariants_table_filterbar_a11y_and_theme_regression_tests - Review Follow-up: Reducer Invariants, TableFilterBar A11y, and Theme Regression Tests
> From version: 0.8.1
> Understanding: 99%
> Confidence: 97%
> Progress: 100%
> Complexity: Medium-High
> Theme: Cross-cutting robustness hardening from global review findings
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
The global review identified three cross-cutting risks: reducers accepting empty required values after trim, `TableFilterBar` text inputs relying on placeholder-only labeling, and theme tests validating class wiring without surface-rendering coverage.

# Scope
- In:
  - Enforce non-empty required-field invariants after trim in reviewed reducers (connector/splice/node/segment upserts at minimum).
  - Add explicit accessible labeling for `TableFilterBar` text input(s).
  - Strengthen theme regression tests with a small representative rendered-surface coverage baseline beyond shell class assertions.
  - Document chosen test surface coverage for standalone themes.
- Out:
  - Broad UI accessibility audit outside `TableFilterBar`.
  - Visual snapshot testing infrastructure overhaul.
  - Theme palette redesign.

# Acceptance criteria
- Reviewed reducers reject empty required values after trim.
- `TableFilterBar` text inputs have explicit accessible names/labels.
- Theme tests cover representative rendered surfaces beyond shell class wiring (or defer rationale is documented).

# Priority
- Impact: High.
- Urgency: High.

# Notes
- Dependencies: `req_044`.
- Blocks: item_281.
- Related AC: AC12, AC13, AC14, AC17.
- References:
  - `logics/request/req_044_table_sortability_completion_analysis_nodes_segments_views_and_wire_connector_splice_table_analysis_enrichment.md`
  - `src/store/reducer/connectorReducer.ts`
  - `src/store/reducer/spliceReducer.ts`
  - `src/store/reducer/nodeReducer.ts`
  - `src/store/reducer/segmentReducer.ts`
  - `src/app/components/workspace/TableFilterBar.tsx`
  - `src/tests/app.ui.theme.spec.tsx`
