## item_285_wire_free_color_label_persistence_import_export_compatibility_and_mixed_state_normalization - Wire Free Color Label Persistence/Import/Export Compatibility and Mixed-State Normalization
> From version: 0.8.1
> Understanding: 98%
> Confidence: 96%
> Progress: 0%
> Complexity: Medium-High
> Theme: Portable and backward-compatible free-color wire data across persistence and import/export paths
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
Adding `freeColorLabel` changes wire serialization contracts. Without compatibility patching, legacy saves/imports may fail normalization, and imported mixed states (`freeColorLabel` + catalog IDs) can produce inconsistent behavior across machines and versions.

# Scope
- In:
  - Update persistence/local-storage serialization and hydration paths to include `freeColorLabel`.
  - Update portability/import/export schema/contracts to include `freeColorLabel`.
  - Backward compatibility normalization:
    - missing `freeColorLabel` => `null`
    - legacy no-color/catalog states remain valid
  - Forward/mixed-state normalization for imported data:
    - if `freeColorLabel` and catalog IDs coexist, prioritize `freeColorLabel` and clear catalog IDs
  - Keep normalization deterministic and documented across persistence/import paths.
  - Add/adjust fixtures/migrations if schema/versioning changes are required.
- Out:
  - Wire form UX controls (handled in item_283).
  - Read-only display and sorting/filtering UI behavior (handled in item_284).
  - User-configurable custom color catalogs.

# Acceptance criteria
- Persisted and portable wire records can store `freeColorLabel` when present.
- Legacy data without `freeColorLabel` loads/imports successfully with `freeColorLabel = null`.
- Imported mixed states (`freeColorLabel` + catalog IDs) normalize deterministically to free-color mode (catalog IDs cleared).
- Compatibility changes do not regress existing catalog/no-color wire data paths.

# Priority
- Impact: High.
- Urgency: High.

# Notes
- Dependencies: `req_045`, item_282.
- Blocks: item_286.
- Related AC: AC3, AC6, AC7, AC8.
- References:
  - `logics/request/req_045_wire_cable_free_color_label_support_beyond_catalog_and_no_color_states.md`
  - `logics/request/req_039_wire_color_catalog_two_character_codes_and_bicolor_primary_secondary_support.md`
  - `src/adapters/persistence/migrations.ts`
  - `src/adapters/portability/networkFile.ts`
  - `src/adapters/persistence/localStorage.ts`
  - `src/tests/persistence.localStorage.spec.ts`
  - `src/tests/portability.network-file.spec.ts`
  - `src/tests/store.reducer.entities.spec.ts`

