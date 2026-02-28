## item_413_generate_layout_postprocess_radius_and_iteration_budget_increase - Generate layout postprocess radius and iteration budget increase
> From version: 0.9.18
> Status: Draft
> Understanding: 97%
> Confidence: 95%
> Progress: 0%
> Complexity: Medium
> Theme: 2D layout crossing reduction baseline hardening
> Reminder: Update status/understanding/confidence/progress and linked task references when you edit this doc.

# Problem
The current `Generate` postprocess remains too conservative on dense graphs, often stalling in local minima before reaching acceptable crossing reduction.

# Scope
- In:
  - increase local move exploration radius in overlap/crossing refinement;
  - increase bounded iteration budget with deterministic stop conditions;
  - preserve deterministic tie-breakers and runtime caps.
- Out:
  - scoring comparator redesign;
  - second-pass untangling policy.

# Acceptance criteria
- AC1: Postprocess explores broader candidate moves than current baseline.
- AC2: Iteration budget is increased with explicit deterministic bounds.
- AC3: Runtime remains bounded and deterministic on representative fixtures.

# Priority
- Impact: High.
- Urgency: High.

# Notes
- Dependencies: `req_080`.
- Blocks: `item_416`, `task_073`.
- Related AC: `AC1`, `AC4`, `AC5`.
- References:
  - `logics/request/req_080_2d_generate_layout_crossing_reduction_reprioritized_scoring_and_aggressive_untangle_pass.md`
  - `src/app/lib/layout/postprocess.ts`
  - `src/app/lib/layout/generation.ts`
  - `src/tests/core.layout.spec.ts`
