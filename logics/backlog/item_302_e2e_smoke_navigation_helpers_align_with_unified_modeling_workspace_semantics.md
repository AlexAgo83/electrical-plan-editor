## item_302_e2e_smoke_navigation_helpers_align_with_unified_modeling_workspace_semantics - E2E Smoke Navigation Helpers Align with Unified Modeling Workspace Semantics
> From version: 0.9.2
> Understanding: 96%
> Confidence: 95%
> Progress: 100%
> Complexity: Medium
> Theme: E2E helper contract alignment after Modeling/Analysis merge
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
After the `Modeling`/`Analysis` merge, some e2e smoke helpers still expose pre-merge semantics (for example a helper that accepts `"analysis"` while effectively always navigating through `Modeling`). This creates semantic drift and weakens regression detection because tests may pass without actually verifying the intended navigation behavior.

# Scope
- In:
  - Align smoke/e2e workspace navigation helpers with the current unified `Modeling` UX semantics.
  - Remove or rename ambiguous helper contracts that imply a top-level `Analysis` menu target.
  - Keep smoke scenarios readable when analysis-oriented flows are exercised through unified `Modeling` panels.
  - Update related e2e assertions/messages where helper semantics change.
- Out:
  - Functional navigation changes in the app UI (product behavior already defined by `req_048`).
  - Broader e2e architecture refactor beyond helper semantic cleanup.

# Acceptance criteria
- E2E smoke helpers no longer depend on a non-existent top-level `Analysis` menu entry.
- Helper naming/contract matches actual unified workspace behavior.
- Smoke scenarios remain readable and deterministic after helper updates.

# Priority
- Impact: High.
- Urgency: High.

# Notes
- Dependencies: `req_049`.
- Blocks: item_305.
- Related AC: AC1, AC5, AC6.
- Delivery: completed via `tests/e2e/smoke.spec.ts` helper contract cleanup (`openModelingWorkspace`) and removal of misleading `"analysis"` helper parameter contract in smoke flows.
- References:
  - `logics/request/req_049_global_review_follow_up_test_hardening_for_unified_modeling_navigation_e2e_selector_resilience_and_table_filter_clear_regression_coverage.md`
  - `tests/e2e/smoke.spec.ts`
  - `playwright.config.ts`
