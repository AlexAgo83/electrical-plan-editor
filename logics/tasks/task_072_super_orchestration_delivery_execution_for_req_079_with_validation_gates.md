## task_072_super_orchestration_delivery_execution_for_req_079_with_validation_gates - Super orchestration delivery execution for req_079 with validation gates
> From version: 0.9.17
> Status: Done
> Understanding: 99%
> Confidence: 98%
> Progress: 100%
> Complexity: High
> Theme: Architecture
> Reminder: Update status/understanding/confidence/progress and dependencies/references when you edit this doc.

# Context
This super-orchestration task controls delivery of `req_079`:
- UI reliability debt reduction for slow/flaky integration specs.
- timeout debt governance enforcement.
- continuation of `AppController` decomposition by orchestration slice extraction.
- closure traceability and validation matrix synchronization.

The scope is cross-cutting (tests, controller architecture, and process evidence). It requires strict validation gates to avoid regressions in UI behavior while hardening reliability.

# Objective
- Deliver backlog `item_409` to `item_412` in a deterministic order with explicit quality gates.
- Reduce test-reliability debt without introducing blanket timeout inflation.
- Decompose `AppController` further while preserving current UX contracts.
- Produce auditable closure evidence for all `req_079` acceptance criteria.

# Scope
- In:
  - orchestration of `item_409`, `item_410`, `item_411`, and `item_412`;
  - sequencing, validation discipline, and evidence capture;
  - status synchronization across request/backlog/task docs.
- Out:
  - unrelated feature additions;
  - speculative large-scale architecture rewrite beyond selected controller slices.

# Request scope covered
- `logics/request/req_079_ui_reliability_debt_reduction_and_app_controller_decomposition_continuation.md`

# Backlog scope covered
- `logics/backlog/item_409_ui_slow_test_stabilization_wave_for_top_flaky_specs.md`
- `logics/backlog/item_410_ui_timeout_debt_governance_and_rationale_enforcement.md`
- `logics/backlog/item_411_app_controller_decomposition_continuation_by_orchestration_slice_extraction.md`
- `logics/backlog/item_412_req_079_closure_validation_and_traceability_matrix.md`

# Attention points (mandatory delivery discipline)
- No new timeout increase without explicit rationale linked in docs.
- Preserve behavior parity while extracting controller responsibilities.
- Maintain test assertion strength; do not trade coverage for speed.
- Keep traceability evidence concrete (commands, files, commits).

# Locked implementation decisions
- Execution order is fixed: `item_409 -> item_410 -> item_411 -> item_412`.
- Timeout debt target:
  - `0` new `10_000ms` exception without explicit rationale.
  - at least `30%` reduction of existing targeted `10_000ms` exceptions across this wave.
  - every remaining exception must include `why` + exit plan.
- AppController decomposition priority:
  - first extracted slice: `modals + save/export actions`.
- Closure evidence policy:
  - `item_412` is only complete if AC traceability exists in task artifacts and an `Evidence` block is added in `req_079`.

# Plan
- [x] 1. Baseline and prioritize top slow/flaky UI specs, then implement root-cause stabilizations (`item_409`)
- [x] 2. Apply timeout debt governance and rationale enforcement, including inventory/classification (`item_410`)
- [x] 3. Extract and integrate an `AppController` orchestration slice with behavior parity checks (`item_411`)
- [x] 4. Build req_079 closure traceability matrix and synchronize all linked docs (`item_412`)
- [x] FINAL: Update related Logics docs

# AC Traceability
- AC1 -> Reliability pass on top slow/flaky specs is delivered in Step 1. Proof: `item_409` done; `npm run -s test:ci:ui:slow-top` executed.
- AC2 -> Timeout governance policy and enforcement are delivered in Step 2. Proof: `scripts/quality/check-ui-timeout-governance.mjs` + CI/local integration.
- AC3 -> Timeout debt is reduced or explicitly justified through Steps 1-2. Proof: baseline `15` explicit timeout overrides -> current `0`; governance gate blocks reintroduction without policy-managed allowlist.
- AC4 -> `AppController` decomposition continuation is delivered in Step 3. Proof: extracted hooks `useConfirmDialogController` + `useAppControllerSaveExportActions`; `AppController` reduced from `2711` to `2637` lines.
- AC5 -> Validation gate commands pass through Step 4 closure checks. Proof: partial gates passed in Steps 1-3 (`npm run -s lint`, `npm run -s typecheck`, `npm run -s test:ci:segmentation:check`, `npm run -s quality:ui-timeout-governance`, `npm run -s test:ci:ui`).
- AC6 -> Request/backlog/task synchronization is delivered in Step 4 and FINAL step. Proof: statuses and evidence synchronized across `req_079`, `item_409..412`, and `task_072`.

# Req_079 AC Matrix
- AC1 (`req_079`) -> delivered by `item_409`. Evidence: UI slow-top report + stabilization diffs + timeout override removal.
- AC2 (`req_079`) -> delivered by `item_410`. Evidence: `scripts/quality/check-ui-timeout-governance.mjs`, CI/local integration.
- AC3 (`req_079`) -> delivered by `item_409` + `item_410`. Evidence: baseline `15` explicit overrides -> current `0` + governance gate enforcement.
- AC4 (`req_079`) -> delivered by `item_411`. Evidence: extracted hooks (`useConfirmDialogController`, `useAppControllerSaveExportActions`) and reduced `AppController` surface.
- AC5 (`req_079`) -> validated by gates. Evidence: `npm run -s lint`, `npm run -s typecheck`, targeted vitest runs, `npm run -s test:ci:ui`, `npm run -s quality:ui-timeout-governance`.
- AC6 (`req_079`) -> delivered by `item_412`. Evidence: synchronized statuses/traceability across request, backlog, and task docs with explicit request evidence block.

# Validation gates
## A. Minimum wave gate (after each implementation step)
- `npm run -s typecheck`
- targeted tests for touched scope
- `python3 logics/skills/logics-doc-linter/scripts/logics_lint.py` (if logics docs changed)

## B. Req_079 closure gate (Step 4 mandatory)
- `npm run -s lint`
- `npm run -s typecheck`
- `npm run -s test:ci:ui`
- targeted runs for affected specs from slow-top reporting
- `python3 logics/skills/logics-doc-linter/scripts/logics_lint.py`

# Validation
- `npm run -s lint`
- `npm run -s typecheck`
- `npm run -s test:ci:ui`
- targeted runs for affected specs from slow-top reporting
- `python3 logics/skills/logics-doc-linter/scripts/logics_lint.py`

# Definition of Done (DoD)
- [x] Scope implemented and acceptance criteria covered.
- [x] Validation commands executed and results captured.
- [x] Linked request/backlog/task docs updated.
- [x] Status is `Done` and progress is `100%`.

# Report
- Current blockers: none.
- Current status: req_079 delivery and closure validation completed.
- Validation snapshot:
  - `npm run -s test:ci:ui:slow-top` ✅
  - `npx vitest run` on touched UI specs ✅
  - `npm run -s test:ci:ui` ✅ (`30` files, `193` tests)
  - `npm run -s test:ci:segmentation:check` ✅
  - `npm run -s quality:ui-timeout-governance` ✅
  - `npm run -s lint` ✅
  - `npm run -s typecheck` ✅
  - `python3 logics/skills/logics-doc-linter/scripts/logics_lint.py` ✅

# References
- `logics/request/req_079_ui_reliability_debt_reduction_and_app_controller_decomposition_continuation.md`
- `logics/backlog/item_409_ui_slow_test_stabilization_wave_for_top_flaky_specs.md`
- `logics/backlog/item_410_ui_timeout_debt_governance_and_rationale_enforcement.md`
- `logics/backlog/item_411_app_controller_decomposition_continuation_by_orchestration_slice_extraction.md`
- `logics/backlog/item_412_req_079_closure_validation_and_traceability_matrix.md`
