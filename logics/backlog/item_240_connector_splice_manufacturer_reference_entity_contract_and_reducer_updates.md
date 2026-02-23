## item_240_connector_splice_manufacturer_reference_entity_contract_and_reducer_updates - Connector/Splice `manufacturerReference` Entity Contract and Reducer Updates
> From version: 0.7.3
> Understanding: 99%
> Confidence: 97%
> Progress: 0%
> Complexity: Medium-High
> Theme: Optional Manufacturer Reference Support in Connector/Splice Domain Contracts
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
`Connector` and `Splice` entities currently have no dedicated field for storing real manufacturer references. Without a first-class `manufacturerReference`, users cannot persist external part references distinct from project-facing technical IDs.

# Scope
- In:
  - Extend `Connector` and `Splice` entities with optional `manufacturerReference`.
  - Update relevant action payloads and reducers so `manufacturerReference` persists on create/edit.
  - Implement normalization rules:
    - free-text accepted
    - trim whitespace
    - empty/whitespace-only -> `undefined`
  - Enforce max length guardrail (`<= 120`) if validation is implemented at reducer level.
  - Preserve existing validation behavior for connector/splice fields unrelated to manufacturer reference.
  - Do not enforce uniqueness and do not add duplicate warnings.
- Out:
  - Connector/splice form UI inputs and form handler wiring (handled in item_241).
  - Legacy persistence/import compatibility patching (handled in item_242).
  - Broader search/table/inspector display additions (optional and out of core scope).

# Acceptance criteria
- `Connector` and `Splice` entity contracts support optional `manufacturerReference`.
- Create/edit reducer flows persist normalized `manufacturerReference` values.
- Empty input normalizes consistently to absent/`undefined`.
- Duplicate manufacturer references are accepted without errors/warnings.

# Priority
- Impact: High.
- Urgency: High.

# Notes
- Dependencies: `req_040`.
- Blocks: item_241, item_242, item_243, item_244.
- Related AC: AC1, AC3, AC4, AC4a, AC5, AC5a.
- References:
  - `logics/request/req_040_optional_manufacturer_reference_for_connectors_and_splices.md`
  - `src/core/entities.ts`
  - `src/store/actions.ts`
  - `src/store/reducer/connectorReducer.ts`
  - `src/store/reducer/spliceReducer.ts`
  - `src/tests/store.reducer.entities.spec.ts`

