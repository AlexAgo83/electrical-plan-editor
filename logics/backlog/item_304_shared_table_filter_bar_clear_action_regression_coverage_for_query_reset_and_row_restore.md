## item_304_shared_table_filter_bar_clear_action_regression_coverage_for_query_reset_and_row_restore - Shared TableFilterBar Clear Action Regression Coverage for Query Reset and Row Restore
> From version: 0.9.2
> Understanding: 98%
> Confidence: 96%
> Progress: 100%
> Complexity: Medium
> Theme: Regression coverage for shared table filter clear UX
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
The shared `TableFilterBar` now includes a clear (`×`) action in the filter text field, but there is no explicit regression test covering this shared behavior. Because the component is reused across multiple tables, a regression would have broad UI impact.

# Scope
- In:
  - Add explicit regression coverage for the shared table filter clear control (`×`).
  - Cover disabled state when query is empty.
  - Cover clearing a non-empty query and restoring table rows.
  - Cover visible filtering outcome and entry-count footer update after clear on at least one representative table.
  - Prefer testing via a real shared-component consumer panel (not a mock-only test).
- Out:
  - New filter features (debounce, advanced search syntax, persisted filters).
  - Visual redesign of the filter bar beyond testability-driven adjustments.

# Acceptance criteria
- Tests explicitly assert clear-button presence and disabled state on empty query.
- Tests assert that clicking clear resets the query and restores filtered rows.
- Tests assert entry-count footer (where present) updates correctly after clear.
- Regression coverage runs in CI (`test:ci`) without flaky timing assumptions.

# Priority
- Impact: Medium-High.
- Urgency: High.

# Notes
- Dependencies: `req_049`.
- Blocks: item_305.
- Related AC: AC3, AC6.
- Delivery: completed with explicit regression coverage in `src/tests/app.ui.list-ergonomics.spec.tsx` for clear-button presence/disabled state, query reset, row restore, and footer-count consistency.
- References:
  - `logics/request/req_049_global_review_follow_up_test_hardening_for_unified_modeling_navigation_e2e_selector_resilience_and_table_filter_clear_regression_coverage.md`
  - `src/app/components/workspace/TableFilterBar.tsx`
  - `src/app/styles/tables.css`
  - `src/tests/app.ui.list-ergonomics.spec.tsx`
