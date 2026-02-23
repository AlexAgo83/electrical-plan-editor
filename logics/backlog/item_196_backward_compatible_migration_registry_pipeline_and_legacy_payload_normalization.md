## item_196_backward_compatible_migration_registry_pipeline_and_legacy_payload_normalization - Backward-Compatible Migration Registry, Pipeline, and Legacy Payload Normalization
> From version: 0.7.3
> Understanding: 98%
> Confidence: 96%
> Progress: 100%
> Complexity: High
> Theme: Incremental Migration Architecture for Versioned and Legacy Persisted Payloads
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
Even with a versioned envelope, the app still needs an explicit migration engine to safely load legacy or older payloads into the current runtime schema without data loss.

# Scope
- In:
  - Implement a migration registry/pipeline (incremental `vN -> vN+1` style or equivalent).
  - Define normalization path for unversioned legacy payloads (treated as `legacy`/`v0`).
  - Make migration steps deterministic and modular.
  - Ensure migration target resolves to the current schema version.
  - Provide migration result contract (success/failure, migrated payload, diagnostics).
- Out:
  - Local storage backup/overwrite safety mechanics (handled separately).
  - Import/export UI messaging and rejection UX details (handled separately).

# Acceptance criteria
- Older and unversioned payloads can be passed through a single migration pipeline entry point.
- Migration steps are composable and version-targeted.
- The pipeline fails safely (explicit error result) when migration cannot complete.

# Priority
- Impact: High.
- Urgency: High.

# Notes
- Dependencies: `req_033`, item_195.
- Blocks: item_197, item_198, item_199, item_200, item_202.
- Related AC: AC1, AC2, AC3, AC4, AC8.
- References:
  - `logics/request/req_033_save_data_versioning_and_backward_compatible_migrations_for_local_and_file_persistence.md`
  - `src/store/types.ts`
  - `src/store/createStore.ts`
  - `src/store/reducer.ts`

