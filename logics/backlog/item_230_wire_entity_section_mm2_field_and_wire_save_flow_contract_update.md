## item_230_wire_entity_section_mm2_field_and_wire_save_flow_contract_update - Wire Entity `sectionMm2` Field and Wire Save-Flow Contract Update
> From version: 0.7.3
> Understanding: 99%
> Confidence: 97%
> Progress: 0%
> Complexity: High
> Theme: Wire Domain Model Contract Upgrade for Cable Section in mm²
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
`Wire` entities currently do not store cable section. Without a first-class numeric field (e.g. `sectionMm2`), wire creation/edit flows cannot persist this domain attribute and downstream code must rely on implicit assumptions.

# Scope
- In:
  - Extend `Wire` entity contract with numeric `sectionMm2`.
  - Update wire action payloads/save paths (`saveWire`, `wire/upsert` usages) to carry and persist `sectionMm2`.
  - Update wire reducer validation to require a finite positive section value (`> 0`) where applicable.
  - Ensure existing wire route/length/endpoint behavior is preserved after contract change.
  - Audit core serialization/type usage sites touched by `Wire` type changes.
- Out:
  - Wire form field UX and create/edit prefill behavior (handled in item_231).
  - Settings preference for default wire section (handled in item_232).
  - Legacy persistence/import patching (handled in item_233).
  - Broad display/export rollout of wire section beyond compatibility fixes.

# Acceptance criteria
- `Wire` includes a persisted numeric `sectionMm2` field across store/domain contracts.
- Wire save/upsert flows require/populate `sectionMm2`.
- Invalid wire section values (`<= 0`, non-finite) are rejected safely without partial wire corruption.
- Existing wire endpoint/routing semantics remain functional after contract update.

# Priority
- Impact: High.
- Urgency: High.

# Notes
- Dependencies: `req_038`.
- Blocks: item_231, item_233, item_234.
- Related AC: AC1, AC2, AC5, AC7.
- References:
  - `logics/request/req_038_wire_cable_section_mm2_field_default_preference_and_backward_compat_patch.md`
  - `src/core/entities.ts`
  - `src/store/actions.ts`
  - `src/store/reducer/wireReducer.ts`
  - `src/store/types.ts`
  - `src/tests/store.reducer.entities.spec.ts`

