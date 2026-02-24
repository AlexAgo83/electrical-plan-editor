## task_036_node_id_editability_via_atomic_node_rename_and_reference_remap_orchestration_and_delivery_control - Node ID Editability via Atomic Node Rename and Reference Remap Orchestration and Delivery Control
> From version: 0.7.3
> Understanding: 99%
> Confidence: 97%
> Progress: 100%
> Complexity: High
> Theme: Delivery Orchestration for Safe Node ID Editing with Atomic Store Rename and UI State Coherence
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc.

# Context
Orchestration task for `req_036`. This task coordinates delivery of safe `Node ID` editability in Node edit mode by introducing an atomic store-level rename action and wiring the UI submit flow to use it without breaking graph references or history semantics.

Confirmed implementation decisions for this request:
- `Node ID` editing means a true rename of `node.id` (primary identifier).
- Rename failures must be user-visible in Node form inline error UX while preserving reducer/store guard errors (`ui.lastError`).
- Local UI states storing raw `nodeId` values (e.g. route preview selections) should be remapped automatically to preserve context.
- Scope is limited to `nodeId` editability only (no connector/splice/segment/wire ID rename support).

Backlog scope covered:
- `item_220_atomic_node_rename_store_action_and_reducer_reference_remap_for_node_ids.md`
- `item_221_node_edit_form_enables_node_id_input_and_rename_submit_orchestration.md`
- `item_222_local_ui_node_id_state_sync_or_safe_reset_after_node_rename.md`
- `item_223_node_id_rename_regression_tests_for_reducer_and_ui_edit_mode_flow.md`
- `item_224_req_036_node_id_editability_closure_ci_build_and_ac_traceability.md`

# Plan
- [ ] 1. Deliver Wave 0 atomic `node/rename` store action + reducer reference remap + root reducer wiring (`item_220`)
- [ ] 2. Deliver Wave 1 Node form editability + rename submit orchestration + inline error UX (`item_221`)
- [ ] 3. Deliver Wave 2 local UI node-ID state remap (route preview and other audited local states) (`item_222`)
- [ ] 4. Deliver Wave 3 regression tests for reducer/UI/local-state rename behavior (`item_223`)
- [ ] 5. Deliver Wave 4 closure: CI-equivalent validation, build, AC traceability, and Logics updates (`item_224`)
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
    - `src/tests/store.reducer.entities.spec.ts`
    - `src/tests/app.ui.navigation-canvas.spec.tsx`
    - `src/tests/app.ui.creation-flow-ergonomics.spec.tsx` (if Node form edit orchestration coverage lands here)
  - `npm run test:ci`
- Build / delivery checks:
  - `npm run build`

# Report
- Wave status:
  - Wave 0 (atomic store action + reducer remap): pending
  - Wave 1 (Node form editability + rename orchestration + inline error UX): pending
  - Wave 2 (local UI node-ID state remap): pending
  - Wave 3 (regression tests): pending
  - Wave 4 (closure + AC traceability): pending
- Current blockers:
  - None at kickoff.
- Main risks to track:
  - Atomic rename may miss a store-held node reference path (segments/positions/selection coverage must be exhaustive).
  - UI submit orchestration may produce inconsistent local form state if rename succeeds but subsequent upsert fails.
  - Inline form error wiring may diverge from store error guard behavior if not normalized consistently after dispatch.
  - Local UI state remap can be missed in screen-level state holders outside the store.
  - History semantics may fragment if rename is implemented as multiple tracked actions.
- Mitigation strategy:
  - Implement reducer rename as a single domain action before UI wiring.
  - Add targeted reducer tests early for remap invariants and collision/no-op behavior.
  - Keep UI submit flow explicit about rename step result and post-rename `editingNodeId` updates.
  - Audit local node-ID state holders before finalizing UI integration and add at least one regression test.
  - Prefer one tracked action for rename and mark auxiliary UI sync actions as non-history where appropriate.
- Validation snapshot (kickoff):
  - `python3 logics/skills/logics-doc-linter/scripts/logics_lint.py` ✅ (request + planning artifacts)
- Delivery snapshot:
  - Pending implementation.
- AC traceability (`req_036`) target mapping:
  - AC1 -> `item_221`, `item_223`, `item_224`
  - AC2 -> `item_220`, `item_221`, `item_223`, `item_224`
  - AC3 -> `item_220`, `item_223`, `item_224`
  - AC4 -> `item_220`, `item_221`, `item_223`, `item_224`
  - AC5 -> `item_220`, `item_221`, `item_223`, `item_224`
  - AC5a -> `item_221`, `item_223`, `item_224`
  - AC6 -> `item_220`, `item_221`, `item_224`
  - AC7 -> `item_220`, `item_221`, `item_224`
  - AC8 -> `item_222`, `item_223`, `item_224`
  - AC9 -> `item_223`, `item_224`

# References
- `logics/request/req_036_node_id_editability_via_atomic_node_rename_and_reference_remap.md`
- `logics/backlog/item_220_atomic_node_rename_store_action_and_reducer_reference_remap_for_node_ids.md`
- `logics/backlog/item_221_node_edit_form_enables_node_id_input_and_rename_submit_orchestration.md`
- `logics/backlog/item_222_local_ui_node_id_state_sync_or_safe_reset_after_node_rename.md`
- `logics/backlog/item_223_node_id_rename_regression_tests_for_reducer_and_ui_edit_mode_flow.md`
- `logics/backlog/item_224_req_036_node_id_editability_closure_ci_build_and_ac_traceability.md`
- `src/store/actions.ts`
- `src/store/reducer.ts`
- `src/store/reducer/nodeReducer.ts`
- `src/app/components/workspace/ModelingNodeFormPanel.tsx`
- `src/app/hooks/useNodeHandlers.ts`
- `src/app/AppController.tsx`
- `src/app/hooks/useAppControllerCanvasDisplayState.ts`
- `src/app/components/network-summary/NetworkRoutePreviewPanel.tsx`
- `src/tests/store.reducer.entities.spec.ts`
- `src/tests/app.ui.navigation-canvas.spec.tsx`
- `.github/workflows/ci.yml`
- `package.json`

