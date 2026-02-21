## item_077_wires_list_action_row_and_form_alignment - Wires List Action Row and Form Alignment
> From version: 0.4.0
> Understanding: 99%
> Confidence: 97%
> Progress: 100%
> Complexity: High
> Theme: Route-Aware Wire UX Harmonization
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
Wire list actions remain row-embedded and diverge from the unified interaction model, while wire workflows carry additional route semantics that require careful migration.

# Scope
- In:
  - Remove wire `Actions` column.
  - Add wire action row below list with focused-row targeting.
  - Preserve wire-specific behavior:
    - endpoint-driven route recalculation,
    - lock/auto route mode semantics,
    - route preview integration,
    - delete safety behavior.
  - Keep wire search/filter/sort ergonomics and route-mode filtering stable.
  - Keep edit form endpoint controls and validation unchanged.
- Out:
  - Multi-screen responsive and keyboard consistency hardening (covered by item_079).
  - Final end-to-end closure (covered by item_080).

# Acceptance criteria
- Wire table no longer contains an `Actions` column.
- Wire operations are available under the list and target the focused wire.
- Existing route-mode and endpoint validation behavior remains functionally identical.
- Selected wire context still highlights route segments and keeps inspector compatibility.
- No regression in forced-route lock/reset workflow.

# Priority
- Impact: High (wire lifecycle is core functional workflow).
- Urgency: High (required for complete req_013 convergence).

# Notes
- Dependencies: item_074.
- Blocks: item_078, item_080.
- Related AC: AC1, AC2, AC3, AC4, AC5, AC8.
- References:
  - `logics/request/req_013_list_form_workspace_harmonization_based_on_network_scope.md`
  - `src/app/components/workspace/ModelingSecondaryTables.tsx`
  - `src/app/components/workspace/ModelingFormsColumn.tsx`
  - `src/app/components/InspectorContextPanel.tsx`
  - `src/app/AppController.tsx`
  - `src/tests/app.ui.navigation-canvas.spec.tsx`
  - `src/tests/store.reducer.helpers.spec.ts`
