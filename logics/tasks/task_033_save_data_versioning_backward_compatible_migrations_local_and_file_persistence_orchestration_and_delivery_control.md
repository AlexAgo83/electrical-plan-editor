## task_033_save_data_versioning_backward_compatible_migrations_local_and_file_persistence_orchestration_and_delivery_control - Save/Data Versioning and Backward-Compatible Migrations (Local + File Persistence) Orchestration and Delivery Control
> From version: 0.7.3
> Understanding: 99%
> Confidence: 97%
> Progress: 0%
> Complexity: High
> Theme: Delivery Orchestration for Persisted Data Versioning, Migration Safety, and Backward Compatibility
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc.

# Context
Orchestration task for `req_033`. This task coordinates delivery of a persistence compatibility safety framework so app upgrades do not cause users to lose work, including:
- versioned save/file payload contracts,
- backward-compatible migration pipeline with legacy/unversioned normalization,
- local storage hydration migration + safe overwrite/backup behavior,
- file import/export versioning and compatibility/rejection behavior,
- post-migration validation/fail-safe handling,
- compatibility fixtures and regression tests,
- contributor migration workflow documentation.

There is already at least one active user on the current app version, so backward compatibility for existing persisted data is a first-class requirement.

Backlog scope covered:
- `item_195_persistence_schema_version_envelope_and_current_version_contract_for_saved_data.md`
- `item_196_backward_compatible_migration_registry_pipeline_and_legacy_payload_normalization.md`
- `item_197_local_storage_hydration_migration_backup_and_safe_persist_upgrade_flow.md`
- `item_198_import_export_file_format_versioning_migration_and_future_version_rejection.md`
- `item_199_post_migration_payload_validation_and_fail_safe_error_handling_for_persistence.md`
- `item_200_backward_compatibility_fixtures_and_regression_tests_for_local_and_file_persistence.md`
- `item_201_save_data_versioning_developer_workflow_documentation_and_migration_authoring_guide.md`
- `item_202_req_033_save_data_versioning_closure_ci_e2e_build_pwa_and_ac_traceability.md`

# Plan
- [ ] 1. Deliver Wave 0 persistence schema version envelope + current version constants/contracts for local/file payloads (`item_195`)
- [ ] 2. Deliver Wave 1 backward-compatible migration registry/pipeline + legacy/unversioned payload normalization (`item_196`)
- [ ] 3. Deliver Wave 2 local storage hydration migration flow with safe backup/overwrite semantics and failure protection (`item_197`)
- [ ] 4. Deliver Wave 3 import/export file version metadata + import migration path + unsupported future-version rejection (`item_198`)
- [ ] 5. Deliver Wave 4 post-migration validation + fail-safe error/status handling (`item_199`)
- [ ] 6. Deliver Wave 5 compatibility fixtures and regression coverage for local/file persistence migrations (`item_200`)
- [ ] 7. Deliver Wave 6 developer workflow documentation for future migration authoring/version bumps (`item_201`)
- [ ] 8. Deliver Wave 7 closure: CI-equivalent validation, AC traceability, and Logics updates (`item_202`)
- [ ] FINAL: Update related Logics docs (request/task/backlog progress + delivery summary)

# Validation
- Documentation / Logics:
  - `python3 logics/skills/logics-doc-linter/scripts/logics_lint.py`
- Static analysis / compile safety:
  - `npm run lint`
  - `npm run typecheck`
  - `npm run quality:ui-modularization`
  - `npm run quality:store-modularization`
- Automated tests:
  - Targeted runs during implementation (recommended):
    - `src/tests/persistence.localStorage.spec.ts`
    - `src/tests/persistence.storage-key.spec.ts`
    - `src/tests/app.ui.import-export.spec.tsx`
    - `src/tests/sample-network.compat.spec.ts`
    - dedicated migration tests (ex: `src/tests/persistence.migrations.spec.ts`) if added
  - `npm run test:ci`
- End-to-end tests:
  - `npm run test:e2e`
- Build / delivery checks:
  - `npm run build`
  - `npm run quality:pwa`

# Report
- Wave status:
  - Wave 0 (versioned envelope contract): pending
  - Wave 1 (migration pipeline + legacy normalization): pending
  - Wave 2 (local hydration + safe backup/overwrite): pending
  - Wave 3 (file import/export versioning + compatibility/rejection): pending
  - Wave 4 (post-migration validation + fail-safe handling): pending
  - Wave 5 (compat fixtures/tests): pending
  - Wave 6 (developer migration workflow docs): pending
  - Wave 7 (closure + AC traceability): pending
- Current blockers:
  - None at kickoff.
- Main risks to track:
  - Legacy persisted payloads may be unversioned and partially shaped by earlier runtime assumptions.
  - Migration steps may inadvertently mutate or drop fields if normalization boundaries are unclear.
  - Import/export payload versioning may diverge from local persistence contract if implemented independently.
  - Failed migration handling may still overwrite local data unless backup/commit ordering is explicit.
  - Forward-incompatible payload rejection may accidentally partially mutate current state before error reporting.
  - Compatibility tests can be too narrow if fixtures do not represent real legacy payloads.
- Mitigation strategy:
  - Introduce a single envelope + migration entry point before wiring local/import flows.
  - Treat legacy payloads via explicit normalization step (`legacy`/`v0`) and test with frozen fixtures.
  - Separate parse -> migrate -> validate -> apply phases with explicit failure returns.
  - Persist upgraded payload only after successful migration + validation + state acceptance.
  - Add targeted regression tests for both success and safe-failure paths (local + file import).
- Validation snapshot (kickoff):
  - `python3 logics/skills/logics-doc-linter/scripts/logics_lint.py` ✅ (request + planning artifacts)
- Delivery snapshot:
  - Pending implementation.
- AC traceability (`req_033`) target mapping:
  - AC1 -> `item_196`, `item_197`, `item_200`, `item_202`
  - AC2 -> `item_195`, `item_198`, `item_200`, `item_202`
  - AC3 -> `item_195`, `item_196`, `item_197`, `item_200`, `item_202`
  - AC4 -> `item_195`, `item_198`, `item_199`, `item_200`, `item_202`
  - AC5 -> `item_197`, `item_198`, `item_199`, `item_200`, `item_202`
  - AC6 -> `item_197`, `item_199`, `item_202`
  - AC7 -> `item_198`, `item_199`, `item_200`, `item_202`
  - AC8 -> `item_195`, `item_196`, `item_201`, `item_202`

# References
- `logics/request/req_033_save_data_versioning_and_backward_compatible_migrations_for_local_and_file_persistence.md`
- `logics/backlog/item_195_persistence_schema_version_envelope_and_current_version_contract_for_saved_data.md`
- `logics/backlog/item_196_backward_compatible_migration_registry_pipeline_and_legacy_payload_normalization.md`
- `logics/backlog/item_197_local_storage_hydration_migration_backup_and_safe_persist_upgrade_flow.md`
- `logics/backlog/item_198_import_export_file_format_versioning_migration_and_future_version_rejection.md`
- `logics/backlog/item_199_post_migration_payload_validation_and_fail_safe_error_handling_for_persistence.md`
- `logics/backlog/item_200_backward_compatibility_fixtures_and_regression_tests_for_local_and_file_persistence.md`
- `logics/backlog/item_201_save_data_versioning_developer_workflow_documentation_and_migration_authoring_guide.md`
- `logics/backlog/item_202_req_033_save_data_versioning_closure_ci_e2e_build_pwa_and_ac_traceability.md`
- `src/app/hooks/useUiPreferences.ts`
- `src/app/hooks/useNetworkImportExport.ts`
- `src/store/actions.ts`
- `src/store/types.ts`
- `src/store/reducer/networkReducer.ts`
- `src/tests/persistence.localStorage.spec.ts`
- `src/tests/persistence.storage-key.spec.ts`
- `src/tests/app.ui.import-export.spec.tsx`
- `src/tests/sample-network.compat.spec.ts`
- `.github/workflows/ci.yml`
- `package.json`
