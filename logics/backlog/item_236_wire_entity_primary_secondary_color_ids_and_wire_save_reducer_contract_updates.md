## item_236_wire_entity_primary_secondary_color_ids_and_wire_save_reducer_contract_updates - Wire Entity Primary/Secondary Color IDs and Wire Save/Reducer Contract Updates
> From version: 0.7.3
> Understanding: 99%
> Confidence: 97%
> Progress: 0%
> Complexity: High
> Theme: Wire Domain Contract Upgrade for Optional Mono/Bi-Color Modeling
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
The `Wire` contract currently has no structured color references. Supporting optional mono-color and bi-color wires requires persistent `primaryColorId` / `secondaryColorId` fields and reducer-level validation/normalization.

# Scope
- In:
  - Extend `Wire` with:
    - `primaryColorId` (nullable)
    - `secondaryColorId` (nullable)
  - Update wire save/upsert action payloads and reducer contracts to persist the new fields.
  - Validate/normalize color state combinations:
    - allow `null/null` (no color)
    - allow `primary!=null, secondary=null` (mono-color)
    - allow `primary!=null, secondary!=null` (bi-color)
    - reject/normalize `primary=null, secondary!=null`
    - normalize duplicate bi-color (`primary===secondary`) to mono-color (`secondary=null`) (preferred behavior)
  - Validate non-null IDs against canonical catalog.
  - Preserve unrelated wire endpoint/routing behavior.
- Out:
  - Wire form controls and swatch UX (handled in item_237).
  - Legacy persistence/import patching (handled in item_238).
  - Broader UI displays of color outside required compatibility/form paths.

# Acceptance criteria
- `Wire` entities persist `primaryColorId`/`secondaryColorId` as nullable color references.
- Wire save/edit flows support no-color, mono-color, and bi-color states.
- Invalid combinations (`secondary` without `primary`) are rejected or normalized safely.
- Duplicate bi-color combinations normalize to mono-color (`secondary=null`) or are safely blocked (normalization preferred).

# Priority
- Impact: High.
- Urgency: High.

# Notes
- Dependencies: `req_039`, item_235.
- Blocks: item_237, item_238, item_239.
- Related AC: AC2, AC4, AC4a, AC4b, AC5, AC7, AC8.
- References:
  - `logics/request/req_039_wire_color_catalog_two_character_codes_and_bicolor_primary_secondary_support.md`
  - `src/core/entities.ts`
  - `src/store/actions.ts`
  - `src/store/reducer/wireReducer.ts`
  - `src/tests/store.reducer.entities.spec.ts`

