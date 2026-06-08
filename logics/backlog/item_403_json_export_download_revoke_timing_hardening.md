## item_403_json_export_download_revoke_timing_hardening - JSON export download revoke timing hardening
> From version: 0.9.16
> Status: Done
> Understanding: 94%
> Confidence: 90%
> Progress: 100%
> Complexity: Low-Medium
> Theme: Browser-timing robustness for JSON file downloads
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
Immediate object-URL revocation after click can cause intermittent JSON download failures on some browser timing paths.

# Scope
- In:
  - Defer object URL revocation safely after download trigger.
  - Keep current filename/content and action flow behavior unchanged.
  - Add regression coverage for revoke timing contract.
- Out:
  - New download APIs.
  - Changes to export payload schema/content.

# Acceptance criteria
- JSON export downloads remain reliable with deferred URL revoke timing.
- Existing export flow behavior remains unchanged.
- Automated tests cover the timing-safe revoke contract.

# Priority
- Impact: Medium.
- Urgency: Medium.

# Notes
- Dependencies: `req_077`.
- Blocks: `item_404`.
- Related AC: AC6.
- References:
  - `logics/request/req_077_review_followups_persistence_version_sync_import_normalization_and_export_hardening.md`
  - `src/app/hooks/useNetworkImportExport.ts`
  - `src/tests/`


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
