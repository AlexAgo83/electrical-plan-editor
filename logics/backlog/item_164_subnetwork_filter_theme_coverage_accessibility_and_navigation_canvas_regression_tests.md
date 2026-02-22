## item_164_subnetwork_filter_theme_coverage_accessibility_and_navigation_canvas_regression_tests - Subnetwork Filter Theme Coverage, Accessibility, and Navigation-Canvas Regression Tests
> From version: 0.6.2
> Understanding: 99%
> Confidence: 96%
> Progress: 100%
> Complexity: Medium
> Theme: Regression Safety and Theme/A11y Hardening for 2D Subnetwork Filtering UX
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
The subnetwork filter feature touches interactive controls, floating panel styling, and 2D SVG deemphasis behavior across multiple themes. Without targeted tests and theme checks, regressions in interaction state, visual contrast, or a11y semantics are likely.

# Scope
- In:
  - Add/adjust tests for subnetwork toggle on/off behavior and `Enable all`.
  - Add regression coverage for deemphasis behavior (opacity changes) in the 2D rendering.
  - Validate default-tag formatting (`DEFAULT`, italic) in the floating panel.
  - Verify theme compatibility for the floating subnetwork controls and deemphasized entities.
  - Verify accessibility semantics for toggle buttons/state.
- Out:
  - Full visual snapshot matrix across every screen and theme beyond the impacted UI.
  - Broad accessibility audit unrelated to the new subnetwork filter controls.

# Acceptance criteria
- Regression tests cover toggle interactions, `Enable all`, and visual deemphasis behavior.
- Theme coverage is verified for representative themes and does not regress floating panel readability.
- Toggle buttons expose accessible semantics/state in tests or assertions where practical.
- Default-tag formatting behavior is covered by regression checks.

# Priority
- Impact: High (safety net for interactive visualization changes).
- Urgency: Medium-high.

# Notes
- Dependencies: item_161, item_162, item_163.
- Blocks: item_165.
- Related AC: AC1, AC2, AC3, AC4, AC6.
- References:
  - `logics/request/req_028_network_summary_2d_subnetwork_visibility_filter_toggles_and_default_tag_labeling.md`
  - `src/tests/app.ui.navigation-canvas.spec.tsx`
  - `src/app/styles/canvas/canvas-toolbar-and-shell.css`
  - `src/app/styles/canvas/canvas-diagram-and-overlays.css`
  - `src/app/styles/base/base-theme-overrides/network-canvas-entity-theme-variables.css`

