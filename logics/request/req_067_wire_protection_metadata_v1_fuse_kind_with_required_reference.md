## req_067_wire_protection_metadata_v1_fuse_kind_with_required_reference - Wire protection metadata V1 with fuse kind and required catalog manufacturer reference
> From version: 0.9.8
> Understanding: 98% (user clarified that the required fuse reference means the catalog `manufacturerReference`, not a separate functional tag like `F1`)
> Confidence: 92% (scope is tractable if kept to wire-level metadata + validation/UI visibility without full protection-device refactor)
> Complexity: Medium-High
> Theme: Wire modeling extensibility / protection semantics / validation ergonomics
> Reminder: Update Understanding/Confidence and dependencies/references when you edit this doc.

# Needs
- Users want to represent a fuse-like bridge using the existing wire workflow (including same-connector loopback cases, e.g. one cavity to another cavity on the same connector).
- When a wire is used as a fuse, it must be associated with a catalog reference (the catalog item's `manufacturerReference`) so the protection element is identifiable in the workspace.
- The solution should avoid locking the data model into a fuse-only design, so future protection devices (ex: breakers) remain possible.

# Context
Current wire modeling supports endpoint pairs as long as the two endpoints are different and routable. This already allows a wire to connect:
- two different connectors/splices
- or two different cavities/ports on the same component (if valid and free)

However, the wire entity has no explicit protection semantics today:
- no fuse/protection marker
- no required fuse catalog reference association
- no dedicated visibility in wire-focused UI

A V1 wire-level protection metadata model is a pragmatic bridge:
- fast to implement on top of current wire workflows
- compatible with existing save/cancel semantics
- extensible if future versions introduce a dedicated `ProtectionDevice` entity

# Objective
- Add a V1 wire-level protection metadata contract with `fuse` as the first supported protection kind.
- Require a catalog-backed manufacturer reference association when a wire is marked as a fuse.
- Surface fuse metadata in wire workflows (create/edit/list/analysis) without breaking existing wire behavior.
- Keep the data shape extensible for future protection kinds.

# Functional scope
## A. Wire data model contract (high priority)
- Extend `Wire` with optional protection metadata (locked naming for V1) linked to catalog identity.
- V1 requires a persisted link to a catalog item for fuse-mode wires.
- V1 storage shape is locked:
  - `wire.protection?: { kind: "fuse"; catalogItemId: CatalogItemId }`
- `manufacturerReference` is sourced from the linked catalog item (`CatalogItem.manufacturerReference`) and is not a separate free-text wire field in V1.
- V1 supported protection kinds:
  - `fuse` only
- `protection` remains optional:
  - absent => normal wire behavior
  - present with `kind: "fuse"` => fuse semantics enabled for that wire
- Backward compatibility:
  - existing persisted wires without `protection` remain valid and load normally

## B. Validation and normalization contract (high priority)
- When `wire.protection.kind === "fuse"`:
  - `protection.catalogItemId` is required
  - the referenced catalog item must exist in the active network catalog
  - the linked catalog item must expose a valid non-empty `manufacturerReference`
- Catalog deletion guard (V1, locked):
  - deleting a catalog item referenced by one or more fuse-mode wires must be blocked with a clear error message (no broken fuse links created by deletion)
- Existing wire validation must remain intact:
  - endpoint difference rules
  - endpoint occupancy rules
  - route validity / lock-route behavior
  - technical ID validation behavior
- V1 does not require a unique fuse manufacturer reference across wires (multiple wires may legitimately link to the same catalog item).
- V1 should avoid persisting partial/invalid protection payloads:
  - if fuse mode is disabled in form draft, protection metadata is removed from saved wire payload

## C. Wire create/edit form UX (high priority)
- Add fuse/protection controls in the wire form (`Create` and `Edit`):
  - a control to enable fuse mode (`checkbox`, V1 locked)
  - conditional required catalog-item selection for fuse mode (displaying the catalog `manufacturerReference`)
- Catalog selection policy (V1, locked):
  - all active-network catalog items are selectable (no fuse-specific catalog filtering in V1)
- V1 field policy (locked):
  - no dedicated `Rating (A)` field yet (users can encode caliber manually in the wire name if needed)
- Form semantics:
  - fuse-mode edits are draft-only until `Save`
  - `Cancel edit` restores persisted wire state as usual
  - non-protection wire fields remain unaffected by toggling fuse mode except explicit user edits

## D. Visibility in wire-focused UI (medium-high priority)
- Surface fuse state in wire-facing UI so the metadata is not hidden after save:
  - wire table/list (ex: badge/tag and linked catalog `manufacturerReference`)
  - wire analysis/details panel
- V1 visibility can be lightweight (badge `Fuse` + catalog manufacturer reference text) and does not require a new dedicated protection screen.
- 2D render/callout fuse-specific iconography is optional and may be deferred if it expands scope.

## E. Persistence, import/export boundaries, and BOM/CSV stance (medium priority)
- Preserve `wire.protection` metadata through existing app persistence flows (local save/load and file import/export payloads if applicable).
- Maintain backward compatibility with legacy payloads lacking protection metadata.
- V1 BOM/CSV stance (locked):
  - no mandatory pricing/BOM integration for fuse wires in `Network Summary` BOM export (current BOM flow is catalog-backed and should not regress)
  - if low-cost wire CSV/list exports exist or are added, fuse metadata columns are recommended follow-up work, not required by this request
- No regression to existing catalog CSV import/export or network summary BOM CSV export workflows.

## F. Topology semantics and constraints (medium priority)
- V1 does not enforce a strict topology rule that fuse wires must connect within the same connector.
- Allowed cases remain governed by normal wire endpoint/routing validation:
  - same connector / different cavity is allowed if valid and routable
  - different components remain allowed
- A stricter fuse-topology policy (ex: same connector only) is out of scope for V1 and can be introduced later if needed.

## G. Regression coverage (high priority)
- Add regression coverage for:
  - create/edit wire form fuse mode toggle visibility and conditional catalog selection behavior
  - required catalog association validation when fuse mode is enabled
  - save/cancel semantics with fuse metadata drafts
  - persisted wire protection metadata rendering in list/analysis UI
  - catalog item deletion blocked when referenced by a fuse-mode wire
  - backward compatibility loading for wires without `protection`
  - non-regression of normal wires and existing wire validation rules

# Non-functional requirements
- The V1 implementation should keep the protection model extensible (favor `protection.kind` over fuse-only booleans).
- Existing wire workflows must remain performant and predictable.
- The feature should not introduce hidden coupling to unrelated catalog/BOM pricing logic in V1.

# Validation and regression safety
- Add/extend tests for wire form validation, persistence compatibility, and UI visibility.
- Run full validation pipeline after implementation (`lint`, `typecheck`, `quality:*`, `build`, `test:ci`, `test:e2e`, `logics_lint`).

# Acceptance criteria
- AC1: A wire can optionally carry a V1 protection payload with `kind: "fuse"`.
- AC2: When fuse mode is enabled, the wire must be linked to a valid catalog item (whose `manufacturerReference` is then used as the fuse reference).
- AC3: Existing wire endpoint/route validation and save/cancel semantics remain non-regressed.
- AC3a: Deleting a catalog item referenced by a fuse-mode wire is blocked in V1 (no dangling fuse catalog links).
- AC4: Fuse metadata is visible after save in wire-focused UI (list and/or analysis surfaces defined by implementation).
- AC5: Legacy wires without protection metadata remain loadable and editable.
- AC6: Existing catalog CSV and network summary BOM CSV flows remain non-regressed.

# Out of scope
- Dedicated `ProtectionDevice` entity and standalone protection management screen.
- Full protection engineering rules (selectivity, cable ampacity checks, breaker curves, pole count semantics).
- Mandatory priced BOM integration for fuse wires in the existing catalog-backed BOM export.
- Enforcing a strict fuse topology rule (same-connector only) in V1.

# Backlog
- `logics/backlog/item_365_wire_entity_protection_metadata_contract_v1_fuse_kind_and_required_reference_validation.md`
- `logics/backlog/item_366_wire_form_fuse_mode_controls_conditional_reference_inputs_and_save_cancel_semantics.md`
- `logics/backlog/item_367_wire_fuse_metadata_visibility_and_persistence_compatibility_across_wire_workflows.md`
- `logics/backlog/item_368_regression_coverage_for_wire_fuse_mode_required_reference_and_legacy_compatibility.md`

# Orchestration task
- `logics/tasks/task_065_req_067_wire_protection_metadata_v1_fuse_kind_with_required_reference_orchestration_and_delivery_control.md`

# References
- `src/core/entities.ts`
- `src/store/catalog.ts`
- `src/store/reducer/wireReducer.ts`
- `src/app/hooks/useWireHandlers.ts`
- `src/app/components/workspace/ModelingWireFormPanel.tsx`
- `src/app/components/workspace/ModelingSecondaryTables.tsx`
- `src/app/components/workspace/AnalysisWireWorkspacePanels.tsx`
- `src/app/AppController.tsx`
- `src/tests/app.ui.creation-flow-wire-endpoint-refs.spec.tsx`
- `logics/request/req_066_global_undo_redo_history_for_modeling_and_catalog_mutations.md`
