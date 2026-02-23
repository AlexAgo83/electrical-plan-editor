## item_235_canonical_wire_color_catalog_with_two_character_codes_labels_and_hex_swatch_values - Canonical Wire Color Catalog with 2-Character Codes, English Labels, and Hex Swatch Values
> From version: 0.7.3
> Understanding: 99%
> Confidence: 97%
> Progress: 0%
> Complexity: Medium
> Theme: Canonical Color Vocabulary for Wire Modeling and UI Rendering
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
Wire color support requires a stable, portable color vocabulary. Without a canonical catalog, wire records may drift into duplicated labels/hex values and non-deterministic rendering across persistence/import/export paths.

# Scope
- In:
  - Add a canonical wire color catalog module (v1 target: 20 colors).
  - Each catalog entry includes:
    - `id` (stable 2-character code)
    - `label` (English display name)
    - `hex` (display swatch color)
  - Enforce/validate catalog invariants:
    - unique IDs
    - exactly 2-character IDs
    - non-empty labels
    - valid/usable hex swatch values
  - Add lookup helper(s) for resolving color metadata by ID.
  - Keep catalog app-defined (not user-editable in this request).
- Out:
  - Wire entity contract changes for storing color IDs (handled in item_236).
  - Wire form selectors/swatches (handled in item_237).
  - Persistence/import compatibility patching (handled in item_238).

# Acceptance criteria
- A canonical wire color catalog v1 exists with 20 stable entries using 2-character IDs, English labels, and hex swatch values.
- Catalog lookup helpers can resolve metadata by color ID deterministically.
- Catalog invariants are guarded by implementation and/or tests.

# Priority
- Impact: High.
- Urgency: High.

# Notes
- Dependencies: `req_039`.
- Blocks: item_236, item_237, item_238, item_239.
- Related AC: AC1, AC7, AC8.
- References:
  - `logics/request/req_039_wire_color_catalog_two_character_codes_and_bicolor_primary_secondary_support.md`
  - `src/core/entities.ts`
  - `src/app/hooks/useWireHandlers.ts`
  - `src/app/components/workspace/ModelingWireFormPanel.tsx`
  - `src/tests/store.reducer.entities.spec.ts`

