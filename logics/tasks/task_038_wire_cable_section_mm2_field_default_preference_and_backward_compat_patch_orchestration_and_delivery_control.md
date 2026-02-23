## task_038_wire_cable_section_mm2_field_default_preference_and_backward_compat_patch_orchestration_and_delivery_control - Wire Cable Section (mm²) Field, Default Preference, and Backward-Compat Patch Orchestration and Delivery Control
> From version: 0.7.3
> Understanding: 99%
> Confidence: 97%
> Progress: 0%
> Complexity: High
> Theme: Delivery Orchestration for Wire `sectionMm2`, Create Prefill Defaults, and Legacy Save Compatibility
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc.

# Context
Orchestration task for `req_038`. This task coordinates delivery of an explicit wire cable section field (`sectionMm2`) across the domain model, wire form, global default preference in Settings, and backward-compatible persistence/import normalization for legacy data.

Confirmed implementation decisions for this request:
- Wire cable section field name is `sectionMm2`.
- Wire section is a per-wire editable numeric value (create + edit).
- Validation baseline is finite positive number (`> 0`) with no upper bound in this request.
- Default wire section is a global user/UI preference (not per-network).
- The default preference is used to prefill the wire section field during new wire creation only.
- Changing the default preference affects future wire creation only and must not mutate existing wires.
- Legacy wires missing section must normalize to compatibility fallback `0.5` during load/import, independent of current user preference.
- Scope baseline requires wire form support; broader table/inspector/export display is optional unless trivial and explicitly included.

Backlog scope covered:
- `item_230_wire_entity_section_mm2_field_and_wire_save_flow_contract_update.md`
- `item_231_wire_form_section_mm2_input_create_edit_validation_and_default_prefill.md`
- `item_232_settings_default_wire_section_preference_persistence_and_normalization.md`
- `item_233_legacy_wire_section_backward_compat_patch_for_persistence_and_import_paths.md`
- `item_234_req_038_wire_section_mm2_default_preference_and_compatibility_closure_ci_build_and_ac_traceability.md`

# Plan
- [ ] 1. Deliver Wave 0 wire domain contract update (`sectionMm2`) and save-flow validation wiring (`item_230`)
- [ ] 2. Deliver Wave 1 settings default wire-section preference persistence + normalization (`item_232`)
- [ ] 3. Deliver Wave 2 wire form `Section (mm²)` create/edit support with default prefill and validation (`item_231`)
- [ ] 4. Deliver Wave 3 legacy persistence/import compatibility patch for missing wire section (`item_233`)
- [ ] 5. Deliver Wave 4 closure: regression validation, CI-equivalent checks, build, AC traceability, and Logics updates (`item_234`)
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
    - `src/tests/app.ui.settings.spec.tsx`
    - `src/tests/persistence.localStorage.spec.ts`
    - `src/tests/portability.network-file.spec.ts`
  - `npm run test:ci`
- Build / delivery checks:
  - `npm run build`

# Report
- Wave status:
  - Wave 0 (wire domain contract + save flow): pending
  - Wave 1 (settings default preference): pending
  - Wave 2 (wire form create/edit + prefill + validation): pending
  - Wave 3 (legacy compatibility patch/load-import normalization): pending
  - Wave 4 (closure + AC traceability): pending
- Current blockers:
  - None at kickoff.
- Main risks to track:
  - `Wire` type contract changes may ripple into reducer actions, fixtures, and tests in more places than expected.
  - Wire form numeric parsing (`mm²`) can produce UX ambiguity if invalid/locale-formatted input is not normalized consistently.
  - Settings preference wiring may be added but not fully threaded into wire create-mode prefill.
  - Legacy import/persistence paths may normalize wires through different code paths and miss one compatibility patch.
  - Backward compatibility behavior can become inconsistent if legacy fallback uses current user settings instead of constant `0.5`.
- Mitigation strategy:
  - Land domain contract changes first and let compiler/test failures reveal integration touchpoints.
  - Keep wire section parsing/validation centralized in wire form handler logic with explicit tests.
  - Wire the settings preference into create-mode prefill with targeted UI tests before closure.
  - Audit both local persistence migration and portability import normalization paths explicitly.
  - Enforce constant legacy fallback `0.5` in compatibility patch code and tests.
- Validation snapshot (kickoff):
  - `python3 logics/skills/logics-doc-linter/scripts/logics_lint.py` ✅ (request + planning artifacts)
- Delivery snapshot:
  - Pending implementation.
- AC traceability (`req_038`) target mapping:
  - AC1 -> `item_230`, `item_231`, `item_234`
  - AC2 -> `item_230`, `item_231`, `item_234`
  - AC3 -> `item_232`, `item_231`, `item_234`
  - AC4 -> `item_232`, `item_234`
  - AC5 -> `item_232`, `item_231`, `item_234`
  - AC6 -> `item_233`, `item_234`
  - AC7 -> `item_230`, `item_233`, `item_234`
  - AC8 -> `item_230`, `item_231`, `item_232`, `item_233`, `item_234`

# References
- `logics/request/req_038_wire_cable_section_mm2_field_default_preference_and_backward_compat_patch.md`
- `logics/backlog/item_230_wire_entity_section_mm2_field_and_wire_save_flow_contract_update.md`
- `logics/backlog/item_231_wire_form_section_mm2_input_create_edit_validation_and_default_prefill.md`
- `logics/backlog/item_232_settings_default_wire_section_preference_persistence_and_normalization.md`
- `logics/backlog/item_233_legacy_wire_section_backward_compat_patch_for_persistence_and_import_paths.md`
- `logics/backlog/item_234_req_038_wire_section_mm2_default_preference_and_compatibility_closure_ci_build_and_ac_traceability.md`
- `src/core/entities.ts`
- `src/store/actions.ts`
- `src/store/reducer/wireReducer.ts`
- `src/app/hooks/useWireHandlers.ts`
- `src/app/components/workspace/ModelingWireFormPanel.tsx`
- `src/app/hooks/useUiPreferences.ts`
- `src/app/components/workspace/SettingsWorkspaceContent.tsx`
- `src/adapters/persistence/migrations.ts`
- `src/adapters/portability/networkFile.ts`
- `src/tests/store.reducer.entities.spec.ts`
- `src/tests/app.ui.settings.spec.tsx`
- `src/tests/app.ui.creation-flow-ergonomics.spec.tsx`
- `src/tests/persistence.localStorage.spec.ts`
- `src/tests/portability.network-file.spec.ts`
- `.github/workflows/ci.yml`
- `package.json`

