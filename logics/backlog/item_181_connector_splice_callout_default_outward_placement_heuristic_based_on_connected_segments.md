## item_181_connector_splice_callout_default_outward_placement_heuristic_based_on_connected_segments - Connector/Splice Callout Default Outward Placement Heuristic Based on Connected Segments
> From version: 0.6.4
> Understanding: 97%
> Confidence: 95%
> Progress: 0%
> Complexity: High
> Theme: Deterministic Callout Placement Near Entities with Connected-Segment Geometry Bias
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
Callout frames need a useful initial placement that reduces clutter and feels intuitive. A naive fixed offset would overlap topology often. The request requires a placement strategy driven by connected segment geometry so callouts appear near the entity but as far outward as possible.

# Scope
- In:
  - Implement a deterministic default placement heuristic for connector/splice callouts.
  - Use connected segment geometry as primary signal for outward placement direction.
  - Provide fallback placement rules when geometry is ambiguous or insufficient.
  - Ensure default placement works for sparse and dense topologies without random jitter across rerenders.
- Out:
  - Full collision detection/resolution between callouts.
  - Manual placement optimization suggestions.

# Acceptance criteria
- Initial callout placement is near the linked connector/splice and biased outward using connected segment geometry.
- Placement is deterministic across rerenders for unchanged topology/positions.
- Fallback behavior is defined and does not produce unstable/random positions.
- Placement remains compatible with subsequent manual drag overrides.

# Priority
- Impact: High.
- Urgency: Medium-High.

# Notes
- Dependencies: `req_031`.
- Blocks: item_186.
- Related AC: AC4, AC10.
- References:
  - `logics/request/req_031_network_summary_2d_connector_and_splice_cable_info_frames_with_draggable_callouts.md`
  - `src/app/components/NetworkSummaryPanel.tsx`
  - `src/app/lib/layout/geometry.ts`
  - `src/app/hooks/useCanvasInteractionHandlers.ts`
  - `src/tests/app.ui.navigation-canvas.spec.tsx`

