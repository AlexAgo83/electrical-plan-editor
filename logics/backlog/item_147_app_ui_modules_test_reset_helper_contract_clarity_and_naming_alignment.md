## item_147_app_ui_modules_test_reset_helper_contract_clarity_and_naming_alignment - appUiModules Test Reset Helper Contract Clarity and Naming Alignment
> From version: 0.5.10
> Understanding: 99%
> Confidence: 97%
> Progress: 100%
> Complexity: Low
> Theme: Make appUiModules Test Reset Semantics Explicit
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
`resetAppUiModulesTestControls()` resets only part of the mutable test state (`mode`, `delay`) while eager-registry setup/reset is handled separately in shared test setup, making the reset contract ambiguous.

# Scope
- In:
  - Clarify naming/behavior/documentation of reset helpers (partial vs full reset), or provide a clearer complete reset contract.
  - Preserve existing test reliability and lazy-loading regression semantics.
- Out:
  - Registry architecture redesign.
  - Broad test framework changes.

# Acceptance criteria
- Reset helper contract is clearer and less misleading.
- Existing tests remain stable and readable.
- Touched tests pass.

# Priority
- Impact: Low (test maintainability).
- Urgency: Medium.

# Notes
- Dependencies: `req_024` centralized cleanup baseline.
- Blocks: item_149.
- Related AC: AC3, AC5, AC6.
- References:
  - `src/app/components/appUiModules.tsx`
  - `src/tests/setup.ts`
  - `src/tests/app.ui.lazy-loading-regression.spec.tsx`
  - `logics/request/req_025_post_req_024_review_followup_network_summary_2d_accessibility_legacy_interaction_mode_cleanup_test_reset_contract_clarity_and_perf_guardrail_strategy.md`
