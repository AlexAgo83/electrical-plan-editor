## task_012_list_form_workspace_harmonization_orchestration_and_delivery_control - List/Form Workspace Harmonization Orchestration and Delivery Control
> From version: 0.4.0
> Understanding: 99%
> Confidence: 97%
> Progress: 0%
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
- [ ] 1. Deliver Wave 0 baseline contract: finalize shared list/form interaction model and reusable state semantics (`item_074`)
- [ ] 2. Deliver Wave 1 primary entity migration: connectors/splices action-row and form alignment (`item_075`)
- [ ] 3. Deliver Wave 2 structural entity migration: nodes/segments action-row and form alignment (`item_076`)
- [ ] 4. Deliver Wave 3 wire workflow migration: wire action-row and route-aware form alignment (`item_077`)
- [ ] 5. Deliver Wave 4 regression hardening: remove residual action columns and lock focused-row behavior coverage (`item_078`)
- [ ] 6. Deliver Wave 5 UX quality pass: responsive + keyboard accessibility consistency across migrated screens (`item_079`)
- [ ] 7. Deliver Wave 6 closure: full UI regression + E2E validation and AC traceability (`item_080`)
- [ ] FINAL: Update related Logics docs

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
  - Not started.
- Current blockers:
  - None at orchestration kickoff.
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
