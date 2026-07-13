## task_163_orchestrate_completion_of_semantic_localization - Orchestrate completion of semantic localization
> From version: 1.18.2
> Schema version: 1.0
> Status: Ready
> Understanding: 90%
> Confidence: 85%
> Progress: 0%
> Complexity: Medium
> Theme: Implementation delivery
> Reminder: Update status/understanding/confidence/progress and linked request/backlog references when you edit this doc.

# Context
- Orchestrate the scaffolded request chain and keep sibling implementation slices linked.

# Plan
- [ ] 1. Capture a baseline legacy-consumer report and classify every entry by source surface before editing production behavior.
- [ ] 2. Migrate shared shell and settings first so common semantic keys can be reused by later slices.
- [ ] 3. Migrate domain-heavy modeling, catalog, validation, and diagnostic surfaces with explicit data-boundary tests.
- [ ] 4. Migrate onboarding, controller notifications, and import/export messages, eliminating regular-expression consumers.
- [ ] 5. Require a zero-consumer report before deleting the bridge; then add the hardcoded-copy guard and run the complete validation matrix.
- [ ] 6. Update the product, backlog, task journal, context pack, and request status with final coverage and closure evidence.
- [ ] ADR 009 checkpoint: update affected Logics docs during each meaningful wave and leave the repo commit-ready.
- [ ] Keep commit creation under operator control; do not force one commit per micro-step.
- [ ] GATE: do not close until lint, audit, and scaffold validation pass.

# Backlog
- `item_670_migrate_settings_shared_shell_actions_and_forms_to_semantic_keys`
- `item_671_migrate_modeling_catalog_validation_and_diagnostic_surfaces`
- `item_672_migrate_onboarding_controller_notifications_and_import_export_states`
- `item_673_prove_zero_legacy_consumers_and_remove_the_runtime_compatibility_bridge`

# Definition of Done (DoD)
- [ ] Generated request, product, backlog, and task docs are present.
- [ ] Context-pack handoff is available when requested.
- [ ] Validation passes.
- [ ] Meaningful waves followed ADR 009: affected docs updated and the repo left commit-ready without automatic commits.

# AC Traceability
- request-AC1 -> This task. Proof: scaffold command generated the request-chain corpus.
- request-AC4 -> This task. Proof: optional context-pack handoff is supported.
- request-AC6 -> This task. Proof: dry-run and collision checks bound file changes.
- request-AC8 -> This task. Proof: CLI help documents the one-pass scaffold workflow.

# Validation
- Run `python3 -m logics_manager lint --require-status`.
- Run scaffold command tests.

# Report
- Implementation complete.

# AI Context
- Summary: Orchestrate completion of semantic localization
- Keywords: scaffolded-task, request-chain-scaffold, orchestration
- Use when: Coordinating implementation of a scaffolded request chain.
- Skip when: Working on one isolated sibling slice.

# Links
- Request: `req_166_complete_semantic_i18n_migration_and_retire_runtime_text_compatibility`
- Product brief(s): `prod_017_semantic_localization_completion`
- Architecture decision(s): (none yet)
