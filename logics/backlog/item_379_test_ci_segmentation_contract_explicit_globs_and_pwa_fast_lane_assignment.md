## item_379_test_ci_segmentation_contract_explicit_globs_and_pwa_fast_lane_assignment - Test CI segmentation contract with explicit globs and `pwa.*` fast-lane assignment
> From version: 0.9.11
> Understanding: 95%
> Confidence: 92%
> Progress: 0%
> Complexity: Medium
> Theme: Deterministic segmented test command boundaries
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
Current segmentation (`test:ci:fast` vs `test:ci:ui`) is overly coupled to filename prefixes, making command semantics fragile and maintenance-prone.

# Scope
- In:
  - Define explicit segmentation boundaries using stable globs/domain ownership.
  - Keep `pwa.*` tests in the fast/core lane by default.
  - Ensure segmented commands stay complementary to canonical `test:ci`.
  - Document segmentation policy in README.
- Out:
  - Replacing the canonical `test:ci` aggregate command
  - Introducing complex tag-based test infrastructure in V1

# Acceptance criteria
- `test:ci:fast` and `test:ci:ui` rely on explicit documented globs/contracts.
- `pwa.*` tests run in `test:ci:fast`.
- Segmentation docs clearly state complements vs canonical command roles.

# Priority
- Impact: Medium-High.
- Urgency: High.

# Notes
- Dependencies: `req_069`.
- Blocks: `item_382`, `task_067`.
- Related AC: AC2, AC3, AC6.
- References:
  - `logics/request/req_069_ci_observability_execution_order_test_segmentation_and_ui_test_reliability.md`
  - `package.json`
  - `README.md`
  - `src/tests/pwa.header-actions.spec.tsx`

