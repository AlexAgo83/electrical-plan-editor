## req_033_save_data_versioning_and_backward_compatible_migrations_for_local_and_file_persistence - Save/Data Versioning with Backward-Compatible Migrations for Local and File Persistence
> From version: 0.7.3
> Understanding: 98%
> Confidence: 97%
> Complexity: High
> Theme: Data Durability, Backward Compatibility, and Schema Evolution Safety
> Reminder: Update Understanding/Confidence and dependencies/references when you edit this doc.

# Needs
- Introduce a save/data versioning system so future app upgrades do not cause users to lose work.
- Cover both persistence channels:
  - local persistence (browser/local storage)
  - file-based persistence (import/export payloads)
- Ensure backward compatibility for existing users already using the app today (including users with unversioned legacy saved data).
- Define a migration strategy that is safe, deterministic, and testable.
- Provide recovery behavior when migration/import cannot be completed safely.

# Context
The app is actively used and already persists user work locally and through file import/export flows. The current model evolves quickly (network scope, settings, callouts, themes, tables, etc.), which increases the risk that future schema changes could make previously saved data unreadable or partially corrupted.

This request establishes a formal versioning and migration contract for persisted data to protect current and future users from data loss during app upgrades.

Critical product constraint:
- There is already at least one active user on the current app version.
- We must assume legacy persisted data exists in the wild and may not include explicit schema version metadata.

## Objectives
- Introduce explicit version metadata for persisted app data and exported files.
- Ensure legacy/unversioned saved data can still be loaded (via compatibility defaults/migration path).
- Add migration layers so schema changes are applied incrementally and safely.
- Preserve user data on migration failure (no destructive overwrite of original source before successful migration).
- Add regression coverage and fixtures for backward compatibility.

## Functional Scope
### A. Versioned persistence envelope for app data (high priority)
- Define a versioned persistence contract (envelope) for saved app data used in:
  - local persistence payloads
  - exported file payloads (if export format differs, define explicit format version there too)
- Required metadata should include (exact naming can vary, but semantics must be explicit):
  - schema/data version (migration target version)
  - app version written/exported (diagnostic/support)
  - timestamp written/exported (recommended)
- Ensure the runtime can distinguish:
  - unversioned legacy payloads
  - supported versioned payloads
  - unknown/newer versions (forward incompatibility case)

### B. Backward-compatible migration pipeline (high priority)
- Introduce a migration pipeline that upgrades persisted payloads from older versions to the current schema.
- Migration design requirements:
  - ordered incremental migrations (`vN -> vN+1`)
  - deterministic, pure transformations where feasible
  - explicit target version constant
  - safe handling of missing/legacy fields with defaults
- Unversioned legacy payload handling:
  - define a compatibility interpretation path (ex: treat as `v0` or `legacy`)
  - normalize into the first versioned shape before standard migrations
- Prevent silent destructive changes:
  - migration should fail loudly (with user-visible error/status) if required data is irrecoverably invalid

### C. Local persistence migration and safety (high priority)
- On app startup/hydration:
  - detect persisted payload version
  - migrate to current schema before use
  - persist upgraded payload only after successful migration/validation
- Add safety guard so a failed migration does not destroy the original local data.
- Recommended baseline protection:
  - keep original raw payload in memory during migration
  - optionally write a backup copy under a dedicated key before replacing the primary key
  - surface a recoverable error state / guidance if migration fails
- Preserve user work already stored by current users on legacy versions.

### D. File import/export compatibility contract (high priority)
- Exported files must include explicit version metadata so future versions can import them safely.
- Import flow must support:
  - legacy exported files (including pre-versioning exports if applicable)
  - current version exports
  - graceful rejection of unsupported future versions (with clear message)
- If import payload is older but migratable:
  - run migration pipeline before import into store
- If import payload is invalid/corrupted:
  - fail safely with actionable feedback
  - do not mutate current workspace state

### E. Validation and migration invariants (medium-high priority)
- Define post-migration validation checks (minimum baseline) before accepting migrated payload into runtime/store:
  - required top-level structures exist
  - entity collections and `networkStates` consistency remain valid
  - active network references are coherent (or safely normalized)
  - UI preferences payload shape is valid or safely defaulted
- If validation fails after migration:
  - reject migrated payload
  - preserve original source data
  - surface clear error/status

### F. Backward compatibility test fixtures and regression coverage (high priority)
- Add/expand compatibility fixtures representing older persisted/exported payload shapes.
- Cover at least:
  - legacy/unversioned local persistence payload (existing user scenario)
  - versioned payload from current schema version
  - unsupported future version payload (rejection path)
  - malformed payload path (safe failure)
- Add regression tests for:
  - successful migration preserving user entities/settings
  - import compatibility across versions
  - local persistence hydration after migration

### G. Rollout and developer ergonomics (medium priority)
- Centralize version constants and migration registry so future schema changes follow one path.
- Document the migration workflow for future contributors:
  - bump version strategy
  - where to add new migration steps
  - how to add compat fixtures/tests
- Prefer additive schema evolution patterns when practical to minimize migration risk.

## Non-functional requirements
- No data loss for supported legacy payloads during automatic migration.
- Backward compatibility must be explicit and test-covered (not implicit behavior).
- Migration failures must be safe (no destructive overwrite of source data before success).
- Error messages should be user-readable enough for recovery/support.
- Keep migration code modular and easy to extend as app versions evolve.

## Validation and regression safety
- Targeted tests (minimum):
  - `src/tests/persistence.localStorage.spec.ts`
  - `src/tests/persistence.storage-key.spec.ts`
  - `src/tests/app.ui.import-export.spec.tsx`
  - `src/tests/sample-network.compat.spec.ts` (or new compat fixtures/tests for versioned migration)
- Additional recommended tests:
  - dedicated migration unit tests (`src/tests/persistence.migrations.spec.ts` or equivalent)
  - malformed/unsupported version import rejection tests
- Closure validation (recommended):
  - `python3 logics/skills/logics-doc-linter/scripts/logics_lint.py`
  - `npm run lint`
  - `npm run typecheck`
  - `npm run test:ci`
  - `npm run test:e2e`
  - `npm run build`
  - `npm run quality:pwa`

## Acceptance criteria
- AC1: Persisted local data written by current/legacy supported versions can still be loaded after upgrading the app, without user data loss.
- AC2: Exported files include explicit version metadata and remain importable through the compatibility pipeline.
- AC3: Legacy/unversioned persisted payloads are recognized and migrated (or normalized) through a defined path.
- AC4: Unsupported future-version payloads are rejected safely with a clear error, without mutating the current workspace.
- AC5: Failed migration/import does not overwrite or destroy the original persisted source payload.
- AC6: Migration/post-load validation ensures runtime receives a coherent state (or fails safely with user-visible status).
- AC7: Compatibility and migration behavior is covered by automated tests (local persistence + import/export paths).
- AC8: Developer-facing migration/versioning workflow is documented enough to support future schema evolution safely.

## Out of scope
- Cloud sync / server-side account storage and remote migration orchestration.
- Full semantic versioning policy for the entire application release process (beyond persisted data/schema compatibility).
- Migration support for arbitrarily corrupted payloads beyond safe rejection and error reporting.
- One-click user-facing “downgrade” of saved data to older app versions (forward export compatibility beyond explicit support).

# Backlog
- `logics/backlog/item_195_persistence_schema_version_envelope_and_current_version_contract_for_saved_data.md`
- `logics/backlog/item_196_backward_compatible_migration_registry_pipeline_and_legacy_payload_normalization.md`
- `logics/backlog/item_197_local_storage_hydration_migration_backup_and_safe_persist_upgrade_flow.md`
- `logics/backlog/item_198_import_export_file_format_versioning_migration_and_future_version_rejection.md`
- `logics/backlog/item_199_post_migration_payload_validation_and_fail_safe_error_handling_for_persistence.md`
- `logics/backlog/item_200_backward_compatibility_fixtures_and_regression_tests_for_local_and_file_persistence.md`
- `logics/backlog/item_201_save_data_versioning_developer_workflow_documentation_and_migration_authoring_guide.md`
- `logics/backlog/item_202_req_033_save_data_versioning_closure_ci_e2e_build_pwa_and_ac_traceability.md`

# References
- `src/app/hooks/useUiPreferences.ts`
- `src/app/hooks/useNetworkImportExport.ts`
- `src/app/hooks/useStoreHistory.ts`
- `src/store/actions.ts`
- `src/store/reducer/networkReducer.ts`
- `src/store/types.ts`
- `src/store/createStore.ts`
- `src/tests/persistence.localStorage.spec.ts`
- `src/tests/persistence.storage-key.spec.ts`
- `src/tests/app.ui.import-export.spec.tsx`
- `src/tests/sample-network.compat.spec.ts`
