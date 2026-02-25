## req_060_accessibility_hardening_for_interactive_network_summary_modal_focus_sortable_tables_and_validation_navigation - Accessibility hardening for interactive network summary, modal focus, sortable tables, and validation/navigation semantics
> From version: 0.9.6
> Understanding: 98% (request converts a concrete a11y audit into a scoped hardening request with 6 implementation points)
> Confidence: 93% (findings are code-backed and mostly localized, with some cross-cutting regression work)
> Complexity: Medium-High
> Theme: Accessibility hardening (keyboard + screen reader semantics + focus management)
> Reminder: Update Understanding/Confidence and dependencies/references when you edit this doc.

# Needs
- Improve accessibility of the app based on a recent audit, with priority on keyboard access, screen reader semantics, and modal focus behavior.
- Fix 6 identified gaps affecting the `Network summary` interactive SVG, onboarding modal, sortable tables, Validation table row interaction, and issue counters in navigation/header.
- Preserve current UX and workflows while making interaction semantics explicit and consistent.

# Context
A targeted accessibility audit identified several concrete issues in current UI behavior:
- the `Network summary` SVG is exposed as an image while containing interactive descendants,
- segment selection in the 2D diagram is mouse-only,
- onboarding modal semantics are present but focus management appears incomplete,
- sortable tables use visual sort indicators without `aria-sort`,
- Validation row selection is click-only while other tables support keyboard row activation,
- issue counters are visually shown but hidden from screen readers in primary navigation/header actions.

The app already has strong accessibility foundations in some areas (drawer/panel toggle semantics, `Escape` close behavior for shell panels, visible focus styles, multiple keyboard-friendly data tables). This request should extend that baseline and remove the identified inconsistencies.

# Objective
- Make the audited accessibility gaps explicit requirements and close them without regressing existing workflows.
- Improve keyboard operability and screen reader clarity in the most-used interaction surfaces (`Network summary`, Validation, shell navigation, onboarding).
- Add regression coverage for critical a11y interaction contracts where feasible.

# Functional scope
## A. Network summary interactive SVG semantics (high priority)
- The `Network summary` 2D surface must not expose the root `<svg>` as a static image (`role="img"`) if it contains keyboard-focusable and interactive descendants.
- V1 must provide an accessibility contract that correctly reflects the surface as interactive content while keeping a meaningful accessible name/description for the diagram region.
- Any change to the root SVG semantics must preserve current pointer interactions, keyboard interaction on existing interactive nodes/callouts, and current visual behavior.

## B. Segment interaction keyboard parity in Network summary 2D (high priority)
- Segment selection/action in the 2D diagram must be keyboard accessible (not mouse-only).
- V1 must add a keyboard-operable interaction path for selectable segments equivalent to the current pointer behavior (selection at minimum).
- Segment interactive targets should expose:
  - focusability,
  - an accessible role/label,
  - keyboard activation (`Enter` and `Space`, unless another explicit pattern is justified).
- Pointer hitbox behavior and pan/zoom interactions must remain intentional after the change.

## C. Onboarding modal focus management hardening (high priority)
- The onboarding modal already uses `role="dialog"` / `aria-modal="true"` and must gain robust focus behavior.
- V1 should ensure:
  - deterministic initial focus when opening the modal,
  - focus is kept within the modal while open (focus trap / equivalent containment behavior),
  - `Escape` closes the modal (unless explicitly disabled by product decision),
  - focus returns to a sensible trigger/previous element on close.
- Backdrop click close behavior may remain, but must not be the only reliable dismissal path.

## D. Sortable table semantics with aria-sort (high priority)
- Sortable tables must expose the current sort state to assistive technologies using `aria-sort` on the appropriate column headers.
- This applies to existing sortable data tables in Modeling, Analysis, Validation, and related screens that currently rely on visual sort indicators only.
- V1 may implement a shared pattern/helper if it reduces drift across tables.
- Visual sort indicators remain allowed, but they must no longer be the only representation of sort state.

## E. Validation table row keyboard accessibility consistency (medium-high priority)
- Validation row selection (currently click-based row selection/cursor update) must be keyboard accessible and consistent with the app’s other focusable-row tables.
- Users navigating by keyboard should be able to:
  - focus a validation row (or equivalent row-level control),
  - update the Validation issue cursor/selection,
  - still use `Go to` actions without regression.
- The implementation should avoid ambiguous double-activation behavior between row selection and the row’s `Go to` button.

## F. Screen reader exposure of issue counters in primary navigation/header (medium priority)
- Primary UI actions that display issue counts (for example Validation tab badge, `Ops & Health` badge) must expose the count information to assistive technologies.
- V1 should ensure the accessible name/description for those controls includes the relevant counts and error-state context when meaningful.
- Visual badges can remain `aria-hidden` if equivalent information is conveyed via accessible text; otherwise they should no longer be hidden.
- Do not regress current visual badge styling/state signaling.

# Non-functional requirements
- Preserve current interaction performance and visual behavior outside the intended a11y improvements.
- Keep accessibility semantics deterministic and consistent across screen switches and re-renders.
- Favor maintainable patterns/shared helpers for repeated a11y behaviors (sortable headers, focusable rows) when appropriate.

# Validation and regression safety
- Add/extend tests (unit/integration/E2E where practical) for:
  - interactive `Network summary` SVG accessibility semantics contract (root surface + interactive descendants)
  - keyboard activation for selectable segments in the 2D diagram
  - onboarding modal focus behavior (`initial focus`, `Escape`, focus return; focus containment where testable)
  - `aria-sort` updates on representative sortable tables (at least Validation + one Modeling/Analysis table)
  - keyboard row selection in Validation table without regressing `Go to`
  - screen reader-visible issue count text/accessible names for primary navigation/header controls
- If some behaviors are hard to assert in existing test layers (e.g. full focus trap), add targeted structural/DOM assertions and document any remaining manual QA checks.

# Acceptance criteria
- AC1: The `Network summary` 2D SVG accessibility semantics no longer misrepresent an interactive surface as a static image, while preserving a meaningful accessible label/description.
- AC2: Selectable segments in the `Network summary` 2D diagram are keyboard focusable and activatable with accessible labels/roles.
- AC3: The onboarding modal has reliable focus management (initial focus, keyboard dismissal via `Escape`, and focus return on close; focus containment while open in normal usage).
- AC4: Sortable tables expose current sort state via `aria-sort` on the relevant headers without regressing visual sort indicators.
- AC5: Validation row selection is keyboard accessible and remains compatible with row-level `Go to` actions.
- AC6: Validation/ops issue counters shown in primary navigation/header are exposed to assistive technologies (accessible names/text include count information or equivalent).

# Out of scope
- Full WCAG certification or a complete app-wide accessibility audit across every theme and color contrast combination.
- A broad redesign of table interactions unrelated to the identified keyboard/semantic gaps.
- Large UI copy rewrites beyond what is needed to expose count/sort/focus semantics accessibly.

# Backlog
- `logics/backlog/item_342_network_summary_2d_accessibility_semantics_and_segment_keyboard_activation_parity.md`
- `logics/backlog/item_343_onboarding_modal_focus_management_trap_escape_and_focus_return_hardening.md`
- `logics/backlog/item_344_sortable_table_aria_sort_validation_row_keyboard_selection_and_issue_counter_accessible_names.md`

# Orchestration task
- `logics/tasks/task_057_req_060_accessibility_hardening_for_network_summary_modal_and_semantics_orchestration_and_delivery_control.md`

# References
- `src/app/components/NetworkSummaryPanel.tsx`
- `src/app/components/onboarding/OnboardingModal.tsx`
- `src/app/hooks/useWorkspaceShellChrome.ts`
- `src/app/components/workspace/ValidationWorkspaceContent.tsx`
- `src/app/components/WorkspaceNavigation.tsx`
- `src/app/components/workspace/AppHeaderAndStats.tsx`
- `src/app/components/workspace/ModelingPrimaryTables.tsx`
- `src/app/components/workspace/AnalysisNodeSegmentWorkspacePanels.tsx`
- `src/app/components/workspace/AnalysisWireWorkspacePanels.tsx`
- `src/app/styles/tables.css`
