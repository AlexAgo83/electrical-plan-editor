## item_282_wire_entity_free_color_label_and_color_mode_invariant_normalization - Wire Entity Free Color Label and Color-Mode Invariant Normalization
> From version: 0.8.1
> Understanding: 98%
> Confidence: 96%
> Progress: 100%
> Complexity: Medium-High
> Theme: Domain contract extension for free-form cable color identification with exclusive color modes
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
`req_045` introduces a free-form wire/cable color label, but the current wire contract and reducer invariants only model no-color and catalog mono/bi-color states. Without a domain-level invariant, mixed states (`freeColorLabel` + catalog IDs) can appear and break deterministic behavior across UI, persistence, and import flows.

# Scope
- In:
  - Extend `Wire` color metadata contract with `freeColorLabel` (nullable string).
  - Add/adjust store action payload typing/contracts for the new field.
  - Enforce color-mode exclusivity invariants in reducer normalization:
    - free color label => clear catalog IDs
    - catalog color(s) => clear free color label
  - Preserve existing `req_039` mono/bi-color invariants (including duplicate bi-color normalization and secondary-without-primary handling).
  - Trim `freeColorLabel` and enforce non-empty semantics after trim when used.
  - Enforce validated length limit (`32` chars) in the store normalization/source-of-truth path.
  - Document deterministic normalization behavior for invalid mixed input states.
- Out:
  - Wire form UX for selecting color mode and editing free-color labels (handled in item_283).
  - Read-only display support in tables/analysis/callouts (handled in item_284).
  - Persistence/import/export schema updates (handled in item_285).

# Acceptance criteria
- `Wire` supports `freeColorLabel` (or finalized equivalent field) in the domain/store contract.
- Reducer/store normalization enforces mutually exclusive color modes (no-color, catalog mono/bi-color, free-color).
- `freeColorLabel` trimming and max-length (`32`) rules are enforced in the source-of-truth path.
- Existing `req_039` catalog color invariants remain functional and non-regressed.

# Priority
- Impact: High.
- Urgency: High.

# Notes
- Dependencies: `req_045`, `req_039`.
- Blocks: item_283, item_284, item_285, item_286.
- Related AC: AC1, AC3, AC4, AC8.
- References:
  - `logics/request/req_045_wire_cable_free_color_label_support_beyond_catalog_and_no_color_states.md`
  - `logics/request/req_039_wire_color_catalog_two_character_codes_and_bicolor_primary_secondary_support.md`
  - `src/core/entities.ts`
  - `src/store/actions.ts`
  - `src/store/reducer/wireReducer.ts`
  - `src/app/hooks/useWireHandlers.ts`
  - `src/tests/store.reducer.entities.spec.ts`
