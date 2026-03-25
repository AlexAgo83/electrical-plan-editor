## task_088_req_109_new_and_edit_scroll_to_corresponding_form_panel_orchestration_and_delivery_control - Req 109 New/Edit scroll to corresponding form panel orchestration and delivery control
> From version: 1.4.2
> Status: Done
> Understanding: 100%
> Confidence: 97%
> Progress: 100%
> Complexity: Medium
> Theme: General
> Reminder: Update status/understanding/confidence/progress and dependencies/references when you edit this doc.
> Schema version: 1.0

# Context
- Request: `req_109_new_and_edit_actions_scroll_to_corresponding_form_panel`.
- Backlog anchors:
  - `item_534_shared_form_panel_scroll_helper_for_explicit_new_and_edit_actions`
  - `item_535_modeling_catalog_and_network_scope_new_edit_scroll_wiring`
  - `item_536_regression_tests_for_action_driven_scroll_to_create_and_edit_panels`
  - `item_537_req_109_validation_matrix_and_closure_traceability`

# Plan
- [x] 1. Introduce a shared helper for explicit action-driven scroll to the opened create/edit form panel
- [x] 2. Wire `New` and `Edit` flows in `Modeling`, `Catalog`, and `Network Scope` to the shared helper where forms render on the same page
- [x] 3. Add deterministic regression coverage for representative `New` and `Edit` scroll flows
- [x] 4. Validate non-regression of indirect-selection/canvas-origin no-auto-scroll behavior
- [x] 5. Generate a changelog entry in `changelogs/` using the project version current at task completion time
- [x] 6. Complete req_109 validation and traceability closure
- [x] FINAL: Update related Logics docs and synchronize statuses

# AC Traceability
- AC1 Proof: items `534` and `535`.
- AC2 Proof: items `535` and `536`.
- AC3 Proof: item `535`.
- AC4 Proof: items `534` and `536`.
- AC5 Proof: items `534` and `535`.
- AC6 Proof: items `535` and `536`.
- AC7 Proof: item `536`.

# Links
- Backlog item: `item_534_shared_form_panel_scroll_helper_for_explicit_new_and_edit_actions`
- Backlog item: `item_535_modeling_catalog_and_network_scope_new_edit_scroll_wiring`
- Backlog item: `item_536_regression_tests_for_action_driven_scroll_to_create_and_edit_panels`
- Backlog item: `item_537_req_109_validation_matrix_and_closure_traceability`
- Request(s): `req_109_new_and_edit_actions_scroll_to_corresponding_form_panel`

# Validation
- `python3 logics/skills/logics-doc-linter/scripts/logics_lint.py`
- `npm run -s lint`
- `npm run -s typecheck`
- `npm test -- --run src/tests/app.ui.creation-flow-ergonomics.spec.tsx src/tests/app.ui.catalog.spec.tsx src/tests/app.ui.networks.spec.tsx src/tests/app.ui.navigation-canvas.spec.tsx`
- `npm run -s build`

# Definition of Done (DoD)
- [x] Scope implemented and acceptance criteria covered.
- [x] A changelog file is generated in `changelogs/` using the project version current when the task is finished.
- [x] Validation commands executed and results captured.
- [x] Linked request/backlog/task docs updated.
- [x] Status is `Done` and progress is `100%`.

# Notes
- This task delivers intentional user-action scroll behavior only for `New` and `Edit` flows.
- The delivery must preserve the existing UX guardrail that indirect selection flows, especially canvas-origin selection sync, do not trigger disruptive viewport jumps.
- Tests should assert scroll intent deterministically and avoid relying on pixel-accurate layout behavior in jsdom.

# Report
- Delivered:
  - introduced a shared form-panel scroll helper for explicit `New` / `Edit` actions;
  - wired `Modeling`, `Catalog`, and `Network Scope` to the helper for in-page create/edit workflows;
  - preserved the no-scroll contract for row-click and indirect selection flows.
- Validation executed:
  - `npm test -- --run src/tests/app.ui.creation-flow-ergonomics.spec.tsx src/tests/app.ui.catalog.spec.tsx src/tests/app.ui.networks.spec.tsx`
  - `npm run -s lint`
  - `npm run -s typecheck`
  - `npm run -s build`
