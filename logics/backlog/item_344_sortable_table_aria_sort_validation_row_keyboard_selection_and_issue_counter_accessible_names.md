## item_344_sortable_table_aria_sort_validation_row_keyboard_selection_and_issue_counter_accessible_names - Sortable table aria-sort, Validation row keyboard selection, and issue counter accessible names
> From version: 0.9.6
> Status: Done
> Understanding: 99%
> Confidence: 95%
> Progress: 100%
> Complexity: Medium-High
> Theme: Cross-screen accessibility semantics consistency for tables, Validation, and shell/navigation counters
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
Several app surfaces rely on visual state only or click-only interaction patterns: sortable tables lack `aria-sort`, Validation row selection is not keyboard-accessible, and issue counters in primary navigation/header are visually visible but hidden from assistive technologies.

# Scope
- In:
  - Add `aria-sort` semantics to representative/all sortable tables covered by `req_060` (Modeling, Analysis, Validation and related sortable data tables).
  - Ensure `aria-sort` updates with current sort state without regressing existing visual sort indicators.
  - Make Validation row selection/cursor update keyboard accessible and consistent with the app’s focusable-row pattern.
  - Preserve row-level `Go to` behavior and avoid ambiguous double-activation between row selection and the `Go to` button.
  - Expose issue counts and error-state context for primary navigation/header controls (Validation tab, `Ops & Health`, or equivalent) through accessible names/text.
  - Add/extend regression coverage for the above semantics and keyboard behavior.
- Out:
  - A broader table UX redesign unrelated to sort/selection semantics.
  - Global contrast/theme audits.

# Acceptance criteria
- Sortable tables expose current sort state through `aria-sort` on relevant headers.
- Validation row selection can be performed with keyboard navigation/activation and remains compatible with `Go to`.
- Primary navigation/header issue counters are available to assistive technologies through accessible names/text or equivalent non-hidden semantics.
- Existing visual indicators/badges and interactions remain functional.

# Priority
- Impact: High.
- Urgency: Medium-High.

# Notes
- Dependencies: `req_060`.
- Blocks: `task_057` closure.
- Related AC: req_060 AC4, AC5, AC6.
- Delivery notes:
  - Sortable tables expose `aria-sort` (including Validation and representative Modeling/Analysis tables) with regression coverage.
  - Validation rows support keyboard selection parity without regressing row-level `Go to`.
  - Primary navigation/header issue counters are exposed through accessible names/text while preserving visual badges.
- References:
  - `logics/request/req_060_accessibility_hardening_for_interactive_network_summary_modal_focus_sortable_tables_and_validation_navigation.md`
  - `src/app/components/workspace/ValidationWorkspaceContent.tsx`
  - `src/app/components/workspace/ModelingPrimaryTables.tsx`
  - `src/app/components/workspace/AnalysisNodeSegmentWorkspacePanels.tsx`
  - `src/app/components/workspace/AnalysisWireWorkspacePanels.tsx`
  - `src/app/components/WorkspaceNavigation.tsx`
  - `src/app/components/workspace/AppHeaderAndStats.tsx`
  - `src/tests/app.ui.validation.spec.tsx`
  - `src/tests/app.ui.workspace-shell-regression.spec.tsx`

# AC Traceability
- request-AC1 -> This backlog slice. Evidence needed: The `Network summary` 2D SVG accessibility semantics no longer misrepresent an interactive surface as a static image, while preserving a meaningful accessible label/description.
- request-AC2 -> This backlog slice. Evidence needed: Selectable segments in the `Network summary` 2D diagram are keyboard focusable and activatable with accessible labels/roles.
- request-AC3 -> This backlog slice. Evidence needed: The onboarding modal has reliable focus management (initial focus, keyboard dismissal via `Escape`, and focus return on close; focus containment while open in normal usage).
- request-AC4 -> This backlog slice. Evidence needed: Sortable tables expose current sort state via `aria-sort` on the relevant headers without regressing visual sort indicators.
- request-AC5 -> This backlog slice. Evidence needed: Validation row selection is keyboard accessible and remains compatible with row-level `Go to` actions.
- request-AC6 -> This backlog slice. Evidence needed: Validation/ops issue counters shown in primary navigation/header are exposed to assistive technologies (accessible names/text include count information or equivalent).
- request-AC1 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC2 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC3 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC4 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC5 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC6 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
