## req_080_2d_generate_layout_crossing_reduction_reprioritized_scoring_and_aggressive_untangle_pass - 2D generate layout crossing reduction with reprioritized scoring and aggressive untangle pass
> From version: 0.9.18
> Status: Draft
> Understanding: 97%
> Confidence: 95%
> Complexity: Medium
> Theme: 2D Representation Reliability
> Reminder: Update status/understanding/confidence and references when you edit this doc.

# Needs
- Improve the `Generate` action in the 2D plan so segment crossings are reduced further in dense topologies.
- Fix remaining cases where local post-processing stalls because move candidates are too conservative.
- Add a stronger fallback untangling phase when the regular overlap-resolution pass reaches a local minimum.

# Context
- The current generation pipeline (`createNodePositionMap` + `resolveVisualOverlaps`) still leaves visible segment crossings on some user topologies.
- Current postprocess search radius and iteration budget can be insufficient in crowded clusters, causing crossing-heavy local minima.
- Current scoring/ranking order does not prioritize crossings as the first elimination target, which can preserve visually problematic solutions.

# Objective
- Increase crossing reduction effectiveness of the `Generate` flow while keeping deterministic behavior and acceptable runtime.
- Prioritize topology readability (crossing minimization) before secondary visual optimization criteria.
- Preserve existing interaction contracts (zoom/pan/select/drag/focus/export/import) and layout persistence behavior.

# Scope
- In:
  - increase nudge radius and iteration budget in the postprocess search;
  - reprioritize candidate ranking to treat segment crossings as the first optimization dimension;
  - introduce a second, more aggressive untangling pass triggered after the standard pass;
  - add regression tests covering dense topologies that currently keep avoidable crossings.
- Out:
  - manual routing editor or user-authored bend-point editing;
  - full global optimal solver replacement;
  - unrelated UI redesign changes.

# Locked execution decisions
- Decision 1: Extend local move exploration beyond current conservative offsets and increase convergence budget.
- Decision 2: Reorder scoring/ranking so crossing count is evaluated before other penalties.
- Decision 3: Add a secondary aggressive untangling phase to escape local minima when standard refinement plateaus.

# Acceptance criteria
- AC1: On representative dense fixtures used in tests, `Generate` produces strictly fewer crossings than the current baseline.
- AC2: Candidate ranking places crossing count as the highest-priority comparator in layout refinement.
- AC3: A second aggressive untangling pass executes when needed and improves or preserves best score deterministically.
- AC4: Existing layout-related tests and CI quality gates pass after implementation (`lint`, `typecheck`, `test:ci`).
- AC5: New/updated tests explicitly guard against regression for crossing-heavy topologies.

# Validation and regression safety
- `npm run -s lint`
- `npm run -s typecheck`
- `npm run -s test:ci`
- targeted layout tests around `generation`, `postprocess`, and `scoring`
- `python3 logics/skills/logics-doc-linter/scripts/logics_lint.py`

# Definition of Ready (DoR)
- [x] Problem statement is explicit and user impact is clear.
- [x] Scope boundaries (in/out) are explicit.
- [x] Acceptance criteria are testable.
- [x] Dependencies and known risks are listed.

# Risks
- Larger search space can increase generation runtime on big networks if not bounded.
- Crossing-first ranking can worsen secondary aesthetics (spacing/label clearance) if balance rules are too strict.
- Aggressive untangling can introduce oscillation/regression if deterministic tie-breakers are incomplete.

# Backlog
- To create from this request:
  - `item_413_generate_layout_postprocess_radius_and_iteration_budget_increase.md`
  - `item_414_generate_layout_crossing_first_scoring_reprioritization.md`
  - `item_415_generate_layout_aggressive_second_untangle_pass.md`
  - `item_416_req_080_validation_matrix_and_closure_traceability.md`

# References
- `src/app/lib/layout/grid.ts`
- `src/app/lib/layout/postprocess.ts`
- `src/app/lib/layout/scoring.ts`
- `src/app/lib/layout/generation.ts`
- `src/app/AppController.tsx`
- `src/tests/core.layout.spec.ts`
