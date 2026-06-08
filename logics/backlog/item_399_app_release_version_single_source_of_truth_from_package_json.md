## item_399_app_release_version_single_source_of_truth_from_package_json - App release version single source of truth from package.json
> From version: 0.9.16
> Status: Done
> Understanding: 95%
> Confidence: 92%
> Progress: 100%
> Complexity: Low-Medium
> Theme: Release metadata consistency across UI and persistence/export
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
`APP_RELEASE_VERSION` drift from `package.json` version creates metadata inconsistency in persisted/exported data and UI version reporting.

# Scope
- In:
  - Derive app release version metadata from `package.json` as the single source of truth.
  - Remove or neutralize duplicate manual version sources that can drift.
  - Keep current version rendering and persistence/export contracts intact.
- Out:
  - Release automation pipeline redesign.
  - New semantic-versioning policies.

# Acceptance criteria
- Persisted/exported `appVersion` always matches `package.json` version.
- Version source duplication no longer allows drift.
- Regression coverage validates version sync contract.

# Priority
- Impact: High.
- Urgency: High.

# Notes
- Dependencies: `req_077`.
- Blocks: `item_404`.
- Related AC: AC2.
- References:
  - `logics/request/req_077_review_followups_persistence_version_sync_import_normalization_and_export_hardening.md`
  - `package.json`
  - `src/adapters/persistence/localStorage.ts`
  - `src/adapters/portability/networkFile.ts`


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
