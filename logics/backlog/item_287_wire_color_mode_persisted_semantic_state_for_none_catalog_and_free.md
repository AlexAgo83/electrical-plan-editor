## item_287_wire_color_mode_persisted_semantic_state_for_none_catalog_and_free - Wire Color Mode Persisted Semantic State for None/Catalog/Free
> From version: 0.8.1
> Understanding: 98%
> Confidence: 96%
> Progress: 100%
> Complexity: Medium-High
> Theme: Source-of-truth wire color semantics that preserve intent across no-color, catalog-color, and free-color modes
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
`req_045` introduced `freeColorLabel` and a UI color mode selector, but semantic intent is still inferred from fields. An empty free-color label collapses to the same shape as `No color` unless a persisted explicit mode is stored, which prevents supporting “Free color (unspecified)” safely.

# Scope
- In:
  - Add a persisted wire color mode field (finalized name TBD; recommended `colorMode`).
  - Define supported modes and invariants:
    - `none`
    - `catalog`
    - `free`
  - Update reducer/source-of-truth normalization so mode drives state normalization.
  - Support `free` mode with empty `freeColorLabel` as a valid state.
  - Preserve `req_039`/`req_045` catalog-color invariants and normalization behavior.
  - Add/adjust store action typing/contracts to carry persisted mode on wire save/upsert.
- Out:
  - Wire form UX messaging/validation changes (handled in item_288).
  - Read-only display / sort / filter semantics updates (handled in item_289).
  - Persistence/import/export migration and compatibility handling (handled in item_290).

# Acceptance criteria
- Wire color state includes a persisted explicit semantic mode (`none` / `catalog` / `free`, or finalized equivalent).
- Reducer normalization preserves `Free color` empty as a distinct valid state from `No color`.
- Existing catalog-color and no-color behaviors remain functional and non-regressed.

# Priority
- Impact: High.
- Urgency: High.

# Notes
- Delivery status: Delivered in `req_046` implementation (see `task_047` report and commits `3d1e12b`, `0e2c97b`).
- Dependencies: `req_046`, `req_045`, `req_039`.
- Blocks: item_288, item_289, item_290, item_291.
- Related AC: AC1, AC2, AC6, AC8.
- References:
  - `logics/request/req_046_wire_free_color_mode_without_label_as_deliberate_unspecified_color_placeholder.md`
  - `logics/request/req_045_wire_cable_free_color_label_support_beyond_catalog_and_no_color_states.md`
  - `src/core/cableColors.ts`
  - `src/core/entities.ts`
  - `src/store/actions.ts`
  - `src/store/reducer/wireReducer.ts`
  - `src/tests/store.reducer.entities.spec.ts`
