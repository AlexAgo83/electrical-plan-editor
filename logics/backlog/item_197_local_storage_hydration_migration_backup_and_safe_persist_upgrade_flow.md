## item_197_local_storage_hydration_migration_backup_and_safe_persist_upgrade_flow - Local Storage Hydration Migration, Backup, and Safe Persist Upgrade Flow
> From version: 0.7.3
> Understanding: 98%
> Confidence: 96%
> Progress: 100%
> Complexity: High
> Theme: Safe Local Persistence Upgrade Path for Existing Users
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
Existing users may already have legacy local persisted data. Startup hydration must migrate it safely without overwriting or losing the original payload on failure.

# Scope
- In:
  - Integrate persisted payload version detection + migration into local hydration flow.
  - Preserve original local payload until migration and validation succeed.
  - Add backup/failsafe behavior for local payload upgrade (dedicated backup key or equivalent safety strategy).
  - Persist the upgraded payload only after successful migration and acceptance checks.
  - Surface a clear error/status when local migration fails.
- Out:
  - File import/export migration behavior (handled separately).
  - Full UI redesign for recovery flows.

# Acceptance criteria
- Legacy/supported local payloads are migrated during hydration and loaded successfully.
- A failed local migration does not destroy the original persisted payload.
- Upgraded payloads are written back only after successful migration.

# Priority
- Impact: Very High.
- Urgency: High.

# Notes
- Dependencies: `req_033`, item_195, item_196.
- Blocks: item_200, item_202.
- Related AC: AC1, AC3, AC5, AC6.
- References:
  - `logics/request/req_033_save_data_versioning_and_backward_compatible_migrations_for_local_and_file_persistence.md`
  - `src/app/hooks/useUiPreferences.ts`
  - `src/tests/persistence.localStorage.spec.ts`
  - `src/tests/persistence.storage-key.spec.ts`

