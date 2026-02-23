## task_041_wire_endpoint_connection_reference_and_seal_reference_per_side_orchestration_and_delivery_control - Wire Endpoint Connection Reference and Seal Reference (Per Side) Orchestration and Delivery Control
> From version: 0.7.3
> Understanding: 99%
> Confidence: 97%
> Progress: 0%
> Complexity: High
> Theme: Delivery Orchestration for Per-Side Wire Termination Metadata with Legacy Compatibility
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc.

# Context
Orchestration task for `req_041`. This task coordinates delivery of optional per-side wire termination metadata (connection reference + seal reference for sides A and B), including wire form support, save-flow persistence, and legacy persistence/import compatibility.

Confirmed implementation decisions for this request:
- Use flat per-side wire fields:
  - `endpointAConnectionReference`
  - `endpointASealReference`
  - `endpointBConnectionReference`
  - `endpointBSealReference`
- Fields are optional, free-text, non-unique.
- Applicability is generic for both endpoint types (`connectorCavity` and `splicePort`).
- Normalization: trim, empty => `undefined`, max length `120`.
- Wire form is grouped by side (A/B metadata sections) to reduce confusion.
- Endpoint-type changes preserve already-entered per-side references (non-destructive behavior).
- Scope baseline is form-first; broader display/export/search additions are optional if trivial.
- Legacy saves/imports missing the new fields must remain loadable without invented values.

Backlog scope covered:
- `item_245_wire_per_side_connection_and_seal_reference_entity_contract_and_save_flow_updates.md`
- `item_246_wire_form_side_a_side_b_connection_and_seal_reference_inputs_create_edit_clear_flow.md`
- `item_247_wire_endpoint_reference_legacy_persistence_import_compatibility_patch.md`
- `item_248_wire_endpoint_connection_seal_reference_regression_tests.md`
- `item_249_req_041_wire_endpoint_connection_and_seal_reference_closure_ci_build_and_ac_traceability.md`

# Plan
- [ ] 1. Deliver Wave 0 wire entity/save-flow support for per-side connection/seal references (`item_245`)
- [ ] 2. Deliver Wave 1 wire form side A/B metadata inputs with create/edit/clear and non-destructive endpoint-type changes (`item_246`)
- [ ] 3. Deliver Wave 2 legacy persistence/import compatibility patch for missing endpoint reference fields (`item_247`)
- [ ] 4. Deliver Wave 3 regression tests for normalization, UI behavior, endpoint-type preservation, and compatibility (`item_248`)
- [ ] 5. Deliver Wave 4 closure: validation, CI-equivalent checks, build, AC traceability, and Logics updates (`item_249`)
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
    - `src/tests/app.ui.creation-flow-ergonomics.spec.tsx`
    - `src/tests/persistence.localStorage.spec.ts`
    - `src/tests/portability.network-file.spec.ts`
  - `npm run test:ci`
- Build / delivery checks:
  - `npm run build`

# Report
- Wave status:
  - Wave 0 (wire contract + save flow): pending
  - Wave 1 (wire form side A/B metadata UX): pending
  - Wave 2 (legacy compatibility patch): pending
  - Wave 3 (regression tests): pending
  - Wave 4 (closure + AC traceability): pending
- Current blockers:
  - None at kickoff.
- Main risks to track:
  - Wire form state/handler changes may become cluttered due to added per-side fields unless grouped clearly.
  - Normalization behavior (`trim`, empty => `undefined`, max length) may diverge between form and reducer if duplicated.
  - Endpoint-type change preservation can regress if form reset logic unintentionally clears side metadata.
  - Legacy compatibility patch may be added in one load/import path but missed in another.
- Mitigation strategy:
  - Add per-side fields in a structured/grouped form section and keep naming explicit.
  - Reuse shared normalization helpers/patterns where practical.
  - Add targeted UI regression coverage for endpoint-type changes preserving metadata.
  - Audit local persistence migration and portability import normalization paths explicitly.
- Validation snapshot (kickoff):
  - `python3 logics/skills/logics-doc-linter/scripts/logics_lint.py` ✅ (request + planning artifacts)
- Delivery snapshot:
  - Pending implementation.
- AC traceability (`req_041`) target mapping:
  - AC1 -> `item_245`, `item_249`
  - AC2 -> `item_246`, `item_248`, `item_249`
  - AC3 -> `item_245`, `item_246`, `item_247`, `item_248`, `item_249`
  - AC3a -> `item_245`, `item_246`, `item_248`, `item_249`
  - AC4 -> `item_245`, `item_246`, `item_249`
  - AC5 -> `item_247`, `item_248`, `item_249`
  - AC6 -> `item_248`, `item_249`
  - AC7 -> `item_246`, `item_248`, `item_249`

# References
- `logics/request/req_041_wire_endpoint_connection_reference_and_seal_reference_per_side.md`
- `logics/backlog/item_245_wire_per_side_connection_and_seal_reference_entity_contract_and_save_flow_updates.md`
- `logics/backlog/item_246_wire_form_side_a_side_b_connection_and_seal_reference_inputs_create_edit_clear_flow.md`
- `logics/backlog/item_247_wire_endpoint_reference_legacy_persistence_import_compatibility_patch.md`
- `logics/backlog/item_248_wire_endpoint_connection_seal_reference_regression_tests.md`
- `logics/backlog/item_249_req_041_wire_endpoint_connection_and_seal_reference_closure_ci_build_and_ac_traceability.md`
- `src/core/entities.ts`
- `src/store/actions.ts`
- `src/store/reducer/wireReducer.ts`
- `src/app/hooks/useWireHandlers.ts`
- `src/app/components/workspace/ModelingWireFormPanel.tsx`
- `src/app/hooks/useEntityFormsState.ts`
- `src/adapters/persistence/migrations.ts`
- `src/adapters/portability/networkFile.ts`
- `src/tests/store.reducer.entities.spec.ts`
- `src/tests/app.ui.creation-flow-ergonomics.spec.tsx`
- `src/tests/persistence.localStorage.spec.ts`
- `src/tests/portability.network-file.spec.ts`
- `.github/workflows/ci.yml`
- `package.json`

