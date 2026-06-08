## item_347_regression_coverage_for_circle_mobility_theme_selection_persistence_and_surface_rendering - Regression coverage for Circle Mobility theme selection, persistence, and surface rendering
> From version: 0.9.7
> Status: Done
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

# AC Traceability
- request-AC1 -> This backlog slice. Evidence needed: The app exposes two new theme presets in `Settings > Theme mode`: one Circle Mobility light preset and one Circle Mobility dark preset.
- request-AC2 -> This backlog slice. Evidence needed: Both presets are visually based on the provided Circle Mobility palette/gradients and match the brand direction across primary surfaces (shell, panels/cards, buttons/chips, highlights).
- request-AC3 -> This backlog slice. Evidence needed: The new presets are selectable and persist across reload/remount using the existing theme preference mechanism.
- request-AC4 -> This backlog slice. Evidence needed: Representative app surfaces render coherently under both presets (not only shell class wiring), including settings/validation/table/canvas-adjacent UI.
- request-AC5 -> This backlog slice. Evidence needed: Existing theme presets and theme switching behavior remain functional.
- request-AC1 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC2 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC3 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC4 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC5 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
