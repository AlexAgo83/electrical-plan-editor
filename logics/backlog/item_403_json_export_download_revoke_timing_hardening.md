## item_403_json_export_download_revoke_timing_hardening - JSON export download revoke timing hardening
> From version: 0.9.16
> Understanding: 94%
> Confidence: 90%
> Progress: 0%
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

