## item_290_wire_color_mode_persistence_import_export_migration_from_req_045_implicit_state - Wire Color Mode Persistence/Import/Export Migration from req_045 Implicit State
> From version: 0.8.1
> Understanding: 98%
> Confidence: 96%
> Progress: 0%
> Complexity: Medium-High
> Theme: Compatibility and migration path for explicit wire color mode semantics after req_045
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
`req_046` requires a persisted explicit wire color mode, but existing data (legacy, `req_039`, `req_045`) may not contain this field. Without migration/normalization, saved/imported workspaces can lose semantic intent or behave inconsistently across local persistence and portability/import/export paths.

# Scope
- In:
  - Add persisted/import/export schema support for the explicit wire color mode field.
  - Implement deterministic inference when explicit mode is missing:
    - infer `free` if free-color label exists
    - infer `catalog` if catalog color IDs exist
    - infer `none` otherwise (baseline unless product decision changes)
  - Preserve `req_046` semantics for free unspecified (`free` mode + empty label).
  - Normalize invalid mixed states consistently using mode semantics.
  - Add/adjust persistence/import tests for backward compatibility and migration inference.
- Out:
  - Wire form UX copy/validation (handled in item_288).
  - Read-only display semantics (handled in item_289).
  - Any unrelated schema/version cleanup.

# Acceptance criteria
- Persisted and portable wire data can store the explicit wire color mode field.
- Data without explicit mode is normalized/migrated deterministically.
- `Free color` unspecified survives save/load/import/export as distinct from `No color`.
- Existing `req_039`/`req_045` data remains compatible and non-regressed.

# Priority
- Impact: High.
- Urgency: High.

# Notes
- Dependencies: `req_046`, item_287.
- Blocks: item_291.
- Related AC: AC2, AC6, AC7, AC8.
- References:
  - `logics/request/req_046_wire_free_color_mode_without_label_as_deliberate_unspecified_color_placeholder.md`
  - `src/adapters/persistence/migrations.ts`
  - `src/adapters/portability/networkFile.ts`
  - `src/adapters/persistence/localStorage.ts`
  - `src/tests/persistence.localStorage.spec.ts`
  - `src/tests/portability.network-file.spec.ts`
  - `src/tests/store.reducer.entities.spec.ts`

