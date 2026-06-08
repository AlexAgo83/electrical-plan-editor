## item_402_csv_export_formula_injection_neutralization_contract - CSV export formula-injection neutralization contract
> From version: 0.9.16
> Status: Done
> Understanding: 96%
> Confidence: 93%
> Progress: 100%
> Complexity: Medium
> Theme: Spreadsheet-export safety hardening
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
CSV export currently risks spreadsheet formula execution when cell values start with formula-trigger prefixes (`=`, `+`, `-`, `@`).

# Scope
- In:
  - Neutralize formula-leading values in CSV serialization.
  - Keep normal text/number readability and backward-compatible output.
  - Ensure neutralization policy is deterministic and covered by tests.
- Out:
  - CSV dialect redesign.
  - New export format work.

# Acceptance criteria
- Formula-leading values are neutralized in exported CSV.
- Regular non-formula values remain readable and unchanged in intent.
- Regression tests cover all targeted trigger prefixes.

# Priority
- Impact: Medium-High.
- Urgency: Medium.

# Notes
- Dependencies: `req_077`.
- Blocks: `item_404`.
- Related AC: AC5.
- References:
  - `logics/request/req_077_review_followups_persistence_version_sync_import_normalization_and_export_hardening.md`
  - `src/app/lib/csv.ts`
  - `src/tests/csv.export.spec.ts`


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
