## item_347_regression_coverage_for_circle_mobility_theme_selection_persistence_and_surface_rendering - Regression coverage for Circle Mobility theme selection, persistence, and surface rendering
> From version: 0.9.7
> Understanding: 100%
> Confidence: 97%
> Progress: 100%
> Complexity: Medium
> Theme: Regression coverage for new Circle Mobility theme presets
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
Theme additions can regress existing preset behavior, persistence, or representative surface rendering. Without focused tests, Circle Mobility presets could appear selectable while remaining partially unstyled or broken after remount.

# Scope
- In:
  - Extend theme regression tests for Circle Mobility light/dark preset selection and shell-class behavior.
  - Add persistence coverage across remount.
  - Add representative surface rendering checks (settings/validation/analysis or equivalent) under the new presets.
  - Verify existing theme presets still behave correctly after adding the new `ThemeMode` values.
- Out:
  - Full visual snapshot testing of every screen and component in both new presets.
  - Pixel-perfect theme visual diff automation.

# Acceptance criteria
- Automated regression coverage asserts the two new presets are selectable and produce expected app-shell theme classes.
- Persistence across remount is covered for at least one Circle Mobility preset (preferably both).
- Representative surface checks ensure the new presets render beyond shell class wiring.
- Existing theme variant tests remain green.

# Priority
- Impact: Medium-High.
- Urgency: Medium-High.

# Notes
- Dependencies: `req_061`, `item_345`, `item_346`.
- Blocks: `task_058` closure.
- Related AC: req_061 AC3, AC4, AC5.
- Delivery:
  - Extended theme UI regression coverage for Circle Mobility light/dark preset selection and app-shell class assertions.
  - Added remount persistence coverage for Circle Mobility preset selection.
  - Added representative surface assertions to ensure styling applies beyond shell class wiring.
- References:
  - `logics/request/req_061_circle_mobility_brand_light_and_dark_theme_presets.md`
  - `src/tests/app.ui.theme.spec.tsx`
  - `src/tests/app.ui.settings.spec.tsx`
  - `src/app/components/workspace/SettingsWorkspaceContent.tsx`
