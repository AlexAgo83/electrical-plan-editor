## item_414_generate_layout_crossing_first_scoring_reprioritization - Generate layout crossing-first scoring reprioritization
> From version: 0.9.18
> Status: Done
> Understanding: 97%
> Confidence: 95%
> Progress: 100%
> Complexity: Medium
> Theme: Scoring strategy for topology readability
> Reminder: Update status/understanding/confidence/progress and linked task references when you edit this doc.

# Problem
Current scoring order can retain visually poor layouts because crossings are not evaluated as the primary optimization dimension.

# Scope
- In:
  - reorder candidate comparator priority so crossing count is first;
  - keep deterministic secondary comparators for spacing and readability;
  - align scoring docs/tests with new comparator order.
- Out:
  - replacing the entire scoring model;
  - runtime-specific heuristic tuning unrelated to crossing-first policy.

# Acceptance criteria
- AC1: Scoring comparator places crossing count as highest-priority criterion.
- AC2: Secondary criteria are preserved and deterministic.
- AC3: Existing scoring/layout tests remain green with updated expectations.

# Priority
- Impact: High.
- Urgency: High.

# Notes
- Dependencies: `req_080`, `item_413`.
- Blocks: `item_416`, `task_073`.
- Related AC: `AC2`, `AC4`, `AC5`.
- References:
  - `logics/request/req_080_2d_generate_layout_crossing_reduction_reprioritized_scoring_and_aggressive_untangle_pass.md`
  - `src/app/lib/layout/scoring.ts`
  - `src/app/lib/layout/postprocess.ts`
  - `src/tests/core.layout.spec.ts`
