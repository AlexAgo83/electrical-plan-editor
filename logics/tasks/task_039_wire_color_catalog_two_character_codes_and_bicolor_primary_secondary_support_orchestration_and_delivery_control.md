## task_039_wire_color_catalog_two_character_codes_and_bicolor_primary_secondary_support_orchestration_and_delivery_control - Wire Color Catalog (2-Character Codes) and Bi-Color Primary/Secondary Support Orchestration and Delivery Control
> From version: 0.7.3
> Understanding: 99%
> Confidence: 97%
> Progress: 0%
> Complexity: High
> Theme: Delivery Orchestration for Canonical Wire Colors, Optional Bi-Color Modeling, and Legacy Compatibility
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc.

# Context
Orchestration task for `req_039`. This task coordinates delivery of a canonical wire color catalog (2-character IDs + English labels + hex swatches), optional wire color modeling (`No color`, mono-color, bi-color), wire form selectors/swatches, and backward-compatible normalization of legacy data that predates wire colors.

Confirmed implementation decisions for this request:
- Canonical wire color catalog v1 target size is 20 colors.
- Catalog entries use stable 2-character IDs, English labels, and hex swatch values.
- Wire color is optional overall (`primaryColorId` and `secondaryColorId` nullable).
- Valid states:
  - no color (`null/null`)
  - mono-color (`primary != null`, `secondary = null`)
  - bi-color (`primary != null`, `secondary != null`)
- Invalid state `secondary` without `primary` must be rejected/normalized safely.
- Duplicate bi-color (`primary===secondary`) should normalize to mono-color (`secondary=null`) (preferred behavior).
- New wire creation defaults to `No color` (`null/null`).
- Wire form secondary selector is disabled when primary color is `None`.
- Legacy saves/imports without wire colors normalize to `null/null` (no invented default color).
- Catalog is canonical app-owned and not user-editable in this request.

Backlog scope covered:
- `item_235_canonical_wire_color_catalog_with_two_character_codes_labels_and_hex_swatch_values.md`
- `item_236_wire_entity_primary_secondary_color_ids_and_wire_save_reducer_contract_updates.md`
- `item_237_wire_form_primary_secondary_color_selectors_with_swatch_indicators_and_optional_secondary.md`
- `item_238_legacy_wire_color_backward_compat_patch_for_persistence_import_and_portability_paths.md`
- `item_239_req_039_wire_color_catalog_bicolor_support_and_compatibility_closure_ci_build_and_ac_traceability.md`

# Plan
- [ ] 1. Deliver Wave 0 canonical wire color catalog v1 + lookup helpers + catalog invariants (`item_235`)
- [ ] 2. Deliver Wave 1 wire domain contract updates for primary/secondary color IDs + reducer save normalization (`item_236`)
- [ ] 3. Deliver Wave 2 wire form primary/secondary color selectors with swatches and `No color` UX (`item_237`)
- [ ] 4. Deliver Wave 3 legacy persistence/import/portability compatibility patch for missing wire colors (`item_238`)
- [ ] 5. Deliver Wave 4 closure: regression validation, CI-equivalent checks, build, AC traceability, and Logics updates (`item_239`)
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
    - `src/tests/app.ui.navigation-canvas.spec.tsx`
    - `src/tests/persistence.localStorage.spec.ts`
    - `src/tests/portability.network-file.spec.ts`
    - helper/unit tests for catalog lookups/validation (if added)
  - `npm run test:ci`
- Build / delivery checks:
  - `npm run build`

# Report
- Wave status:
  - Wave 0 (catalog v1 + helpers): pending
  - Wave 1 (wire contract + reducer normalization): pending
  - Wave 2 (wire form selectors + swatches + no-color UX): pending
  - Wave 3 (legacy compatibility patch): pending
  - Wave 4 (closure + AC traceability): pending
- Current blockers:
  - None at kickoff.
- Main risks to track:
  - Catalog IDs/labels may be changed ad hoc during implementation, risking unstable persisted semantics.
  - Wire contract changes can ripple into fixtures/tests and reducer payloads more broadly than expected.
  - UI form logic may permit invalid state (`secondary` without `primary`) unless constraints are enforced in both UI and reducer.
  - Duplicate bi-color (`primary===secondary`) may behave inconsistently between form and reducer unless normalization is centralized.
  - Legacy import/persistence paths may be patched in one path but missed in another.
- Mitigation strategy:
  - Define/freeze catalog v1 early with tests for IDs and lookups.
  - Normalize invalid/duplicate color combinations in reducer save path and mirror UX constraints in form.
  - Default create-mode form state explicitly to `No color`.
  - Audit local persistence and portability normalization paths explicitly and cover both with tests.
  - Keep labels/hex resolved from catalog only; store color IDs on wires.
- Validation snapshot (kickoff):
  - `python3 logics/skills/logics-doc-linter/scripts/logics_lint.py` ✅ (request + planning artifacts)
- Delivery snapshot:
  - Pending implementation.
- AC traceability (`req_039`) target mapping:
  - AC1 -> `item_235`, `item_239`
  - AC2 -> `item_236`, `item_239`
  - AC3 -> `item_237`, `item_239`
  - AC4 -> `item_236`, `item_237`, `item_239`
  - AC4a -> `item_236`, `item_237`, `item_238`, `item_239`
  - AC4b -> `item_236`, `item_237`, `item_238`, `item_239`
  - AC5 -> `item_235`, `item_236`, `item_237`, `item_239`
  - AC6 -> `item_238`, `item_239`
  - AC7 -> `item_235`, `item_238`, `item_239`
  - AC8 -> `item_235`, `item_236`, `item_237`, `item_238`, `item_239`

# References
- `logics/request/req_039_wire_color_catalog_two_character_codes_and_bicolor_primary_secondary_support.md`
- `logics/backlog/item_235_canonical_wire_color_catalog_with_two_character_codes_labels_and_hex_swatch_values.md`
- `logics/backlog/item_236_wire_entity_primary_secondary_color_ids_and_wire_save_reducer_contract_updates.md`
- `logics/backlog/item_237_wire_form_primary_secondary_color_selectors_with_swatch_indicators_and_optional_secondary.md`
- `logics/backlog/item_238_legacy_wire_color_backward_compat_patch_for_persistence_import_and_portability_paths.md`
- `logics/backlog/item_239_req_039_wire_color_catalog_bicolor_support_and_compatibility_closure_ci_build_and_ac_traceability.md`
- `src/core/entities.ts`
- `src/store/actions.ts`
- `src/store/reducer/wireReducer.ts`
- `src/app/hooks/useWireHandlers.ts`
- `src/app/components/workspace/ModelingWireFormPanel.tsx`
- `src/adapters/persistence/migrations.ts`
- `src/adapters/portability/networkFile.ts`
- `src/tests/store.reducer.entities.spec.ts`
- `src/tests/app.ui.creation-flow-ergonomics.spec.tsx`
- `src/tests/app.ui.navigation-canvas.spec.tsx`
- `src/tests/persistence.localStorage.spec.ts`
- `src/tests/portability.network-file.spec.ts`
- `.github/workflows/ci.yml`
- `package.json`

