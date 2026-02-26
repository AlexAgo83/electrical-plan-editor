## item_365_wire_entity_protection_metadata_contract_v1_fuse_kind_and_required_reference_validation - Wire entity protection metadata contract V1 (`fuse`) and required catalog association validation
> From version: 0.9.8
> Understanding: 95%
> Confidence: 92%
> Progress: 0%
> Complexity: Medium-High
> Theme: Wire domain model extension and validation for protection metadata
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
The wire entity cannot currently express protection semantics, so users cannot mark a wire as a fuse or enforce a required associated catalog manufacturer reference.

# Scope
- In:
  - Extend wire domain data contract with optional `protection` metadata using an extensible shape (`kind` discriminant), with V1 locked storage shape `wire.protection?: { kind: "fuse"; catalogItemId: CatalogItemId }`.
  - Implement V1 `fuse` support with required catalog-item association validation (`manufacturerReference` comes from linked catalog item).
  - Block catalog-item deletion when the item is referenced by one or more fuse-mode wires.
  - Preserve existing wire endpoint/route/technical ID validation behavior.
  - Ensure invalid/partial protection payloads are not persisted when fuse mode is disabled.
  - Preserve backward compatibility for existing wires without protection metadata.
- Out:
  - Wire form controls and UI wiring (handled in `item_366`)
  - UI visibility in wire tables/analysis (handled in `item_367`)
  - Regression coverage additions (handled in `item_368`)

# Acceptance criteria
- `Wire` supports optional protection metadata with V1 `kind: "fuse"`.
- V1 fuse storage shape uses `wire.protection.catalogItemId` (linked catalog item identity).
- Save/update validation rejects fuse wires with missing/invalid catalog association.
- Catalog item deletion is rejected when that item is referenced by a fuse-mode wire.
- Non-fuse wires continue to save as before with no protection payload requirement.
- Legacy wires without protection metadata remain valid.

# Priority
- Impact: High.
- Urgency: High.

# Notes
- Dependencies: `req_067`.
- Blocks: `item_366`, `item_367`, `item_368`, `task_065`.
- Related AC: AC1, AC2, AC3, AC5.
- References:
  - `logics/request/req_067_wire_protection_metadata_v1_fuse_kind_with_required_reference.md`
  - `src/core/entities.ts`
  - `src/store/catalog.ts`
  - `src/store/reducer/wireReducer.ts`
  - `src/store/index.ts`
