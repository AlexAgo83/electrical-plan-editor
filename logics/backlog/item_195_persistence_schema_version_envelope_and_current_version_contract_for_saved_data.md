## item_195_persistence_schema_version_envelope_and_current_version_contract_for_saved_data - Persistence Schema Version Envelope and Current Version Contract for Saved Data
> From version: 0.7.3
> Understanding: 98%
> Confidence: 97%
> Progress: 0%
> Complexity: Medium
> Theme: Explicit Persisted Data Contract for Future-Safe Schema Evolution
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
Persisted app data currently lacks a formal versioned envelope contract, which makes future schema changes risky for both local persistence and file-based exports/imports.

# Scope
- In:
  - Define a versioned persistence envelope contract for saved app data.
  - Introduce a current schema version constant (or equivalent source of truth).
  - Include metadata fields for schema version and app version (timestamp recommended).
  - Ensure the runtime can distinguish unversioned, versioned-supported, and unsupported-future payloads.
  - Apply the contract to both local persistence payloads and export format payloads (or define explicit parallel contracts).
- Out:
  - Full migration implementations across all historical versions.
  - Backward-compat fixture coverage (handled separately).

# Acceptance criteria
- A documented and implemented persisted data envelope exists with explicit version metadata.
- Current app writes version metadata when persisting/exporting data.
- Runtime detection paths for legacy/unversioned and unsupported future payloads are defined in code paths used by hydration/import.

# Priority
- Impact: High.
- Urgency: High.

# Notes
- Dependencies: `req_033`.
- Blocks: item_196, item_197, item_198, item_199, item_200, item_202.
- Related AC: AC2, AC3, AC4, AC8.
- References:
  - `logics/request/req_033_save_data_versioning_and_backward_compatible_migrations_for_local_and_file_persistence.md`
  - `src/app/hooks/useUiPreferences.ts`
  - `src/app/hooks/useNetworkImportExport.ts`
  - `src/store/types.ts`

