## item_415_generate_layout_aggressive_second_untangle_pass - Generate layout aggressive second untangle pass
> From version: 0.9.18
> Status: Draft
> Understanding: 97%
> Confidence: 95%
> Progress: 0%
> Complexity: Medium
> Theme: Local-minimum escape strategy for crossing-heavy topologies
> Reminder: Update status/understanding/confidence/progress and linked task references when you edit this doc.

# Problem
Even with regular refinement, some dense graphs remain crossing-heavy because the process plateaus too early and cannot escape local minima.

# Scope
- In:
  - add a second, more aggressive untangle phase after standard refinement plateau;
  - trigger second pass only when it can improve or preserve best score;
  - keep deterministic selection and guard against oscillation.
- Out:
  - user-authored bend-point tooling;
  - global solver replacement.

# Acceptance criteria
- AC1: A second untangle pass is available and conditionally executed after plateau.
- AC2: The pass is deterministic and never worsens retained best score.
- AC3: Regression tests cover crossing-heavy fixtures for this pass.

# Priority
- Impact: High.
- Urgency: Medium-High.

# Notes
- Dependencies: `req_080`, `item_413`, `item_414`.
- Blocks: `item_416`, `task_073`.
- Related AC: `AC1`, `AC3`, `AC4`, `AC5`.
- References:
  - `logics/request/req_080_2d_generate_layout_crossing_reduction_reprioritized_scoring_and_aggressive_untangle_pass.md`
  - `src/app/lib/layout/postprocess.ts`
  - `src/app/lib/layout/generation.ts`
  - `src/tests/core.layout.spec.ts`
