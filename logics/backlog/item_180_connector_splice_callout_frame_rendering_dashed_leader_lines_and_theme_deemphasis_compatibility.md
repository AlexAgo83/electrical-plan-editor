## item_180_connector_splice_callout_frame_rendering_dashed_leader_lines_and_theme_deemphasis_compatibility - Connector/Splice Callout Frame Rendering, Dashed Leader Lines, and Theme/Deemphasis Compatibility
> From version: 0.6.4
> Understanding: 98%
> Confidence: 96%
> Progress: 0%
> Complexity: High
> Theme: New SVG Callout Visual Layer with Connector-Like Styling, Leader Lines, and Theme-Safe Deemphasis
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
The new connector/splice cable callouts require a new SVG visual layer (frame + dashed leader line + text content container) that must look coherent with the current 2D design, remain theme-compatible, and participate correctly in deemphasis behavior when subnetwork filters reduce entity prominence.

# Scope
- In:
  - Render callout frames for connectors and splices with connector-like shape language (thin border, square corners).
  - Render dashed leader lines from callout to associated connector/splice.
  - Add theme-compatible styling for frame, leader line, and text content container.
  - Apply deemphasis state to callout frame and leader line when linked entity is deemphasized.
  - Ensure rendering order allows future active/hovered stacking rules without visual artifacts.
- Out:
  - Full collision-avoidance/auto-layout optimization.
  - Theme redesign unrelated to callouts.

# Acceptance criteria
- Connector/splice callout frame visuals match requested design constraints (thin border, non-rounded corners).
- Dashed leader line renders and remains visually linked to the source entity.
- Callout visuals apply active theme palette and remain readable across supported themes.
- Deemphasis state affects the callout and leader line consistently with linked entity deemphasis.

# Priority
- Impact: High.
- Urgency: High.

# Notes
- Dependencies: `req_031`.
- Blocks: item_186.
- Related AC: AC2, AC3, AC7, AC10.
- References:
  - `logics/request/req_031_network_summary_2d_connector_and_splice_cable_info_frames_with_draggable_callouts.md`
  - `src/app/components/NetworkSummaryPanel.tsx`
  - `src/app/styles/canvas/canvas-diagram-and-overlays.css`
  - `src/app/styles/base/base-theme-overrides.css`
  - `src/tests/app.ui.navigation-canvas.spec.tsx`

