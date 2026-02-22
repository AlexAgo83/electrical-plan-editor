## item_166_network_summary_2d_zoom_invariant_label_rendering_and_entity_anchoring - Network Summary 2D Zoom-Invariant Label Rendering and Entity Anchoring
> From version: 0.6.2
> Understanding: 99%
> Confidence: 97%
> Progress: 0%
> Complexity: Medium
> Theme: Stable Screen-Space 2D Labels Anchored to Network Entities
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
2D labels in `Network summary` currently scale with zoom, making them too small when zoomed out and too large/overlapping when zoomed in. This reduces readability and slows visual scanning of the graph.

# Scope
- In:
  - Implement zoom-invariant label rendering (stable visual size across zoom levels) for the relevant 2D labels.
  - Preserve anchoring of labels to the corresponding entities while panning/zooming.
  - Maintain label contrast/stroke readability behavior across themes.
  - Keep the solution compatible with existing zoom/pan/selection interactions.
- Out:
  - Per-label manual placement/dragging.
  - Data-model changes for label sizing/rotation on entities.

# Acceptance criteria
- 2D labels keep a stable apparent size while zooming.
- Labels remain visually attached to the corresponding entities during pan/zoom.
- No regression of basic zoom/pan/selection behavior in the 2D network summary.
- Label legibility (including stroke/contrast) remains coherent across supported themes.

# Priority
- Impact: High (core readability/UX improvement).
- Urgency: High.

# Notes
- Dependencies: `req_029`.
- Blocks: item_167, item_168, item_169, item_170.
- Related AC: AC1, AC2, AC6.
- References:
  - `logics/request/req_029_network_summary_2d_zoom_invariant_labels_with_size_and_rotation_preferences.md`
  - `src/app/components/NetworkSummaryPanel.tsx`
  - `src/app/styles/canvas/canvas-diagram-and-overlays.css`
  - `src/app/styles/base/base-theme-overrides/network-canvas-entity-theme-variables.css`

