## item_185_connector_splice_callout_theme_readability_and_navigation_canvas_regression_coverage - Connector/Splice Callout Theme Readability and Navigation-Canvas Regression Coverage
> From version: 0.6.4
> Understanding: 98%
> Confidence: 96%
> Progress: 0%
> Complexity: Medium
> Theme: Regression and Theme Verification for New 2D Callout Layer in Dense Interactive Diagrams
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
The callout feature touches rendering, interactions, theme styling, export behavior, and selection/deemphasis semantics. Without targeted regression coverage and theme verification, the feature is likely to introduce subtle visual or interaction regressions in `Network summary`.

# Scope
- In:
  - Add targeted regression tests for callout rendering presence, leader line rendering, callout content, and key interaction flows (selection/drag where testable).
  - Add coverage for settings/default visibility preference wiring and persistence if touched.
  - Verify theme readability for callouts (frame, dashed line, text, deemphasis) across representative themes.
  - Document any testing limits (e.g. complex drag geometry assertions) and provide pragmatic guardrails.
- Out:
  - Full screenshot-based theme regression matrix unless explicitly introduced.
  - Unrelated test refactors.

# Acceptance criteria
- Targeted tests cover core callout rendering and interaction flows (or documented proxies where direct DOM geometry assertions are impractical).
- Settings/default visibility preference behavior is regression-covered if implemented.
- Theme readability is verified across representative themes and documented.
- No regressions are introduced in existing navigation-canvas workflows.

# Priority
- Impact: High.
- Urgency: High.

# Notes
- Dependencies: `req_031`, items_178-184 (implementation-dependent order may vary).
- Blocks: item_186.
- Related AC: AC7, AC8, AC9, AC10.
- References:
  - `logics/request/req_031_network_summary_2d_connector_and_splice_cable_info_frames_with_draggable_callouts.md`
  - `src/tests/app.ui.navigation-canvas.spec.tsx`
  - `src/tests/app.ui.settings.spec.tsx`
  - `src/tests/app.ui.network-summary-workflow-polish.spec.tsx`
  - `src/app/styles/canvas/canvas-diagram-and-overlays.css`
  - `src/app/styles/base/base-theme-overrides.css`

