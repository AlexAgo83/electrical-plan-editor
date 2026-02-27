## item_401_persistence_save_state_created_at_stability_without_full_payload_reparse - Persistence saveState createdAt stability without full payload re-parse
> From version: 0.9.16
> Understanding: 95%
> Confidence: 90%
> Progress: 100%
> Complexity: Medium
> Theme: Save-path efficiency while preserving createdAt metadata continuity
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
Current save path re-reads/parses persisted payload on each write to recover `createdAtIso`, adding avoidable overhead and complexity.

# Scope
- In:
  - Remove repeated full payload parse dependency in save path.
  - Preserve stable `createdAtIso` semantics across updates.
  - Keep save behavior and migration compatibility unchanged.
- Out:
  - Broad persistence architecture refactor.
  - New metadata model beyond current schema.

# Acceptance criteria
- saveState no longer performs full payload migration parse per write for `createdAtIso`.
- `createdAtIso` continuity is preserved across successive saves.
- Regression coverage validates both efficiency contract and metadata stability.

# Priority
- Impact: Medium.
- Urgency: Medium.

# Notes
- Dependencies: `req_077`, `item_398`.
- Blocks: `item_404`.
- Related AC: AC4.
- References:
  - `logics/request/req_077_review_followups_persistence_version_sync_import_normalization_and_export_hardening.md`
  - `src/adapters/persistence/localStorage.ts`
  - `src/adapters/persistence/migrations.ts`
  - `src/tests/persistence.localStorage.spec.ts`

