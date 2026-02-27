## item_400_network_import_timestamp_normalization_and_warning_diagnostics - Network import timestamp normalization and warning diagnostics
> From version: 0.9.16
> Understanding: 98%
> Confidence: 95%
> Progress: 0%
> Complexity: Medium
> Theme: Import robustness for malformed network timestamp fields
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
Malformed imported `network.createdAt` and `network.updatedAt` values can pass through without normalization, reducing reliability and consistency of imported state.

# Scope
- In:
  - Detect invalid/malformed network timestamps during import parsing/conflict resolution.
  - Normalize to deterministic safe ISO values without rejecting otherwise valid payloads.
  - Emit explicit import warning diagnostics when normalization is applied.
  - Enforce deterministic normalization policy:
    - capture a single `importBaseIso` per import,
    - invalid `createdAt` with valid `updatedAt` => `createdAt = updatedAt`,
    - invalid `updatedAt` with valid `createdAt` => `updatedAt = createdAt`,
    - both invalid => `createdAt = updatedAt = importBaseIso`,
    - both valid and `updatedAt < createdAt` => `updatedAt = createdAt`.
- Out:
  - Full import diagnostics UI redesign.
  - Strict rejection-only policy for malformed timestamps.

# Acceptance criteria
- Malformed network timestamps are normalized automatically during import.
- Import still succeeds for otherwise valid payloads.
- Warning diagnostics explicitly report normalization events.
- Normalized outputs respect `updatedAt >= createdAt` invariant after import.

# Priority
- Impact: High.
- Urgency: High.

# Notes
- Dependencies: `req_077`.
- Blocks: `item_404`.
- Related AC: AC3.
- References:
  - `logics/request/req_077_review_followups_persistence_version_sync_import_normalization_and_export_hardening.md`
  - `src/adapters/portability/networkFile.ts`
  - `src/core/schema.ts`
  - `src/tests/portability.network-file.spec.ts`
