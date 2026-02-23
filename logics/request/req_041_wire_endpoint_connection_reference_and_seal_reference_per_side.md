## req_041_wire_endpoint_connection_reference_and_seal_reference_per_side - Wire Endpoint Connection Reference and Seal Reference (Per Side)
> From version: 0.7.3
> Understanding: 96%
> Confidence: 94%
> Complexity: High
> Theme: Per-Endpoint Wire Termination Metadata for Connection and Seal References
> Reminder: Update Understanding/Confidence and dependencies/references when you edit this doc.

# Needs
- Add an optional **connection reference** for each side of a wire.
- Add an optional **seal reference** for each side of a wire.
- The fields must be optional independently on each side (`A` and `B`).
- The feature must preserve existing wire endpoint/routing behavior.

# Context
The current wire model describes endpoint topology (`endpointA`, `endpointB`), route, and other wire attributes, but it does not store termination/component references per wire side (e.g. connection/contact reference and seal reference).

The requested feature introduces per-side wire termination metadata so each end of a wire can carry real-world part references for:
- the connection/terminal component used on that side,
- the seal/joint used on that side.

This is distinct from the wire-level attributes (`technicalId`, section, colors, etc.) because the references are attached to each endpoint side (`A` and `B`), not to the wire globally.

## Implementation decisions (baseline proposal)
- The feature adds **per-side optional flat fields** for both wire sides:
  - `endpointAConnectionReference` (optional)
  - `endpointASealReference` (optional)
  - `endpointBConnectionReference` (optional)
  - `endpointBSealReference` (optional)
- Each field is free-text and optional.
- Fields should be independently editable/clearable (e.g. connection ref present, seal ref absent).
- Applicability baseline: fields are available for both endpoint types (`connectorCavity` and `splicePort`).
- Trim normalization is recommended (`empty/whitespace-only -> undefined`).
- Max length guardrail: `120` characters per field.
- No uniqueness requirement is imposed for these references.
- Scope baseline is form-first (wire create/edit form support required; broader display/export/search enhancements optional unless trivial).
- Endpoint-type changes should preserve already-entered per-side references (non-destructive behavior).
- Wire form UI should group these fields by side (recommended):
  - Side A metadata: connection reference + seal reference
  - Side B metadata: connection reference + seal reference

## Open product decision to confirm during implementation
- No blocking product decision remains for endpoint-type applicability in this request baseline: fields apply generically to both endpoint types.
- If a future request wants endpoint-type restrictions (e.g. connector-only seal references), it should be introduced as an explicit UX/business-rule refinement.

## Objectives
- Add explicit per-side termination reference fields to wires.
- Keep the data model compatible with future BOM/export/component-traceability work.
- Preserve backward compatibility for existing saves/imports with no endpoint reference fields.
- Keep wire form UX clear and non-disruptive.

## Functional Scope
### A. Wire domain model: per-side connection/seal references (high priority)
- Extend `Wire` with optional per-side metadata fields for sides A and B:
  - connection reference (A/B)
  - seal reference (A/B)
- Persist values through wire save/upsert flows.
- Keep wire routing/endpoint topology semantics unchanged.
- Recommended normalization:
  - free-text accepted
  - trim whitespace
  - empty -> `undefined`
  - max length `120`

### B. Wire form UI/handlers: create + edit support for per-side references (high priority)
- Add inputs to wire form for endpoint-side references:
  - Side A connection reference
  - Side A seal reference
  - Side B connection reference
  - Side B seal reference
- Create mode:
  - all fields default empty
- Edit mode:
  - existing values load and can be edited/cleared
- Preserve current wire create/edit behavior for existing fields (endpoints, technical ID, routing, section/color if present).
- Keep validation lightweight (optional free text) unless product constraints are specified later.
- Validation/normalization baseline:
  - free-text
  - trim
  - empty -> `undefined`
  - max length `120`
- UI organization recommendation:
  - group fields by side (`A` and `B`) to avoid confusion with existing endpoint topology inputs

### C. Endpoint-type UX behavior (medium-high priority)
- Define UI behavior when endpoint types change (`connectorCavity` vs `splicePort`):
  - baseline for this request: fields remain available generically per side for both endpoint types
- Endpoint-type change behavior:
  - preserve already-entered per-side connection/seal references when endpoint type changes (non-destructive)
- If future conditional UI is introduced, value preservation/clearing rules must be specified in that future scope.

### D. Persistence/import backward compatibility (high priority)
- Patch/migrate loaded/imported data so legacy wires without per-side connection/seal references remain valid.
- Legacy behavior baseline:
  - missing fields normalize to absent/empty (`undefined`/null-equivalent per chosen representation)
  - old saves/imports continue to load successfully
- Apply compatibility handling across:
  - local persistence restore
  - file import / portability normalization paths (if separate)

### E. Display/export/search audit (medium priority)
- Minimum requirement:
  - adding the fields must not regress existing wire tables/inspectors/exports
- Optional (if trivial and low-risk):
  - show per-side connection/seal refs in wire details/inspector/table
  - include in search/filter/export output
- Any additions beyond core wire form + persistence support should be documented as explicit scope decisions.

### F. Regression tests (high priority)
- Add targeted tests covering:
  - wire create/edit persists side A/B connection/seal references
  - clearing endpoint-side references works
  - legacy save/import without new fields still loads correctly
  - endpoint-type behavior (if conditional UI/normalization rules are implemented)
- Add/extend UI/store/persistence tests as needed.

## Non-functional requirements
- Preserve existing wire endpoint/routing and save behavior.
- Maintain backward compatibility for pre-feature saves/imports.
- Keep per-side reference semantics clear and independent of wire-level metadata.
- Avoid unnecessary constraints (no uniqueness requirement).

## Validation and regression safety
- Targeted tests (minimum, depending on implementation):
  - wire form UI tests
  - store/reducer wire lifecycle tests
  - persistence/import compatibility tests
- Closure validation (recommended):
  - `python3 logics/skills/logics-doc-linter/scripts/logics_lint.py`
  - `npm run lint`
  - `npm run typecheck`
  - `npm run test:ci`
  - `npm run build`

## Acceptance criteria
- AC1: `Wire` supports optional per-side connection and seal references for both side A and side B.
- AC2: Wire create/edit form allows entering, editing, and clearing per-side connection/seal references.
- AC3: Empty per-side reference values are allowed and persist as empty/absent values consistently.
- AC3a: Per-side references accept free text with trim normalization and a `120`-character maximum guardrail.
- AC4: Existing wire workflows remain functional after per-side reference fields are added.
- AC5: Legacy saves/imports without the new fields continue to load successfully.
- AC6: Regression tests cover create/edit/clear behavior and legacy compatibility.
- AC7: Per-side references remain available for both endpoint types and are preserved when endpoint types change.

## Out of scope
- Enforcing uniqueness of connection/seal references.
- External validation against terminal/seal catalogs.
- Advanced rule engines tying allowed seal/connection refs to connector cavity definitions.
- Full BOM/export redesign (though this data may support future export work).

# Backlog
- `logics/backlog/item_245_wire_per_side_connection_and_seal_reference_entity_contract_and_save_flow_updates.md`
- `logics/backlog/item_246_wire_form_side_a_side_b_connection_and_seal_reference_inputs_create_edit_clear_flow.md`
- `logics/backlog/item_247_wire_endpoint_reference_legacy_persistence_import_compatibility_patch.md`
- `logics/backlog/item_248_wire_endpoint_connection_seal_reference_regression_tests.md`
- `logics/backlog/item_249_req_041_wire_endpoint_connection_and_seal_reference_closure_ci_build_and_ac_traceability.md`

# References
- `src/core/entities.ts`
- `src/store/actions.ts`
- `src/store/reducer/wireReducer.ts`
- `src/app/hooks/useWireHandlers.ts`
- `src/app/components/workspace/ModelingWireFormPanel.tsx`
- `src/app/hooks/useEntityFormsState.ts`
- `src/adapters/persistence/migrations.ts`
- `src/adapters/persistence/localStorage.ts`
- `src/adapters/portability/networkFile.ts`
- `src/tests/store.reducer.entities.spec.ts`
- `src/tests/persistence.localStorage.spec.ts`
- `src/tests/portability.network-file.spec.ts`
- `src/tests/app.ui.creation-flow-ergonomics.spec.tsx`
