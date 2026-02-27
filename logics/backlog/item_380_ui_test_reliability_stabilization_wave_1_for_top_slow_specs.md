## item_380_ui_test_reliability_stabilization_wave_1_for_top_slow_specs - UI test reliability stabilization wave 1 for top slow/unstable specs
> From version: 0.9.11
> Understanding: 97%
> Confidence: 93%
> Progress: 100%
> Complexity: Medium-High
> Theme: Targeted UI test stability improvements without regression-signal dilution
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
Some UI integration tests are repeatedly among the slowest and require increased timeout budgets under `test:ci --coverage`, signaling reliability debt that can grow if left unmanaged.

# Scope
- In:
  - Use slow-test top-N reporting to identify recurrent slow/unstable UI specs.
  - Apply targeted stabilizations first (fixture shaping, setup reuse, await strategy tightening, interaction batching, query precision) before additional timeout increases.
  - Preserve assertion intent and regression coverage breadth while improving reliability.
  - Keep existing `10_000ms` exceptions as explicit temporary debt; require rationale for new timeout increases.
- Out:
  - Blanket timeout increases across the UI suite
  - Full test framework rewrite or architecture replacement
  - Reducing assertions to make tests pass faster

# Acceptance criteria
- At least the top unstable UI specs receive stabilization changes or explicit documented defer rationale.
- New timeout increases (if any) include explicit rationale tied to observed behavior.
- UI stabilization changes preserve meaningful assertions and regression intent.

# Priority
- Impact: High.
- Urgency: Medium-High.

# Notes
- Dependencies: `req_069`, `item_379`.
- Blocks: none (delivered in `task_067`).
- Related AC: AC5, AC6.
- References:
  - `logics/request/req_069_ci_observability_execution_order_test_segmentation_and_ui_test_reliability.md`
  - `scripts/quality/report-slowest-tests.mjs`
  - `src/tests/app.ui.creation-flow-wire-endpoint-refs.spec.tsx`
  - `src/tests/app.ui.creation-flow-ergonomics.spec.tsx`
  - `src/tests/app.ui.settings-wire-defaults.spec.tsx`
  - `src/tests/app.ui.settings.spec.tsx`

# Delivery notes
- Applied fixture-shaping stabilization to top slow UI tests:
  - `src/tests/app.ui.list-ergonomics.spec.tsx`
    - switched the segment-analysis endpoint split test from heavyweight sample network to `createUiIntegrationDenseWiresState()`.
  - `src/tests/app.ui.creation-flow-wire-endpoint-refs.spec.tsx`
    - switched the optional endpoint-reference flow from dense multi-wire fixture to `createUiIntegrationWideEndpointsState()`.
  - `src/tests/helpers/app-ui-test-utils.tsx`
    - added `createUiIntegrationWideEndpointsState()` targeted fixture.
- Preserved assertions/intent; no timeout inflation added.
- Maintained the documented timeout debt policy (`10_000ms` exceptions remain temporary, no new increases).
