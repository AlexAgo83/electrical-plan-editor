## task_012_list_form_workspace_harmonization_orchestration_and_delivery_control - List/Form Workspace Harmonization Orchestration and Delivery Control
> From version: 0.4.0
> Understanding: 100%
> Confidence: 98%
> Progress: 100%
> Complexity: High
> Theme: Cross-Screen List/Form UX Delivery
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc.

# Context
Orchestration task for list/form UX harmonization introduced by `req_013`. This task coordinates wave sequencing, dependency control, validation cadence, and delivery safety for migrating all list + create/edit form screens to the `Network Scope` interaction model.

Backlog scope covered:
- `item_074_list_form_pattern_baseline_and_shared_interaction_contract.md`
- `item_075_connectors_splices_list_action_row_and_form_alignment.md`
- `item_076_nodes_segments_list_action_row_and_form_alignment.md`
- `item_077_wires_list_action_row_and_form_alignment.md`
- `item_078_actions_column_removal_and_focus_state_regression_coverage.md`
- `item_079_responsive_accessibility_and_keyboard_consistency_pass.md`
- `item_080_ui_regression_and_e2e_validation_for_harmonized_list_form_screens.md`

# Plan
- [x] 1. Deliver Wave 0 baseline contract: finalize shared list/form interaction model and reusable state semantics (`item_074`)
- [x] 2. Deliver Wave 1 primary entity migration: connectors/splices action-row and form alignment (`item_075`)
- [x] 3. Deliver Wave 2 structural entity migration: nodes/segments action-row and form alignment (`item_076`)
- [x] 4. Deliver Wave 3 wire workflow migration: wire action-row and route-aware form alignment (`item_077`)
- [x] 5. Deliver Wave 4 regression hardening: remove residual action columns and lock focused-row behavior coverage (`item_078`)
- [x] 6. Deliver Wave 5 UX quality pass: responsive + keyboard accessibility consistency across migrated screens (`item_079`)
- [x] 7. Deliver Wave 6 closure: full UI regression + E2E validation and AC traceability (`item_080`)
- [x] FINAL: Update related Logics docs

# Validation
- `python3 logics/skills/logics-doc-linter/scripts/logics_lint.py`
- `npm run lint`
- `npm run typecheck`
- `npm run test:ci`
- `npm run test:e2e`
- `npm run quality:ui-modularization`
- `npm run quality:store-modularization`

# Report
- Wave status:
  - Wave 0 completed: aligned list/form interaction contract on `Network Scope` pattern (focused row, under-list action row, explicit create/edit transitions).
  - Wave 1 completed: migrated connectors/splices tables to focused-row interactions, removed inline action columns, added under-list action rows.
  - Wave 2 completed: migrated nodes/segments with the same action-row model and keyboard-accessible row activation.
  - Wave 3 completed: migrated wires list/actions to focused-row model while preserving route-aware behavior.
  - Wave 4 completed: removed residual inline actions and reinforced regression coverage around focused-row targeting and selection behavior.
  - Wave 5 completed: applied responsive action-row behavior and focus-visible/keyboard consistency updates.
  - Wave 6 completed: validated full UI regression + E2E flow alignment and AC closure for `req_013`.
- Current blockers:
  - `npm run quality:ui-modularization` remains failing on pre-existing baseline files over line budget:
    - `src/app/styles/workspace.css` (606 lines)
    - `src/app/styles/base.css` (561 lines)
- Main risks to track:
  - Behavior drift when replacing row-level action columns with focused-row under-list actions.
  - Inconsistent mode transitions (`create`/`edit`) across entity screens if migration waves are mixed.
  - Keyboard and focus regressions due to row activation and action-row/tab-order changes.
  - Responsive regressions when list/form/action-row layout is unified across multiple entities.
- Mitigation strategy:
  - Enforce strict wave sequencing from baseline contract to entity migration to regression closure.
  - Add focused-row and disabled-state test coverage immediately after each migration wave.
  - Run accessibility/responsive checks before final regression wave.
  - Keep full quality gates mandatory before closing request delivery.
- Validation snapshot:
  - `npm run typecheck` OK
  - `npm test -- src/tests/app.ui.navigation-canvas.spec.tsx src/tests/app.ui.inspector-shell.spec.tsx src/tests/app.ui.list-ergonomics.spec.tsx src/tests/app.ui.networks.spec.tsx` OK
  - `npm run lint` OK
  - `npm run quality:store-modularization` OK
  - `npm run quality:ui-modularization` KO (pre-existing line-budget baseline debt)
  - `npm run test:ci` OK
  - `npm run test:e2e` OK
