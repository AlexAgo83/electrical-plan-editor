## item_554_migration_backup_and_rollback_on_failure_with_explicit_user_feedback - Migration backup and rollback on failure with explicit user feedback
> From version: 1.4.4
> Schema version: 1.0
> Status: Done
> Understanding: 96%
> Confidence: 92%
> Progress: 100%
> Complexity: Medium
> Theme: Persistence safety / migration resilience
> Reminder: Update understanding/confidence/progress and linked task references when you edit this doc.

# Problem
The migration system applies schema upgrades linearly without any rollback capability. If a migration step throws or produces an invalid state, `normalizeNetworkEntityState()` silently discards user data and bootstraps with sample data. The user is not informed that their networks were lost.

# Scope
- In:
  - before applying any migration, write the current raw localStorage value to a dated backup key (e.g., `APP_STATE_BACKUP_PRE_MIGRATION_v{N}`);
  - if any migration step throws or returns a state that fails basic structural validation, restore from the backup key and surface an explicit error message to the user;
  - clean up the backup key after a successful migration completes;
  - add tests that simulate a mid-migration failure and assert that the backup is restored and the error is surfaced.
- Out:
  - safe JSON parsing (covered in `item_553`);
  - adding new migration versions (not in scope here).

```mermaid
%% logics-kind: backlog
%% logics-signature: backlog|migration-backup-and-rollback-on-failure|req-113-technical-debt-hardening-persist|the-migration-system-applies-schema-upgr|ac1-a-migration-step-that-throws
flowchart LR
    Pre[Write backup before migration] --> Migrate[Apply migration steps]
    Migrate -->|Success| Cleanup[Delete backup key]
    Migrate -->|Failure| Restore[Restore from backup]
    Restore --> ErrorUI[Show explicit error to user]
```

# Acceptance criteria
- AC1: A migration step that throws or returns structurally invalid state causes the system to restore the pre-migration backup, not to fall through to sample data.
- AC2: The backup key is written before any migration mutation and deleted only after a successful full migration.
- AC3: The user sees an explicit error message when rollback occurs, explaining that the upgrade failed and prior data was restored.
- AC4: Tests cover the mid-migration failure scenario, asserting backup restoration and error surfacing.
- AC5: Normal successful migration continues to work end to end; no regression in happy-path boot.

# AC Traceability
- AC1 → data preservation. Proof: test injects a throwing migration step and asserts backup is restored.
- AC2 → backup lifecycle. Proof: test checks backup key existence before and after migration.
- AC3 → UX clarity. Proof: test asserts error message is shown on rollback.
- AC4 → regression coverage. Proof: new spec cases in `persistence.migrations.spec.ts`.
- AC5 → non-regression. Proof: existing persistence specs continue to pass.
- request-AC6 -> This backlog slice. Evidence needed: `AppController.tsx` exposes Context providers for store dispatch and the main handler namespaces; at least one deeply nested consumer is updated to use them instead of props.
- request-AC7 -> This backlog slice. Evidence needed: Every domain reducer that mutates entity state calls `syncCurrentScopeToNetworkMap()` (or a type-enforced equivalent); the audit list is documented in the implementation.
- request-AC8 -> This backlog slice. Evidence needed: Unit tests exist for the five listed controller hooks and run in isolation without full UI setup.
- request-AC9 -> This backlog slice. Evidence needed: `persistence.migrations.spec.ts` exists and covers happy-path migration from each persisted schema version and corrupt-input handling at each step.
- request-AC10 -> This backlog slice. Evidence needed: All writes to `connectorCavityOccupancy` and `splicePortOccupancy` are guarded by `isValidSlotIndex()`; out-of-bounds writes are rejected without corrupting the map.
- request-AC11 -> This backlog slice. Evidence needed: Canvas viewport state is Redux-backed and undo/redo restores it alongside entity state unless the explicit opt-out preference is disabled.
- request-AC12 -> This backlog slice. Evidence needed: `ui.lastError` is typed as `AppError | null`; all existing raw-string error assignments are updated; the error display component renders the structured fields.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Request: `logics/request/req_113_technical_debt_hardening_persistence_safety_performance_and_architecture_quality.md`
- Primary task(s): `logics/tasks/task_091_orchestration_delivery_execution_for_req_113_technical_debt_hardening.md`

# AI Context
- Summary: Write a pre-migration backup to localStorage before each schema upgrade and restore it automatically if the migration fails, surfacing an explicit error to the user.
- Keywords: migration, rollback, backup, localStorage, schema version, data loss, persistence
- Use when: Implementing or reviewing the migration execution path in `migrations.ts`.
- Skip when: Working on features unrelated to persistence migrations.

# Priority
- Impact: Very high.
- Urgency: Immediate.

# Notes
- Derived from `logics/request/req_113_...` audit item A2.
- Depends on: `item_553` (safe JSON.parse wrapper).
- Blocks: `item_561` (migration spec depends on this item being in place).
- References:
  - `src/adapters/persistence/migrations.ts`
  - `src/adapters/persistence/localStorage.ts`
  - `src/tests/persistence.migrations.spec.ts`

# Validation
- `npm run -s lint`
- `npm run -s typecheck`
- `npm test -- --run src/tests/persistence.migrations.spec.ts src/tests/persistence.localStorage.spec.ts`
- `npm run -s build`
