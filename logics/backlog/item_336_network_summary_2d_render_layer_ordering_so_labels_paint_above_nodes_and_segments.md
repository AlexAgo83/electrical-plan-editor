## item_336_network_summary_2d_render_layer_ordering_so_labels_paint_above_nodes_and_segments - Network summary 2D render layer ordering so labels paint above nodes and segments
> From version: 0.9.6
> Understanding: 97%
> Confidence: 93%
> Progress: 0%
> Complexity: Medium
> Theme: 2D render SVG layer ordering for label readability
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
The `Network summary` 2D SVG render can paint text behind nodes/segments depending on render order, making labels partially hidden and reducing readability.

# Scope
- In:
  - Refactor/clarify SVG render layer ordering so text/labels are painted after segment and node graphics.
  - Enforce a deterministic group/layer order for segments, nodes, labels, and related graph text in `NetworkSummaryPanel`.
  - Preserve selection/highlight/deemphasis visuals while keeping text on top.
  - Keep the change localized to the 2D render layering contract (no layout-engine rewrite).
- Out:
  - Pointer/hit-target behavior hardening beyond what is necessary for the layer-order change (covered in `item_337`).
  - Regression test matrix expansion beyond minimal structural assertions (covered in `item_338`).

# Acceptance criteria
- Text labels in the 2D render are painted after node/segment graphics and remain visually above them.
- Selected/highlighted node/segment styling does not visually cover text labels.
- Layering behavior is deterministic across re-renders and screen switches.

# Priority
- Impact: High.
- Urgency: High.

# Notes
- Dependencies: `req_058`.
- Blocks: `item_337`, `item_338`, `task_055`.
- Related AC: req_058 AC1, AC2.
- References:
  - `logics/request/req_058_network_summary_2d_text_labels_must_render_above_nodes_and_segments.md`
  - `src/app/components/NetworkSummaryPanel.tsx`
