## task_037_wire_creation_endpoint_occupancy_validation_and_next_free_way_port_prefill_orchestration_and_delivery_control - Wire Creation Endpoint Occupancy Validation and Next-Free Way/Port Prefill Orchestration and Delivery Control
> From version: 0.7.3
> Understanding: 99%
> Confidence: 97%
> Progress: 100%
> Complexity: High
> Theme: Delivery Orchestration for Wire Endpoint Occupancy-Aware Create Prefill and Manual-Input-Safe UX
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc.

# Context
Orchestration task for `req_037`. This task coordinates delivery of wire-form endpoint occupancy indication and next-free `way`/`port` suggestion used as create-mode prefill, with explicit guards to avoid overwriting manual user input.

Confirmed implementation decisions for this request:
- Feature applies symmetrically to both endpoints A and B.
- Next-free slot prefill is create-mode only.
- Occupancy indication is available in create and edit modes.
- Edit mode occupancy checks exclude the current wire assignment (no false positives on unchanged endpoints).
- No silent auto-correction on submit; form shows occupancy and suggestion while store/save validation remains the final guard.
- Endpoint-local touched guards prevent prefill from overwriting manual input; touched state resets when endpoint type/target changes.

Backlog scope covered:
- `item_225_wire_form_endpoint_occupancy_indicator_for_connector_ways_and_splice_ports.md`
- `item_226_wire_create_mode_next_free_way_port_prefill_with_manual_edit_guards.md`
- `item_227_shared_next_free_endpoint_slot_helpers_for_wire_form_prefill.md`
- `item_228_wire_endpoint_occupancy_and_prefill_regression_tests.md`
- `item_229_req_037_wire_endpoint_prefill_and_occupancy_validation_closure_ci_build_and_ac_traceability.md`

# Plan
- [ ] 1. Deliver Wave 0 shared endpoint-slot occupancy/next-free helpers (including edit exclusion support) (`item_227`)
- [ ] 2. Deliver Wave 1 wire-form endpoint occupancy indicator for A/B endpoints (create + edit current-wire exclusion) (`item_225`)
- [ ] 3. Deliver Wave 2 create-mode next-free way/port prefill with endpoint touched-guard behavior (`item_226`)
- [ ] 4. Deliver Wave 3 regression tests for occupancy indicators, create prefill, manual-input guards, and no-slot behavior (`item_228`)
- [ ] 5. Deliver Wave 4 closure: CI-equivalent validation, build, AC traceability, and Logics updates (`item_229`)
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
    - `src/tests/app.ui.creation-flow-ergonomics.spec.tsx`
    - helper unit tests (if extracted)
    - `src/tests/store.reducer.entities.spec.ts` (if occupancy/store interactions are touched)
  - `npm run test:ci`
- Build / delivery checks:
  - `npm run build`

# Report
- Wave status:
  - Wave 0 (shared helper logic): pending
  - Wave 1 (wire-form occupancy indicator): pending
  - Wave 2 (create-mode prefill + touched guards): pending
  - Wave 3 (regression tests): pending
  - Wave 4 (closure + AC traceability): pending
- Current blockers:
  - None at kickoff.
- Main risks to track:
  - Occupancy checks may diverge from store/save semantics if helper logic does not match existing occupancy rules.
  - Prefill effects can overwrite manual endpoint index edits if touched-guard state transitions are incomplete.
  - Edit-mode occupancy indicator may show false positives unless current wire exclusion is implemented consistently for both endpoints.
  - A/B endpoint symmetry can drift if logic is duplicated instead of structured/shared.
  - No-available-slot UX may confuse users if messaging and prefill state are inconsistent.
- Mitigation strategy:
  - Implement shared pure helpers before UI wiring and validate with unit tests.
  - Centralize endpoint occupancy/suggestion derivation in handler/view-model code to minimize duplicated A/B logic.
  - Add targeted UI regression coverage for touched-guard and edit exclusion paths early.
  - Keep submit/save validation unchanged while layering form-level indication and suggestion UX.
  - Define explicit no-slot UI messaging and test it.
- Validation snapshot (kickoff):
  - `python3 logics/skills/logics-doc-linter/scripts/logics_lint.py` ✅ (request + planning artifacts)
- Delivery snapshot:
  - Pending implementation.
- AC traceability (`req_037`) target mapping:
  - AC1 -> `item_227`, `item_225`, `item_228`, `item_229`
  - AC2 -> `item_227`, `item_226`, `item_228`, `item_229`
  - AC3 -> `item_227`, `item_226`, `item_228`, `item_229`
  - AC4 -> `item_226`, `item_228`, `item_229`
  - AC4a -> `item_225`, `item_226`, `item_228`, `item_229`
  - AC5 -> `item_225`, `item_226`, `item_228`, `item_229`
  - AC5a -> `item_227`, `item_225`, `item_228`, `item_229`
  - AC6 -> `item_227`, `item_228`, `item_229`

# References
- `logics/request/req_037_wire_creation_endpoint_occupancy_validation_and_next_free_way_port_prefill.md`
- `logics/backlog/item_225_wire_form_endpoint_occupancy_indicator_for_connector_ways_and_splice_ports.md`
- `logics/backlog/item_226_wire_create_mode_next_free_way_port_prefill_with_manual_edit_guards.md`
- `logics/backlog/item_227_shared_next_free_endpoint_slot_helpers_for_wire_form_prefill.md`
- `logics/backlog/item_228_wire_endpoint_occupancy_and_prefill_regression_tests.md`
- `logics/backlog/item_229_req_037_wire_endpoint_prefill_and_occupancy_validation_closure_ci_build_and_ac_traceability.md`
- `src/app/components/workspace/ModelingWireFormPanel.tsx`
- `src/app/hooks/useWireHandlers.ts`
- `src/app/hooks/useEntityFormsState.ts`
- `src/app/hooks/controller/useAppControllerModelingAnalysisScreenDomains.tsx`
- `src/app/hooks/validation/buildValidationIssues.ts`
- `src/store/types.ts`
- `src/tests/app.ui.navigation-canvas.spec.tsx`
- `src/tests/app.ui.creation-flow-ergonomics.spec.tsx`
- `.github/workflows/ci.yml`
- `package.json`

