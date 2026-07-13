## item_669_migrate_runtime_text_translation_to_the_shared_semantic_key_i18n_contract - Migrate runtime text translation to the shared semantic key i18n contract
> From version: 1.18.1
> Schema version: 1.0
> Status: In progress
> Understanding: 90%
> Confidence: 85%
> Progress: 20%
> Complexity: High
> Theme: Operator workflow and runtime integration
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
Replace translation of already-rendered English text with semantic translation keys resolved at render time.
Move English and French values into governed JSON catalogs without attempting a risky all-at-once rewrite.
Retire the legacy text and DOM translation paths only after screen-level coverage is demonstrated.

# Scope
- In:
  - one coherent delivery slice from the source request
- Out:
  - unrelated sibling slices that should stay in separate backlog items instead of widening this doc

# Acceptance criteria
- AC1: New and migrated UI paths resolve stable semantic keys at render time and do not depend on English visible text identity.
- AC2: English and French JSON catalogs pass schema, key, value, and named-placeholder parity validation under the shared contract.
- AC3: Migration is delivered in bounded screen/domain slices with the legacy bridge retained only for explicitly measured unmigrated coverage.
- AC4: Dynamic validation, catalog import/export, onboarding, and controller messages preserve their data interpolation and locale behavior.
- AC5: The DOM/text translator and regex compatibility layer are removed only after no production path or regression test depends on them.
- AC6: The viewer exposes the declared semantic catalogs and reports no contract diagnostics.
- AC7: Existing focused tests plus lint, typecheck, build, and contract validation pass after every migration wave.

# AC Traceability
- request-AC1 -> This backlog slice. Proof: AC1: New and migrated UI paths resolve stable semantic keys at render time and do not depend on English visible text identity.
- request-AC2 -> This backlog slice. Proof: AC2: English and French JSON catalogs pass schema, key, value, and named-placeholder parity validation under the shared contract.
- request-AC3 -> This backlog slice. Proof: AC3: Migration is delivered in bounded screen/domain slices with the legacy bridge retained only for explicitly measured unmigrated coverage.
- request-AC4 -> This backlog slice. Proof: AC4: Dynamic validation, catalog import/export, onboarding, and controller messages preserve their data interpolation and locale behavior.
- request-AC5 -> This backlog slice. Proof: AC5: The DOM/text translator and regex compatibility layer are removed only after no production path or regression test depends on them.
- request-AC6 -> This backlog slice. Proof: AC6: The viewer exposes the declared semantic catalogs and reports no contract diagnostics.
- request-AC7 -> This backlog slice. Proof: AC7: Existing focused tests plus lint, typecheck, build, and contract validation pass after every migration wave.

# Decision framing
- Product framing: Not needed
- Product signals: (none detected)
- Product follow-up: No product brief follow-up is expected based on current signals.
- Architecture framing: Not needed
- Architecture signals: (none detected)
- Architecture follow-up: No architecture decision follow-up is expected based on current signals.

# Links
- Product brief(s): (none yet)
- Architecture decision(s): (none yet)
- Request: `logics/request/req_165_migrate_runtime_text_translation_to_the_shared_semantic_key_i18n_contract.md`
- Primary task(s): (none yet)

# AI Context
- Summary: Migrate runtime text translation to the shared semantic key i18n contract
- Keywords: backlog-groom, request, migrate runtime text translation to the shared semantic key i18n contract, bounded slice
- Use when: Use when implementing or reviewing the delivery slice for Migrate runtime text translation to the shared semantic key i18n contract.
- Skip when: Skip when the change is unrelated to this delivery slice or its linked request.

# Priority
- Priority: Medium
- Rationale: Default until groomed.

# Notes
- Hybrid rationale: Derived from request `req_165_migrate_runtime_text_translation_to_the_shared_semantic_key_i18n_contract` and kept bounded to one coherent delivery slice.
- Source file: `logics/request/req_165_migrate_runtime_text_translation_to_the_shared_semantic_key_i18n_contract.md`.
- Generated locally by logics-manager.

# Tasks
- `task_162_migrate_runtime_text_translation_to_the_shared_semantic_key_i18n_contract`
