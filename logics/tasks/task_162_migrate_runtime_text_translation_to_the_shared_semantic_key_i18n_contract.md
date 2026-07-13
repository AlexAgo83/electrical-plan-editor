## task_162_migrate_runtime_text_translation_to_the_shared_semantic_key_i18n_contract - Migrate runtime text translation to the shared semantic key i18n contract
> From version: 1.18.1
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Progress: 100%
> Complexity: Medium
> Theme: Implementation delivery
> Reminder: Update status/understanding/confidence/progress and linked request/backlog references when you edit this doc.
> Owner: codex

# Definition of Done (DoD)
- [x] The backlog scope is implemented.
- [x] Acceptance criteria are covered.
- [x] Validation passes.
- [x] Meaningful waves followed ADR 009: affected docs updated and the repo left commit-ready without automatic commits.

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
- Shared contract validation, typecheck, lint, 30 focused locale/navigation tests, and the production Vite/PWA build passed.
- The first direct-render slice contains 27 navigation keys; the compatibility namespace contains 690 measured entries.
- contract validation, typecheck, lint, 30 focused tests, and production build passed
- Finish workflow executed on 2026-07-13.
- Linked backlog/request close verification passed.

# Report
- Implemented the governed catalog foundation and first bounded direct-render navigation slice.
- Moved the former inline phrase dictionary into parity-validated `legacy.*` catalog entries so the viewer can edit all current values.
- Kept DOM and regex compatibility for the explicitly measured 690-entry remainder; its removal gate is intentionally not met by this slice.
- Recommended next slices: settings, modeling forms/catalog, validation and diagnostics, onboarding, then dynamic import/export messages.
- Finished on 2026-07-13.
- Linked backlog item(s): `item_669_migrate_runtime_text_translation_to_the_shared_semantic_key_i18n_contract`
- Related request(s): `req_165_migrate_runtime_text_translation_to_the_shared_semantic_key_i18n_contract`

# AI Context
- Summary: Implement migrate runtime text translation to the shared semantic key i18n contract.
- Keywords: task, implementation, backlog, runtime, python
- Use when: You need a bounded implementation task for a backlog item.
- Skip when: The work is still at the request or backlog shaping stage.

# Links
- Request: `req_165_migrate_runtime_text_translation_to_the_shared_semantic_key_i18n_contract`
- Product brief(s): (none yet)
- Architecture decision(s): (none yet)

# AC Traceability
- request-AC1 -> This task. Proof: workspace navigation resolves 27 `navigation.*` keys during React render.
- request-AC2 -> This task. Proof: the shared validator passed exact EN/FR key, value, and placeholder parity.
- request-AC3 -> This task. Proof: the first slice is bounded to navigation and the remaining 690 compatibility entries are explicitly counted under `legacy.*`.
- request-AC4 -> This task. Proof: the compatibility translator and its dynamic regex handling remain unchanged and locale regression tests pass.
- request-AC5 -> This task. Proof: DOM/regex removal is deliberately gated because the measured remainder is non-zero.
- request-AC6 -> This task. Proof: `logics/i18n/contract.json` exposes both governed catalogs without diagnostics.
- request-AC7 -> This task. Proof: typecheck, lint, 30 focused tests, build, and contract validation passed for both committed waves.
