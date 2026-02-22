## item_132_strict_navigation_test_helper_contract_hardening_without_auto_repair - Strict Navigation Test Helper Contract Hardening Without Auto-Repair
> From version: 0.5.7
> Understanding: 99%
> Confidence: 97%
> Progress: 0%
> Complexity: Low
> Theme: Make Strict Navigation Helpers Truly Strict for Better Regression Signal
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
The new strict navigation helper variants improve clarity, but `switchSubScreen(..., "strict")` still auto-switches to the modeling screen when the secondary nav row is absent. This partially undermines the strict-mode contract and can still mask context/navigation regressions.

# Scope
- In:
  - Remove hidden auto-repair behavior from strict navigation helper variants.
  - Preserve drawer-aware variants for ergonomic tests.
  - Update touched tests to use explicit helper semantics where appropriate.
- Out:
  - Broad UI test helper redesign beyond strict-vs-drawer-aware contract hardening.
  - Navigation UX changes in production code.

# Acceptance criteria
- Strict helper variants do not auto-open drawers or auto-switch screen context.
- Drawer-aware variants remain available and explicit.
- Touched tests remain readable and pass after migration.

# Priority
- Impact: Medium (test signal quality and debugging clarity).
- Urgency: Medium (follow-up guardrail hardening).

# Notes
- Dependencies: `req_021` helper split baseline.
- Blocks: item_133.
- Related AC: AC5, AC6, AC7.
- References:
  - `logics/request/req_022_post_req_021_review_followup_real_lazy_chunking_no_active_network_compute_scoping_and_test_helper_contract_hardening.md`
  - `src/tests/helpers/app-ui-test-utils.tsx`
  - `src/tests/app.ui.inspector-shell.spec.tsx`
  - `src/tests/app.ui.workspace-shell-regression.spec.tsx`
  - `src/tests/app.ui.navigation-canvas.spec.tsx`
