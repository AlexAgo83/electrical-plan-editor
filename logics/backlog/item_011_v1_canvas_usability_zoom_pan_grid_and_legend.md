## item_011_v1_canvas_usability_zoom_pan_grid_and_legend - V1 Canvas Usability (Zoom, Pan, Grid, Legend)
> From version: 0.1.0
> Understanding: 99%
> Confidence: 96%
> Progress: 100%
> Complexity: Medium
> Theme: UX/UI Visualization
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
The 2D network representation is currently usable but lacks essential navigation and readability controls needed for larger or denser network topologies.

# Scope
- In:
  - Add canvas pan and zoom interactions with reset control.
  - Add optional subtle grid overlay and snap-to-grid toggle for node movement.
  - Add persistent legend for node, segment, and wire visual states.
  - Improve visual contrast between default, selected, and route-highlighted elements.
- Out:
  - Freehand drawing tools.
  - Physical/3D harness geometry modeling.

# Acceptance criteria
- Users can pan and zoom the network canvas during modeling/analysis.
- Users can enable/disable grid and snap-to-grid behavior.
- Legend remains visible and documents visual state semantics.
- Route highlighting and selection remain unambiguous under all view states.

# Priority
- Impact: Medium-High (navigation and readability at scale).
- Urgency: Medium after core workspace and inspector availability.

# Notes
- Dependencies: item_009, item_010.
- Related AC: AC2, AC7.
- Status update:
  - Pan and zoom interactions are active on the network canvas (mouse wheel zoom, shift+drag pan, reset view).
  - Fit-to-content action is available from toolbar and keyboard shortcut (`Alt+F`) to frame graph content.
  - Grid overlay and snap-to-grid toggles are available and applied to node placement/movement.
  - Persistent legend is visible and route/selection visual contrast is improved.
- References:
  - `logics/request/req_001_v1_ux_ui_operator_workspace.md`
  - `src/app/App.tsx`
  - `src/app/styles.css`
