## req_079_ui_reliability_debt_reduction_and_app_controller_decomposition_continuation - UI reliability debt reduction and app controller decomposition continuation
> From version: 0.9.17
> Status: In Progress
> Understanding: 98%
> Confidence: 94%
> Complexity: High
> Theme: Architecture
> Reminder: Update status/understanding/confidence and references when you edit this doc.

# Needs
- Reduce the current UI test reliability debt where some heavy integration specs require targeted `10_000ms` timeout exceptions.
- Continue decomposing `AppController.tsx` to lower complexity and regression risk while preserving current behavior.

# Context
- The project explicitly tracks targeted `10_000ms` timeout exceptions as temporary debt in README.
- The main controller file remains very large (`src/app/AppController.tsx`, ~2700+ LOC), which increases review/debug cost.
- Recent delivery waves added features quickly; now a hardening/refactoring pass is needed to keep delivery speed sustainable.

# Objective
- Stabilize the slowest/most fragile UI tests using root-cause fixes (fixtures, waits, selectors, setup), not blanket timeout inflation.
- Reduce `AppController` responsibility surface by extracting cohesive orchestration slices/hooks with unchanged UX contracts.

# Scope
- In:
  - identify top slow/flaky UI specs from current reporting lanes;
  - apply targeted reliability fixes and reduce/avoid 10s timeout exceptions;
  - split `AppController` responsibilities into smaller modules/hooks where boundaries are already clear;
  - keep behavior parity and existing shortcuts/modal/export contracts intact.
- Out:
  - redesign of feature behavior;
  - broad architectural rewrite of store/domain layers;
  - speculative refactors without measurable reliability/maintainability gain.

# Locked execution decisions
- Execution order: `item_409 -> item_410 -> item_411 -> item_412`.
- Timeout debt policy:
  - `0` new `10_000ms` timeout exception without explicit technical rationale.
  - target reduction: at least `30%` of current targeted `10_000ms` timeout exceptions in this wave.
  - every remaining exception must include `why` + retirement/exit plan.
- AppController decomposition priority:
  - first extraction slice is `modals + save/export actions` orchestration, with behavior parity checks.
- Closure evidence policy:
  - `item_412` completion requires both:
  - AC matrix in task/report artifacts.
  - explicit `Evidence` block in this request (commands + file refs + commit refs).

# Acceptance criteria
- AC1: A dedicated reliability pass is completed on top slow UI specs with documented root-cause fixes.
- AC2: No new UI timeout increase is introduced without explicit rationale in task/report notes.
- AC3: Existing targeted 10s timeout debt is reduced by at least `30%` in this wave, and every remaining exception is explicitly justified with an exit plan.
- AC4: `AppController.tsx` is decomposed further (measurable LOC/concern reduction) without behavior regression, starting with `modals + save/export actions` orchestration slice.
- AC5: `lint`, `typecheck`, targeted UI tests, and `test:ci:ui` pass after refactor/hardening changes.
- AC6: Logics docs (request/backlog/task) are updated with status/progress and validation evidence, including an `Evidence` block in this request.

# Validation and regression safety
- `npm run -s lint`
- `npm run -s typecheck`
- `npm run -s test:ci:ui`
- targeted runs for affected specs from slow-top reporting
- `python3 logics/skills/logics-doc-linter/scripts/logics_lint.py`

# Definition of Ready (DoR)
- [x] Problem statement is explicit and user impact is clear.
- [x] Scope boundaries (in/out) are explicit.
- [x] Acceptance criteria are testable.
- [x] Dependencies and known risks are listed.

# Risks
- Refactor can accidentally alter behavior if extraction boundaries are not contract-tested.
- Overfitting tests to current internals can make future refactors harder.
- Time spent on reliability can drift without strict top-slow prioritization.

# Evidence
- Wave 1 (`item_409`) targeted slow/flaky UI tests and removed explicit timeout overrides:
  - baseline scan (pre-change): `rg -n "},\\s*10_000\\)|,\\s*10_000\\)|15000|15_000" src/tests` -> `15` explicit timeout matches.
  - post-change scan: `rg -n "10_000|15_000|15000" src/tests` -> no matches.
- Slow-top diagnostic executed:
  - `npm run -s test:ci:ui:slow-top` -> top-10 slow tests all below `5s` in this wave snapshot.
- Regression validation executed:
  - targeted: `npx vitest run` on touched UI specs (`delete confirmations`, `creation-flow`, `navigation`, `settings`, `list ergonomics`, `wire free mode`, `network summary polish`, `undo/redo`) -> pass.
  - lane: `npm run -s test:ci:ui` -> pass (`30` files, `193` tests).
  - safety: `npm run -s typecheck` -> pass.

# Delivery status
- Status: in progress.
- Task: `logics/tasks/task_072_super_orchestration_delivery_execution_for_req_079_with_validation_gates.md`.

# Backlog
- [item_409_ui_slow_test_stabilization_wave_for_top_flaky_specs](../backlog/item_409_ui_slow_test_stabilization_wave_for_top_flaky_specs.md)
- [item_410_ui_timeout_debt_governance_and_rationale_enforcement](../backlog/item_410_ui_timeout_debt_governance_and_rationale_enforcement.md)
- [item_411_app_controller_decomposition_continuation_by_orchestration_slice_extraction](../backlog/item_411_app_controller_decomposition_continuation_by_orchestration_slice_extraction.md)
- [item_412_req_079_closure_validation_and_traceability_matrix](../backlog/item_412_req_079_closure_validation_and_traceability_matrix.md)
