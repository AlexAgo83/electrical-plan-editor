## item_303_e2e_table_assertions_use_resilient_column_targeting_instead_of_brittle_cell_indexes - E2E Table Assertions Use Resilient Column Targeting Instead of Brittle Cell Indexes
> From version: 0.9.2
> Understanding: 97%
> Confidence: 95%
> Progress: 0%
> Complexity: Medium
> Theme: E2E selector hardening against table layout evolution
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
Recent UI improvements (for example `Wires` table `Endpoints` split into `Endpoint A` / `Endpoint B`) shifted table column indexes and broke smoke e2e assertions using `td.nth(...)`. This pattern is brittle and likely to break again on future table readability changes.

# Scope
- In:
  - Replace brittle e2e table assertions based on raw cell indexes for critical smoke assertions.
  - Introduce more resilient targeting strategy (header-driven lookup or helper utilities) where practical.
  - Apply hardening at minimum to smoke assertions already affected by `Wires` column layout changes.
  - Keep selectors readable and maintainable (avoid opaque over-abstraction).
- Out:
  - Full rewrite of all e2e selectors in the project.
  - App UI structural changes solely to satisfy tests unless a minimal testability hook is justified.

# Acceptance criteria
- Known smoke assertions impacted by table column changes no longer depend on fragile `td.nth(...)` indexes.
- E2E smoke remains green after table readability changes covered by `req_047`.
- Selector strategy is documented in code comments/helpers when non-obvious.

# Priority
- Impact: High.
- Urgency: High.

# Notes
- Dependencies: `req_049`.
- Blocks: item_305.
- Related AC: AC2, AC5, AC6.
- References:
  - `logics/request/req_049_global_review_follow_up_test_hardening_for_unified_modeling_navigation_e2e_selector_resilience_and_table_filter_clear_regression_coverage.md`
  - `tests/e2e/smoke.spec.ts`
  - `src/tests/app.ui.list-ergonomics.spec.tsx`
  - `logics/request/req_047_table_readability_endpoint_column_split_analysis_wire_name_subrows_and_filtered_entry_count_footers.md`
