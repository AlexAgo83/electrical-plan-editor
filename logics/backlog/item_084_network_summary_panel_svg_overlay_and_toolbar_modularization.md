## item_084_network_summary_panel_svg_overlay_and_toolbar_modularization - Network Summary Panel SVG, Overlay, and Toolbar Modularization
> From version: 0.5.0
> Understanding: 98%
> Confidence: 95%
> Progress: 100%
> Complexity: High
> Theme: 2D Canvas Surface Decomposition
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
`NetworkSummaryPanel.tsx` combines toolbar controls, floating panels, legend, route preview, and SVG render layers in one component, increasing the chance of regressions in the 2D interaction surface.

# Scope
- In:
  - Split `NetworkSummaryPanel` into focused subcomponents/modules (header actions, floating controls, overlays, legend, SVG layers).
  - Preserve current selection/highlight behavior and hitbox logic.
  - Preserve grid/snap/info/length toggles and export PNG behavior.
  - Keep route preview behavior and placement stable (whether extracted or still owned by parent).
- Out:
  - New canvas rendering features or algorithm changes.
  - Layout redesign of the network summary experience.

# Acceptance criteria
- `NetworkSummaryPanel.tsx` is significantly reduced and delegates focused rendering concerns.
- 2D interactions (selection, highlighting, zoom toolbar, generate layout) remain functionally stable.
- Display toggles and floating panels retain current behavior and visual placement.
- Integration/E2E coverage for canvas-related flows remains green.

# Priority
- Impact: Very high (critical visual interaction surface).
- Urgency: High (frequent edits and complex coupling).

# Notes
- Dependencies: item_082 (recommended), item_081 (optional parallel).
- Blocks: item_088, item_087 (recommended before lazy loading optimization finalization).
- Related AC: AC4, AC8, AC9.
- References:
  - `logics/request/req_014_ui_modularization_wave_2_controller_analysis_canvas_and_bundle_optimization.md`
  - `src/app/components/NetworkSummaryPanel.tsx`
  - `src/app/components/network-summary/NetworkCanvasFloatingInfoPanels.tsx`
  - `src/app/components/network-summary/NetworkSummaryLegend.tsx`
  - `src/app/components/network-summary/NetworkRoutePreviewPanel.tsx`
  - `src/app/styles/canvas.css`
  - `src/tests/app.ui.navigation-canvas.spec.tsx`
  - `src/tests/app.ui.inspector-shell.spec.tsx`
  - `tests/e2e/smoke.spec.ts`
