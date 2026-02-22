## item_091_csv_export_blob_url_cleanup_timing_hardening - CSV Export Blob URL Cleanup Timing Hardening
> From version: 0.5.0
> Understanding: 98%
> Confidence: 95%
> Progress: 0%
> Complexity: Low
> Theme: Browser Compatibility Reliability
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
CSV export currently revokes the Blob object URL immediately after triggering download, which can be fragile on some browser implementations.

# Scope
- In:
  - Defer `URL.revokeObjectURL(...)` cleanup after download click.
  - Keep CSV content formatting, filename normalization, and download UX unchanged.
  - Keep DOM cleanup (`link.remove()`) behavior intact.
- Out:
  - CSV schema changes.
  - CSV import/export feature expansion.

# Acceptance criteria
- CSV export still downloads correctly with unchanged content/filename behavior.
- Blob URL cleanup is deferred (not immediate same-tick revoke).
- Helper remains SSR-safe (no-op without `window`/`document`).
- Tests cover URL creation + deferred cleanup flow with mocks/timers.

# Priority
- Impact: Medium (browser compatibility hardening).
- Urgency: Medium (low-risk robustness fix).

# Notes
- Blocks: item_093.
- Related AC: AC4, AC6.
- References:
  - `logics/request/req_015_runtime_robustness_persistence_empty_workspace_semantics_and_ci_release_safety.md`
  - `src/app/lib/csv.ts`
  - `src/tests/`

