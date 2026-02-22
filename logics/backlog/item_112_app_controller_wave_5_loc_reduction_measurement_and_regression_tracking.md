## item_112_app_controller_wave_5_loc_reduction_measurement_and_regression_tracking - AppController Wave 5 LOC Reduction Measurement and Regression Tracking
> From version: 0.5.3
> Understanding: 99%
> Confidence: 96%
> Progress: 100%
> Complexity: Medium
> Theme: Measurable Reduction Tracking and Incremental Validation
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
Wave-5 is explicitly LOC-reduction-oriented; without baseline/post-wave measurement and incremental regression tracking, the effort may improve structure but fail to produce the intended measurable reduction.

# Scope
- In:
  - Capture and track `AppController` LOC baseline and post-wave deltas across wave steps.
  - Document targeted validation outcomes per major extraction/compaction step.
  - Highlight residual hotspots if final LOC targets are not reached.
- Out:
  - Benchmark program beyond practical LOC + regression tracking.
  - Cosmetic metrics reporting unrelated to delivery decisions.

# Acceptance criteria
- Baseline and post-wave `AppController` LOC are documented with clear comparison.
- Incremental targeted regression snapshots are tracked across major wave steps.
- Residual hotspots / next-step opportunities are documented if targets are partially met.
- Tracking supports final AC traceability for `req_018`.

# Priority
- Impact: High (keeps wave aligned with stated objective).
- Urgency: High (should run throughout the wave, not only at closure).

# Notes
- Dependencies: item_107-item_111 contribute measurement deltas.
- Blocks: item_113.
- Related AC: AC1, AC6, AC7, AC8.
- References:
  - `logics/request/req_018_app_controller_decomposition_wave_5_real_loc_reduction_and_composition_root_slimming.md`
  - `src/app/AppController.tsx`
  - `src/tests/app.ui.navigation-canvas.spec.tsx`
  - `src/tests/app.ui.workspace-shell-regression.spec.tsx`
  - `src/tests/app.ui.inspector-shell.spec.tsx`
  - `tests/e2e/smoke.spec.ts`

