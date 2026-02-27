## item_398_persistence_load_guard_when_storage_read_throws_and_safe_fallback_continuity - Persistence load guard when storage read throws and safe fallback continuity
> From version: 0.9.16
> Understanding: 95%
> Confidence: 91%
> Progress: 0%
> Complexity: Medium
> Theme: Persistence resilience against storage read exceptions
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
If storage read access throws during state load, the persistence path can break hard and compromise app bootstrap reliability.

# Scope
- In:
  - Ensure load path catches storage read exceptions and never throws to app shell.
  - Preserve current fallback behavior (backup-first when available, then safe bootstrap state).
  - Keep existing error signaling semantics clear and deterministic.
- Out:
  - Persistence schema redesign.
  - New backup formats.

# Acceptance criteria
- Storage read exceptions during load no longer crash bootstrap.
- Existing fallback behavior remains functional and deterministic.
- Regression coverage validates thrown-read behavior.

# Priority
- Impact: High.
- Urgency: High.

# Notes
- Dependencies: `req_077`.
- Blocks: `item_404`.
- Related AC: AC1.
- References:
  - `logics/request/req_077_review_followups_persistence_version_sync_import_normalization_and_export_hardening.md`
  - `src/adapters/persistence/localStorage.ts`
  - `src/tests/persistence.localStorage.spec.ts`

