## item_245_wire_per_side_connection_and_seal_reference_entity_contract_and_save_flow_updates - Wire Per-Side Connection/Seal Reference Entity Contract and Save-Flow Updates
> From version: 0.7.3
> Understanding: 99%
> Confidence: 97%
> Progress: 0%
> Complexity: High
> Theme: Wire Domain Contract Upgrade for Per-Side Termination References
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
`Wire` entities do not currently support per-side termination metadata. Without explicit fields for side A/B connection and seal references, users cannot persist endpoint-side component references.

# Scope
- In:
  - Extend `Wire` with optional flat per-side fields:
    - `endpointAConnectionReference`
    - `endpointASealReference`
    - `endpointBConnectionReference`
    - `endpointBSealReference`
  - Update wire save/upsert action payloads and reducers to persist these fields.
  - Apply normalization rules:
    - free-text accepted
    - trim whitespace
    - empty/whitespace-only -> `undefined`
    - max length `120`
  - Preserve wire endpoint topology/routing semantics.
  - Keep references valid for both endpoint types (`connectorCavity` and `splicePort`) without endpoint-type restriction logic.
- Out:
  - Wire form UI inputs and grouping by side (handled in item_246).
  - Legacy persistence/import compatibility patching (handled in item_247).
  - Broader display/export/search enhancements.

# Acceptance criteria
- `Wire` contract supports the four optional per-side connection/seal reference fields.
- Wire save/edit flows persist normalized values for those fields.
- Empty values normalize consistently to absent/`undefined`.
- Existing wire endpoint/routing behavior is not regressed.

# Priority
- Impact: High.
- Urgency: High.

# Notes
- Dependencies: `req_041`.
- Blocks: item_246, item_247, item_248, item_249.
- Related AC: AC1, AC3, AC3a, AC4, AC7.
- References:
  - `logics/request/req_041_wire_endpoint_connection_reference_and_seal_reference_per_side.md`
  - `src/core/entities.ts`
  - `src/store/actions.ts`
  - `src/store/reducer/wireReducer.ts`
  - `src/tests/store.reducer.entities.spec.ts`

