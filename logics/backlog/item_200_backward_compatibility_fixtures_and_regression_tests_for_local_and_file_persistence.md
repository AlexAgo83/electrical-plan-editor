## item_200_backward_compatibility_fixtures_and_regression_tests_for_local_and_file_persistence - Backward-Compatibility Fixtures and Regression Tests for Local and File Persistence
> From version: 0.7.3
> Understanding: 98%
> Confidence: 97%
> Progress: 0%
> Complexity: Medium
> Theme: Regression Safety Net for Save/Data Versioning and Migration Behavior
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
Without dedicated compat fixtures/tests, versioned persistence and migration behavior may regress silently in future releases, risking user data loss.

# Scope
- In:
  - Add/expand compat fixtures for legacy/unversioned and versioned payloads.
  - Add regression tests for local hydration migration.
  - Add regression tests for import/export version compatibility and future-version rejection.
  - Cover malformed payload rejection with safe failure behavior.
  - Ensure tests verify preservation of user entities/settings after migration.
- Out:
  - Full CI closure reporting (handled separately).
  - End-to-end test redesign unrelated to persistence versioning.

# Acceptance criteria
- Automated tests cover legacy/unversioned payload migration.
- Automated tests cover supported versioned payload import/hydration and unsupported future-version rejection.
- Tests verify safe failure behavior (no destructive overwrite/state mutation on failure paths).

# Priority
- Impact: Very High.
- Urgency: High.

# Notes
- Dependencies: `req_033`, item_197, item_198, item_199.
- Blocks: item_202.
- Related AC: AC1, AC2, AC4, AC5, AC7.
- References:
  - `logics/request/req_033_save_data_versioning_and_backward_compatible_migrations_for_local_and_file_persistence.md`
  - `src/tests/persistence.localStorage.spec.ts`
  - `src/tests/persistence.storage-key.spec.ts`
  - `src/tests/app.ui.import-export.spec.tsx`
  - `src/tests/sample-network.compat.spec.ts`

