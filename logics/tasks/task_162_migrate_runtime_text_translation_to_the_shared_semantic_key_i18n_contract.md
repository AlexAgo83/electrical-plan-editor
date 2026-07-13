## task_162_migrate_runtime_text_translation_to_the_shared_semantic_key_i18n_contract - Migrate runtime text translation to the shared semantic key i18n contract
> From version: 1.18.1
> Schema version: 1.0
> Status: In progress
> Understanding: 90%
> Confidence: 85%
> Progress: 30%
> Complexity: Medium
> Theme: Implementation delivery
> Reminder: Update status/understanding/confidence/progress and linked request/backlog references when you edit this doc.
> Owner: codex

# Definition of Done (DoD)
- [ ] The backlog scope is implemented.
- [ ] Acceptance criteria are covered.
- [ ] Validation passes.
- [ ] Meaningful waves followed ADR 009: affected docs updated and the repo left commit-ready without automatic commits.

# Backlog
- `item_669_migrate_runtime_text_translation_to_the_shared_semantic_key_i18n_contract`

# Acceptance criteria
- AC1: New and migrated UI paths resolve stable semantic keys at render time and do not depend on English visible text identity.
- AC2: English and French JSON catalogs pass schema, key, value, and named-placeholder parity validation under the shared contract.
- AC3: Migration is delivered in bounded screen/domain slices with the legacy bridge retained only for explicitly measured unmigrated coverage.
- AC4: Dynamic validation, catalog import/export, onboarding, and controller messages preserve their data interpolation and locale behavior.
- AC5: The DOM/text translator and regex compatibility layer are removed only after no production path or regression test depends on them.
- AC6: The viewer exposes the declared semantic catalogs and reports no contract diagnostics.
- AC7: Existing focused tests plus lint, typecheck, build, and contract validation pass after every migration wave.

# Validation
- Run `python3 -m logics_manager lint --require-status`.
- Use `python3 -m logics_manager flow progress task task_162_migrate_runtime_text_translation_to_the_shared_semantic_key_i18n_contract.md --progress <n>%` during multi-wave work.
- Run `python3 -m logics_manager flow finish task task_162_migrate_runtime_text_translation_to_the_shared_semantic_key_i18n_contract.md` after implementation.

# Report
- Implementation complete.

# AI Context
- Summary: Implement migrate runtime text translation to the shared semantic key i18n contract.
- Keywords: task, implementation, backlog, runtime, python
- Use when: You need a bounded implementation task for a backlog item.
- Skip when: The work is still at the request or backlog shaping stage.

# Links
- Request: `req_165_migrate_runtime_text_translation_to_the_shared_semantic_key_i18n_contract`
- Product brief(s): (none yet)
- Architecture decision(s): (none yet)
