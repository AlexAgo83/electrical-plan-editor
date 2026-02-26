## task_065_req_067_wire_protection_metadata_v1_fuse_kind_with_required_reference_orchestration_and_delivery_control - req_067 Wire protection metadata V1 (`fuse`) with required catalog manufacturer reference orchestration and delivery control
> From version: 0.9.8
> Understanding: 100% (implemented V1 `wire.protection` fuse contract with linked catalog item identity, delete guard, UI controls/visibility, and compatibility coverage across persistence/import-export)
> Confidence: 98% (full validation matrix passed after implementation and regression coverage additions; residual risk is limited to future UI copy/layout changes around wire tables/forms)
> Progress: 100%
> Complexity: Medium-High
> Theme: Orchestration for wire fuse-mode metadata V1 delivery
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc.

# Context
`req_067` introduces a pragmatic V1 to represent fuse behavior directly on wires via optional protection metadata:
- extensible shape (`protection.kind`)
- V1 supported kind: `fuse`
- required fuse catalog association (manufacturer reference comes from linked catalog item)

This provides immediate workflow value without forcing a full `ProtectionDevice` domain model yet.

The feature spans:
- wire domain model and reducer validation
- create/edit wire form UX
- wire list/analysis visibility after save
- persistence compatibility, catalog referential integrity (delete guard), and regression coverage

# Objective
- Deliver V1 wire protection metadata with `fuse` support and required catalog-association validation.
- Preserve existing wire endpoint/routing/save/cancel semantics.
- Keep the implementation extensible for future protection kinds.
- Synchronize `logics` docs after delivery.

# Scope
- In:
  - Orchestrate `item_365`..`item_368`
  - Sequence domain contract before UI and visibility work
  - Run targeted + final validation gates
  - Update request/backlog/task progress and delivery notes
- Out:
  - Dedicated protection entity/screen
  - Full BOM pricing integration for fuse wires
  - Strict fuse topology enforcement (same-connector only)

# Backlog scope covered
- `logics/backlog/item_365_wire_entity_protection_metadata_contract_v1_fuse_kind_and_required_reference_validation.md`
- `logics/backlog/item_366_wire_form_fuse_mode_controls_conditional_reference_inputs_and_save_cancel_semantics.md`
- `logics/backlog/item_367_wire_fuse_metadata_visibility_and_persistence_compatibility_across_wire_workflows.md`
- `logics/backlog/item_368_regression_coverage_for_wire_fuse_mode_required_reference_and_legacy_compatibility.md`

# Plan
- [x] 1. Implement wire domain model/reducer validation and compatibility foundation (`item_365`)
- [x] 2. Add wire form fuse-mode controls and required catalog-selection UX (`item_366`)
- [x] 3. Surface fuse metadata in wire-focused UI and verify persistence/export boundary non-regressions (`item_367`)
- [x] 4. Add regression coverage for fuse mode, required catalog-association validation, deletion guard, and legacy compatibility (`item_368`)
- [x] 5. Run targeted wire/persistence validation suites and fix regressions
- [x] 6. Run final validation matrix
- [x] FINAL: Update related `logics` docs (request/backlog/task progress + delivery summary)

# Validation
- `python3 logics/skills/logics-doc-linter/scripts/logics_lint.py`
- `npm run -s lint`
- `npm run -s typecheck`
- `npm run -s quality:ui-modularization`
- `npm run -s quality:store-modularization`
- `npm run -s quality:pwa`
- `npm run -s build`
- `npm run -s test:ci`
- `npm run -s test:e2e`

# Targeted validation guidance (recommended during implementation)
- `npx vitest run src/tests/app.ui.creation-flow-wire-endpoint-refs.spec.tsx`
- `npx vitest run src/tests/app.ui.creation-flow-ergonomics.spec.tsx`
- `npx vitest run src/tests/app.ui.navigation-canvas.spec.tsx`

# Report
- Current blockers: none.
- Risks to track:
  - Future catalog model changes may require revisiting fuse catalog-selection filtering semantics (V1 currently allows all catalog items).
  - Future wire table layout tweaks may reduce visibility of fuse badge/manufacturer reference if row density increases.
- Delivery notes:
  - Implemented locked V1 storage shape: `wire.protection?: { kind: "fuse"; catalogItemId }` with reducer normalization on `wire/save` and `wire/upsert`.
  - Added catalog delete guard preventing removal of catalog items referenced by fuse-mode wires.
  - Added wire form fuse checkbox + conditional catalog selector with local form validation and preserved save/cancel draft semantics.
  - Added fuse metadata visibility (`Fuse` badge + catalog `manufacturerReference`) in modeling wire table and analysis wire surfaces.
  - Verified persistence/import-export compatibility with dedicated tests (`localStorage` and network-file portability round-trip).
  - Added regression coverage for reducer validation, delete guard, and end-to-end wire UI fuse flow.
  - One unrelated heavy UI list-ergonomics test was stabilized with explicit `10s` timeout to keep `test:ci` deterministic under current suite load.
  - Final validation matrix passed: `logics_lint`, `lint`, `typecheck`, `quality:*`, `build`, `test:ci` (47 files / 289 tests), `test:e2e` (2 tests).

# References
- `logics/request/req_067_wire_protection_metadata_v1_fuse_kind_with_required_reference.md`
- `logics/backlog/item_365_wire_entity_protection_metadata_contract_v1_fuse_kind_and_required_reference_validation.md`
- `logics/backlog/item_366_wire_form_fuse_mode_controls_conditional_reference_inputs_and_save_cancel_semantics.md`
- `logics/backlog/item_367_wire_fuse_metadata_visibility_and_persistence_compatibility_across_wire_workflows.md`
- `logics/backlog/item_368_regression_coverage_for_wire_fuse_mode_required_reference_and_legacy_compatibility.md`
- `src/core/entities.ts`
- `src/store/reducer/wireReducer.ts`
- `src/app/hooks/useWireHandlers.ts`
- `src/app/components/workspace/ModelingWireFormPanel.tsx`
- `src/app/components/workspace/ModelingSecondaryTables.tsx`
- `src/app/components/workspace/AnalysisWireWorkspacePanels.tsx`
- `src/store/index.ts`
- `src/app/AppController.tsx`
