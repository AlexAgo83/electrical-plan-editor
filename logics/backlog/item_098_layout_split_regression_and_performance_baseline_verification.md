## item_098_layout_split_regression_and_performance_baseline_verification - Layout Split Regression and Performance Baseline Verification
> From version: 0.5.1
> Understanding: 100%
> Confidence: 98%
> Progress: 100%
> Complexity: Medium
> Theme: Layout Behavior Safety and Measured Optimization Guardrails
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
After splitting the layout engine utilities, regressions can hide in geometry/scoring interactions; additionally, performance tuning without a baseline risks introducing complexity without measurable benefit.

# Scope
- In:
  - Validate layout behavior parity after `item_097` with targeted tests and representative flows.
  - Capture/verify a baseline for layout generation responsiveness using existing tests/fixtures.
  - Introduce only minimal, measured performance improvements if justified.
  - Document any optimization tradeoffs or deferred hotspots.
- Out:
  - Major algorithm redesign.
  - Worker migration for layout execution.

# Acceptance criteria
- Layout split passes targeted regression validation (`core.layout`, navigation/canvas integration, relevant E2E flow).
- Layout responsiveness baseline is checked and remains acceptable (or regressions are identified and fixed).
- Any performance changes included are measured, limited, and behavior-preserving.
- No unexpected change in generated layout semantics is observed in key flows.

# Priority
- Impact: High (protects layout correctness while enabling refactor).
- Urgency: Medium-high (closure gate for layout split wave).

# Notes
- Dependencies: item_097 (completed).
- Blocks: item_099.
- Related AC: AC5, AC6, AC7.
- Delivery status: Completed with targeted parity verification (`core.layout`, navigation/canvas, inspector flows, E2E smoke) and responsiveness baseline confirmation from existing medium-topology layout test; no extra optimization changes were needed.
- References:
  - `logics/request/req_016_app_controller_and_layout_engine_modularization_wave_3.md`
  - `src/tests/core.layout.spec.ts`
  - `src/tests/core.pathfinding.spec.ts`
  - `src/tests/app.ui.navigation-canvas.spec.tsx`
  - `src/tests/app.ui.inspector-shell.spec.tsx`
  - `tests/e2e/smoke.spec.ts`
