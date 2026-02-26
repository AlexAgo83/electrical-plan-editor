## task_065_req_067_wire_protection_metadata_v1_fuse_kind_with_required_reference_orchestration_and_delivery_control - req_067 Wire protection metadata V1 (`fuse`) with required catalog manufacturer reference orchestration and delivery control
> From version: 0.9.8
> Understanding: 97% (V1 scope adds extensible wire-level protection metadata with `fuse` as first kind and a required linked catalog manufacturer reference when enabled)
> Confidence: 91% (feature touches wire entity + form + visibility + compatibility, but remains localized if BOM pricing integration stays out of scope)
> Progress: 0%
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
- [ ] 1. Implement wire domain model/reducer validation and compatibility foundation (`item_365`)
- [ ] 2. Add wire form fuse-mode controls and required catalog-selection UX (`item_366`)
- [ ] 3. Surface fuse metadata in wire-focused UI and verify persistence/export boundary non-regressions (`item_367`)
- [ ] 4. Add regression coverage for fuse mode, required catalog-association validation, deletion guard, and legacy compatibility (`item_368`)
- [ ] 5. Run targeted wire/persistence validation suites and fix regressions
- [ ] 6. Run final validation matrix
- [ ] FINAL: Update related `logics` docs (request/backlog/task progress + delivery summary)

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
  - Wire reducer validation changes accidentally reject valid non-fuse wires.
  - Catalog deletion guard creates unintended regressions in existing catalog item delete flows and messaging.
  - Form-state changes leak partial protection payloads on save/cancel transitions.
  - UI visibility choices increase table clutter or break existing wire sort/filter ergonomics.
  - Persistence compatibility handling breaks legacy payload imports lacking `protection`.
  - Fuse metadata expansion drifts into full BOM pricing scope and delays delivery.
- Delivery notes:
  - Keep V1 centered on `wire.protection.kind = "fuse"` + required linked catalog item (`manufacturerReference` sourced from catalog); defer broader protection-device modeling.
  - Keep UI V1 explicit and low-risk: `Fuse` checkbox + unfiltered active-network catalog selection.
  - Treat BOM/CSV as a compatibility/non-regression boundary in V1, not a pricing integration objective.
  - Prefer additive schema changes and legacy-safe normalization paths.

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
