## item_409_ui_slow_test_stabilization_wave_for_top_flaky_specs - UI slow test stabilization wave for top flaky specs
> From version: 0.9.17
> Status: In Progress
> Understanding: 90%
> Confidence: 85%
> Progress: 10%
> Complexity: Medium
> Theme: Quality
> Reminder: Update status/understanding/confidence/progress and linked task references when you edit this doc.

# Problem
Several UI integration specs remain slow/fragile and depend on high timeout budgets (`10_000ms`), which weakens CI feedback quality and raises regression risk.

# Scope
- In:
  - identify and prioritize top slow/flaky UI specs from current reporting;
  - apply root-cause stabilizations (fixture shaping, wait strategy cleanup, query tightening, setup reuse);
  - keep assertions and behavioral coverage intact while reducing flaky runtime behavior.
- Out:
  - broad rewrite of the test architecture;
  - lowering assertions to gain speed.

# Acceptance criteria
- AC1: A prioritized list of top slow/flaky UI specs is produced and used as stabilization scope.
- AC2: Targeted stabilizations are applied to selected specs without reducing assertion coverage.
- AC3: Stabilized specs pass reliably in repeated local runs and within `test:ci:ui`.
- AC4: Any remaining timeout exception is explicitly documented with technical rationale.
- AC5: The wave contributes to a net reduction of at least `30%` on existing targeted `10_000ms` timeout exceptions.

# AC Traceability
- AC1 -> Slow-spec list captured from reporting output. Proof: pending.
- AC2 -> Test stabilization commits and spec diffs. Proof: pending.
- AC3 -> Re-run evidence (`test:ci:ui` / targeted tests). Proof: pending.
- AC4 -> Documented timeout rationale when kept. Proof: pending.
- AC5 -> Baseline vs post-wave timeout exception count shows >=30% reduction. Proof: pending.

# Priority
- Impact:
  - High (CI reliability and developer feedback loop).
- Urgency:
  - High (ongoing delivery depends on stable UI regression signals).

# Notes
- Derived from `logics/request/req_079_ui_reliability_debt_reduction_and_app_controller_decomposition_continuation.md`.
- Blocks: `task_072`.
- Related ACs: `AC1`, `AC2`, `AC3` from `req_079`.
