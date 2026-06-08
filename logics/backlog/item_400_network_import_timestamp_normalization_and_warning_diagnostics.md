## item_400_network_import_timestamp_normalization_and_warning_diagnostics - Network import timestamp normalization and warning diagnostics
> From version: 0.9.16
> Status: Done
> Understanding: 98%
> Confidence: 95%
> Progress: 100%
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

# AC Traceability
- request-AC1 -> This backlog slice. Evidence needed: persistence load path no longer throws when storage read access throws; safe fallback still applies.
- request-AC2 -> This backlog slice. Evidence needed: persisted/exported `appVersion` is synchronized with `package.json` version and no longer drifts.
- request-AC3 -> This backlog slice. Evidence needed: imported malformed network timestamps are normalized/fixed automatically; import succeeds with explicit warning(s).
- request-AC4 -> This backlog slice. Evidence needed: `saveState` preserves `createdAtIso` without requiring a full payload migration parse on each write.
- request-AC5 -> This backlog slice. Evidence needed: CSV export neutralizes formula-leading values to prevent spreadsheet formula execution.
- request-AC6 -> This backlog slice. Evidence needed: JSON export download remains reliable with safe URL revoke timing.
- request-AC7 -> This backlog slice. Evidence needed: all updated tests pass in CI-equivalent local validation.
- request-AC1 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC2 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC3 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC4 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC5 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC6 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC7 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
