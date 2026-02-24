## task_040_optional_manufacturer_reference_for_connectors_and_splices_orchestration_and_delivery_control - Optional Manufacturer Reference for Connectors and Splices Orchestration and Delivery Control
> From version: 0.7.3
> Understanding: 99%
> Confidence: 97%
> Progress: 100%
> Complexity: Medium-High
> Theme: Delivery Orchestration for Optional Connector/Splice Manufacturer References with Legacy Compatibility
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc.

# Context
Orchestration task for `req_040`. This task coordinates delivery of an optional `manufacturerReference` field on connector/splice entities (component library entities), including form support, persistence/import compatibility, and regression coverage.

Confirmed implementation decisions for this request:
- Field name is `manufacturerReference`.
- Field is added to `Connector` and `Splice` entities (not `NetworkNode`).
- Field is optional and non-unique.
- Duplicates are allowed without warning.
- Field accepts free text (no strict regex validation in this request).
- Normalization: trim whitespace, empty/whitespace-only => `undefined`.
- Max length guardrail is `120` characters.
- UI label is `Manufacturer reference`.
- Scope baseline is form-first (connector/splice create/edit forms required; broader display/search optional if trivial).
- Legacy saves/imports missing the field must remain loadable without invented defaults.

Backlog scope covered:
- `item_240_connector_splice_manufacturer_reference_entity_contract_and_reducer_updates.md`
- `item_241_connector_and_splice_form_manufacturer_reference_input_create_edit_clear_flow.md`
- `item_242_connector_splice_manufacturer_reference_legacy_persistence_import_compatibility_patch.md`
- `item_243_connector_splice_manufacturer_reference_regression_tests.md`
- `item_244_req_040_manufacturer_reference_for_connectors_and_splices_closure_ci_build_and_ac_traceability.md`

# Plan
- [ ] 1. Deliver Wave 0 connector/splice entity contract + reducer/action support for `manufacturerReference` (`item_240`)
- [ ] 2. Deliver Wave 1 connector/splice form `Manufacturer reference` inputs with create/edit/clear flow and normalization guards (`item_241`)
- [ ] 3. Deliver Wave 2 legacy persistence/import compatibility patch for missing `manufacturerReference` (`item_242`)
- [ ] 4. Deliver Wave 3 regression tests for form/store/compatibility behavior (`item_243`)
- [ ] 5. Deliver Wave 4 closure: validation, CI-equivalent checks, build, AC traceability, and Logics updates (`item_244`)
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
  - Wave 0 (entity contract + reducers/actions): pending
  - Wave 1 (form create/edit/clear UX): pending
  - Wave 2 (legacy compatibility patch): pending
  - Wave 3 (regression tests): pending
  - Wave 4 (closure + AC traceability): pending
- Current blockers:
  - None at kickoff.
- Main risks to track:
  - Connector/splice reducer/form normalization may diverge on trim/empty handling unless centralized.
  - Max-length guard behavior may be enforced in UI but not in reducer (or vice versa), causing inconsistent results.
  - Legacy compatibility patch may be applied in local persistence path but missed in portability import path.
  - Optional display/search enhancements can create scope creep beyond the form-first baseline.
- Mitigation strategy:
  - Define normalization behavior (`trim`, empty => `undefined`, max `120`) once and reuse where practical.
  - Add targeted reducer/UI tests for clear + trim edge cases early.
  - Audit both persistence migration and portability import normalization paths explicitly.
  - Treat table/inspector/search enhancements as optional and document scope decisions in closure.
- Validation snapshot (kickoff):
  - `python3 logics/skills/logics-doc-linter/scripts/logics_lint.py` ✅ (request + planning artifacts)
- Delivery snapshot:
  - Pending implementation.
- AC traceability (`req_040`) target mapping:
  - AC1 -> `item_240`, `item_244`
  - AC2 -> `item_241`, `item_243`, `item_244`
  - AC3 -> `item_240`, `item_241`, `item_242`, `item_243`, `item_244`
  - AC4 -> `item_240`, `item_243`, `item_244`
  - AC4a -> `item_240`, `item_243`, `item_244`
  - AC5 -> `item_240`, `item_241`, `item_244`
  - AC5a -> `item_240`, `item_241`, `item_243`, `item_244`
  - AC6 -> `item_242`, `item_243`, `item_244`
  - AC7 -> `item_243`, `item_244`

# References
- `logics/request/req_040_optional_manufacturer_reference_for_connectors_and_splices.md`
- `logics/backlog/item_240_connector_splice_manufacturer_reference_entity_contract_and_reducer_updates.md`
- `logics/backlog/item_241_connector_and_splice_form_manufacturer_reference_input_create_edit_clear_flow.md`
- `logics/backlog/item_242_connector_splice_manufacturer_reference_legacy_persistence_import_compatibility_patch.md`
- `logics/backlog/item_243_connector_splice_manufacturer_reference_regression_tests.md`
- `logics/backlog/item_244_req_040_manufacturer_reference_for_connectors_and_splices_closure_ci_build_and_ac_traceability.md`
- `src/core/entities.ts`
- `src/store/actions.ts`
- `src/store/reducer/connectorReducer.ts`
- `src/store/reducer/spliceReducer.ts`
- `src/app/hooks/useConnectorHandlers.ts`
- `src/app/hooks/useSpliceHandlers.ts`
- `src/app/components/workspace/ModelingConnectorFormPanel.tsx`
- `src/app/components/workspace/ModelingSpliceFormPanel.tsx`
- `src/adapters/persistence/migrations.ts`
- `src/adapters/portability/networkFile.ts`
- `src/tests/store.reducer.entities.spec.ts`
- `src/tests/app.ui.creation-flow-ergonomics.spec.tsx`
- `src/tests/persistence.localStorage.spec.ts`
- `src/tests/portability.network-file.spec.ts`
- `.github/workflows/ci.yml`
- `package.json`

