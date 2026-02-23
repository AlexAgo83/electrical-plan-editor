## task_034_creation_form_auto_technical_id_suggestions_and_connector_splice_auto_node_creation_orchestration_and_delivery_control - Creation Form Auto Technical ID Suggestions and Connector/Splice Auto-Node Creation Orchestration and Delivery Control
> From version: 0.7.3
> Understanding: 99%
> Confidence: 97%
> Progress: 0%
> Complexity: Medium
> Theme: Delivery Orchestration for Creation Flow Ergonomics and Graph Bootstrap Automation
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc.

# Context
Orchestration task for `req_034`. This task coordinates delivery of two user-feedback-driven creation workflow improvements:
- automatic `Technical ID` suggestions/prefill in create forms (initially connector/splice),
- automatic node creation for new connectors/splices so they are immediately represented in the network graph.

The work also requires careful handling of partial failure cases and preservation of recent post-create focus/selection UX behavior.

Backlog scope covered:
- `item_203_create_form_technical_id_suggestion_strategy_and_shared_next_available_id_helpers.md`
- `item_204_connector_and_splice_create_form_technical_id_prefill_wiring_without_overwriting_manual_edits.md`
- `item_205_connector_creation_auto_generates_linked_connector_node_with_valid_unique_node_id.md`
- `item_206_splice_creation_auto_generates_linked_splice_node_with_valid_unique_node_id.md`
- `item_207_auto_node_creation_failure_handling_atomicity_or_compensation_and_user_feedback.md`
- `item_208_post_create_selection_focus_and_form_mode_coherence_with_auto_generated_nodes.md`
- `item_209_creation_flow_regression_tests_for_id_suggestions_and_connector_splice_auto_node_bootstrap.md`
- `item_210_req_034_creation_flow_ergonomics_closure_ci_e2e_build_pwa_and_ac_traceability.md`

# Plan
- [ ] 1. Deliver Wave 0 shared next-available `Technical ID` suggestion helpers and strategy (`item_203`)
- [ ] 2. Deliver Wave 1 connector/splice create-form `Technical ID` prefill wiring (no overwrite of manual edits) (`item_204`)
- [ ] 3. Deliver Wave 2 connector creation auto-node bootstrap (linked connector node) (`item_205`)
- [ ] 4. Deliver Wave 3 splice creation auto-node bootstrap (linked splice node) (`item_206`)
- [ ] 5. Deliver Wave 4 failure handling/atomicity or compensation for auto-node creation + user feedback (`item_207`)
- [ ] 6. Deliver Wave 5 post-create selection/focus/form coherence verification and adjustments (`item_208`)
- [ ] 7. Deliver Wave 6 regression tests for ID suggestions + auto-node creation bootstrap (`item_209`)
- [ ] 8. Deliver Wave 7 closure: CI-equivalent validation, AC traceability, and Logics updates (`item_210`)
- [ ] FINAL: Update related Logics docs (request/task/backlog progress + delivery summary)

# Validation
- Documentation / Logics:
  - `python3 logics/skills/logics-doc-linter/scripts/logics_lint.py`
- Static analysis / compile safety:
  - `npm run lint`
  - `npm run typecheck`
  - `npm run quality:ui-modularization`
  - `npm run quality:store-modularization`
- Automated tests:
  - Targeted runs during implementation (recommended):
    - `src/tests/app.ui.navigation-canvas.spec.tsx`
    - `src/tests/store.reducer.entities.spec.ts`
    - additional create-form UI tests if touched
  - `npm run test:ci`
- End-to-end tests:
  - `npm run test:e2e`
- Build / delivery checks:
  - `npm run build`
  - `npm run quality:pwa`

# Report
- Wave status:
  - Wave 0 (ID suggestion helpers/strategy): pending
  - Wave 1 (create-form prefill wiring): pending
  - Wave 2 (connector auto-node creation): pending
  - Wave 3 (splice auto-node creation): pending
  - Wave 4 (failure handling / atomicity-compensation): pending
  - Wave 5 (post-create UX coherence): pending
  - Wave 6 (regression tests): pending
  - Wave 7 (closure + AC traceability): pending
- Current blockers:
  - None at kickoff.
- Main risks to track:
  - ID suggestion logic may produce surprising values with non-standard existing technical IDs.
  - Create-form prefill may overwrite user edits if effect timing is not guarded.
  - Auto-node creation can introduce partial-success states (entity created, node missing) without explicit handling.
  - Auto-generated nodes may interfere with recent post-create focus/form-mode behavior and selection synchronization.
  - Reducer/history semantics may complicate atomic multi-entity creation flows.
- Mitigation strategy:
  - Implement and test pure ID suggestion helpers before UI wiring.
  - Gate prefill behavior to new create sessions and avoid effect-driven overwrites after manual input.
  - Define explicit failure policy (atomic or compensated) before finalizing auto-node creation flows.
  - Add targeted UI/store regression coverage for create flows and post-create focus/selection behavior.
- Validation snapshot (kickoff):
  - `python3 logics/skills/logics-doc-linter/scripts/logics_lint.py` ✅ (request + planning artifacts)
- Delivery snapshot:
  - Pending implementation.
- AC traceability (`req_034`) target mapping:
  - AC1 -> `item_203`, `item_204`, `item_209`, `item_210`
  - AC2 -> `item_203`, `item_204`, `item_209`, `item_210`
  - AC3 -> `item_204`, `item_209`, `item_210`
  - AC4 -> `item_205`, `item_207`, `item_208`, `item_209`, `item_210`
  - AC5 -> `item_206`, `item_207`, `item_208`, `item_209`, `item_210`
  - AC6 -> `item_205`, `item_206`, `item_208`, `item_209`, `item_210`
  - AC7 -> `item_207`, `item_209`, `item_210`
  - AC8 -> `item_204`, `item_208`, `item_209`, `item_210`

# References
- `logics/request/req_034_creation_form_auto_technical_id_suggestions_and_connector_splice_auto_node_creation.md`
- `logics/backlog/item_203_create_form_technical_id_suggestion_strategy_and_shared_next_available_id_helpers.md`
- `logics/backlog/item_204_connector_and_splice_create_form_technical_id_prefill_wiring_without_overwriting_manual_edits.md`
- `logics/backlog/item_205_connector_creation_auto_generates_linked_connector_node_with_valid_unique_node_id.md`
- `logics/backlog/item_206_splice_creation_auto_generates_linked_splice_node_with_valid_unique_node_id.md`
- `logics/backlog/item_207_auto_node_creation_failure_handling_atomicity_or_compensation_and_user_feedback.md`
- `logics/backlog/item_208_post_create_selection_focus_and_form_mode_coherence_with_auto_generated_nodes.md`
- `logics/backlog/item_209_creation_flow_regression_tests_for_id_suggestions_and_connector_splice_auto_node_bootstrap.md`
- `logics/backlog/item_210_req_034_creation_flow_ergonomics_closure_ci_e2e_build_pwa_and_ac_traceability.md`
- `src/app/hooks/useConnectorHandlers.ts`
- `src/app/hooks/useSpliceHandlers.ts`
- `src/app/hooks/useNodeHandlers.ts`
- `src/app/components/workspace/ModelingConnectorFormPanel.tsx`
- `src/app/components/workspace/ModelingSpliceFormPanel.tsx`
- `src/app/components/workspace/ModelingPrimaryTables.tsx`
- `src/app/hooks/useEntityFormsState.ts`
- `src/store/actions.ts`
- `src/store/reducer/connectorReducer.ts`
- `src/store/reducer/spliceReducer.ts`
- `src/store/reducer/nodeReducer.ts`
- `src/tests/app.ui.navigation-canvas.spec.tsx`
- `src/tests/store.reducer.entities.spec.ts`
- `.github/workflows/ci.yml`
- `package.json`
