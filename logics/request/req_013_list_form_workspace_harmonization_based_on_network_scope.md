## req_013_list_form_workspace_harmonization_based_on_network_scope - List/Form Workspace Harmonization Based on Network Scope
> From version: 0.4.0
> Understanding: 99%
> Confidence: 97%
> Complexity: High
> Theme: UX/UI Consistency Across Entity Workspaces
> Reminder: Update Understanding/Confidence and dependencies/references when you edit this doc.

# Needs
- Reuse the `Network Scope` list/form interaction model as the baseline for every other screen combining a list and a create/edit form.
- Rework entity-table actions so they are no longer embedded in an `Actions` column.
- Move list actions to a dedicated action row under each list (same pattern as Network Scope).
- Use focused row selection as the interaction pivot for edit/delete/select-style operations.
- Harmonize UI/UX behavior and visual language across these screens to remove pattern drift.

# Context
`Network Scope` now provides a cleaner and more predictable interaction model:
- focus a row in the list,
- operate via contextual buttons below the list,
- edit/create in a neighboring form panel.

Other entity screens still use older mixed patterns (inline row actions + separate form panels), which creates inconsistency and extra cognitive load.

This request standardizes list/form ergonomics across workspaces by extending the validated `Network Scope` pattern.

Architecture references to preserve:
- `logics/architecture/target_reference_v1_frontend_local_first.md`
- `logics/request/req_009_2d_layout_persistence_and_crossing_minimization.md`
- `logics/request/req_010_network_scope_workspace_shell_and_global_defaults.md`
- `logics/request/req_012_environment_configuration_and_runtime_defaults.md`

## Objectives
- Define `Network Scope` as the canonical list/form UX pattern.
- Apply that pattern to all relevant entity screens with list + create/edit form behavior.
- Remove per-row action button stacks and `Actions` table columns where applicable.
- Keep existing domain safeguards, validation rules, and local-first deterministic behavior unchanged.
- Improve visual and behavioral consistency without introducing functional regressions.

## Functional Scope
### Pattern baseline (reference: Network Scope)
- Keep row-based focus/selection as the primary context source.
- Open edit mode from focused row behavior (click row / keyboard row activation).
- Keep create mode explicit (e.g. `New` button), with clear mode transitions (`create`/`edit`/`idle` as applicable).
- Place contextual actions in a button row under the list, full-width and responsive.
- Preserve list tools (search, filter, sort, compact density) and ensure they remain stable with the new action model.

### Screens and entities to migrate
- Modeling workspace list/form surfaces:
  - Connectors
  - Splices
  - Nodes
  - Segments
  - Wires
- Any additional workspace screen already using a list + create/edit form pairing must follow the same pattern.

### Action model migration
- Remove `Actions` columns from entity tables once equivalent under-list actions are available.
- Actions must target the focused row item (not arbitrary row-level inline buttons).
- Keep action availability/disabled states explicit:
  - disabled while create mode is active when destructive/context-switch operations should be blocked,
  - disabled when no row is focused,
  - disabled when action is not applicable to the focused item/state.
- Do not introduce new domain actions in this request; only reposition/reframe existing actions.

### UX/UI harmonization
- Align spacing, table row focus states, button grouping, form header/mode chips, and empty states with `Network Scope` quality level.
- Ensure responsive behavior:
  - side-by-side list/form on larger widths,
  - stacked layout on narrow widths.
- Keep keyboard accessibility consistent:
  - row focus,
  - enter/space activation,
  - focus-visible styling,
  - predictable tab order from list to action row to form.

## Acceptance criteria
- AC1: Each migrated list/form screen uses row focus as the primary context for edit/delete/select actions.
- AC2: Inline row action stacks and `Actions` columns are removed from migrated tables.
- AC3: Each migrated list has an under-list action row functionally equivalent to prior capabilities.
- AC4: Create/edit form behavior is consistent with Network Scope transitions and selection semantics.
- AC5: Existing search/filter/sort/density ergonomics remain functional and stable.
- AC6: Responsive behavior keeps list/form usable at narrow widths (stacking) and wide widths (side-by-side).
- AC7: Keyboard accessibility remains functional for row selection and action triggering.
- AC8: Domain behavior and data rules remain unchanged (no regressions in entity lifecycle logic).

## Non-functional requirements
- Keep component boundaries clear and avoid re-growing monolithic UI files.
- Preserve compatibility with quality gates:
  - `lint`
  - `typecheck`
  - `test:ci`
  - `test:e2e`
  - `quality:ui-modularization`
  - `quality:store-modularization`
- Avoid unnecessary visual churn outside the target list/form surfaces.

## Out of scope
- New domain capabilities (new lifecycle actions or schema changes).
- Major redesign of canvas interactions and inspector logic.
- Rewriting unrelated screens that do not expose list + create/edit form behavior.

# Backlog
- To create from this request:
  - `item_074_list_form_pattern_baseline_and_shared_interaction_contract.md`
  - `item_075_connectors_splices_list_action_row_and_form_alignment.md`
  - `item_076_nodes_segments_list_action_row_and_form_alignment.md`
  - `item_077_wires_list_action_row_and_form_alignment.md`
  - `item_078_actions_column_removal_and_focus_state_regression_coverage.md`
  - `item_079_responsive_accessibility_and_keyboard_consistency_pass.md`
  - `item_080_ui_regression_and_e2e_validation_for_harmonized_list_form_screens.md`

# References
- `src/app/components/workspace/NetworkScopeWorkspaceContent.tsx`
- `src/app/components/workspace/ModelingPrimaryTables.tsx`
- `src/app/components/workspace/ModelingSecondaryTables.tsx`
- `src/app/components/workspace/ModelingFormsColumn.tsx`
- `src/app/components/WorkspaceNavigation.tsx`
- `src/app/AppController.tsx`
- `src/app/styles/workspace.css`
- `src/app/styles/tables.css`
- `src/tests/app.ui.networks.spec.tsx`
- `src/tests/app.ui.list-ergonomics.spec.tsx`
- `src/tests/app.ui.navigation-canvas.spec.tsx`
