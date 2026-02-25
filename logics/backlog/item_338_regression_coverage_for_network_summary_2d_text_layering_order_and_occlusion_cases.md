## item_338_regression_coverage_for_network_summary_2d_text_layering_order_and_occlusion_cases - Regression coverage for network summary 2D text layering order and occlusion cases
> From version: 0.9.6
> Understanding: 96%
> Confidence: 92%
> Progress: 0%
> Complexity: Medium
> Theme: Regression coverage for 2D text layering and occlusion scenarios
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
Without explicit regression coverage, future render refactors can silently reintroduce the 2D layering issue where nodes/segments visually hide text.

# Scope
- In:
  - Add/extend regression tests for the 2D text-on-top contract.
  - Prefer structural assertions on SVG group/render order when visual assertions are hard.
  - Add at least one representative integration regression path tied to `Network summary` rendering states.
  - Cover selected/highlighted visual states if feasible without brittle snapshots.
- Out:
  - Full visual snapshot testing matrix for every zoom/theme/label mode combination.
  - Label collision avoidance behavior.

# Acceptance criteria
- Regression coverage asserts the intended layer order (labels after nodes/segments) or equivalent enforceable structural contract.
- Coverage protects against a representative occlusion regression case in the 2D render.
- Existing tests for 2D interactions remain green after layering changes.

# Priority
- Impact: Medium-High.
- Urgency: Medium.

# Notes
- Dependencies: `req_058`, `item_336`, `item_337`.
- Blocks: `task_055` closure.
- Related AC: req_058 AC4.
- References:
  - `logics/request/req_058_network_summary_2d_text_labels_must_render_above_nodes_and_segments.md`
  - `src/tests/app.ui.navigation-canvas.spec.tsx`
  - `src/tests/app.ui.network-summary-workflow-polish.spec.tsx`
