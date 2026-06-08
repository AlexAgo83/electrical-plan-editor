## item_380_ui_test_reliability_stabilization_wave_1_for_top_slow_specs - UI test reliability stabilization wave 1 for top slow/unstable specs
> From version: 0.9.11
> Status: Done
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

# AC Traceability
- request-AC1 -> This backlog slice. Evidence needed: `coverage:ui:report` and `test:ci:ui:slow-top` run even when earlier validation steps fail (`if: always()`), remaining non-blocking.
- request-AC2 -> This backlog slice. Evidence needed: `test:ci:fast` / `test:ci:ui` segmentation contract is explicit and documented.
- request-AC3 -> This backlog slice. Evidence needed: Segmented commands remain complementary to canonical `test:ci`, not replacements.
- request-AC4 -> This backlog slice. Evidence needed: `bundle:metrics:report` remains informational/non-blocking and runs only on successful build artifacts.
- request-AC5 -> This backlog slice. Evidence needed: At least the top unstable UI tests receive root-cause stabilization work or explicit documented rationale when deferred.
- request-AC6 -> This backlog slice. Evidence needed: No material regression in CI runtime reliability and debugging clarity.
- request-AC1 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC2 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC3 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC4 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC5 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC6 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
