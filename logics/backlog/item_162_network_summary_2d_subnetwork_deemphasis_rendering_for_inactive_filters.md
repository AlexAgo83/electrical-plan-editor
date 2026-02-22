## item_162_network_summary_2d_subnetwork_deemphasis_rendering_for_inactive_filters - Network Summary 2D Subnetwork Deemphasis Rendering for Inactive Filters
> From version: 0.6.2
> Understanding: 99%
> Confidence: 96%
> Progress: 100%
> Complexity: Medium
> Theme: Visual Deemphasis Layer for Inactive Subnetwork Filtering in 2D Rendering
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
Even if subnetwork chips become toggleable, the 2D graph currently lacks a visual filtering/deemphasis mechanism to help users isolate active subnetworks without changing topology or removing elements from the DOM.

# Scope
- In:
  - Compute active-subnetwork membership checks for displayed 2D entities (segments and associated nodes at minimum).
  - Apply **50% opacity deemphasis** to entities not connected to active subnetworks.
  - Keep deemphasis as a visual-only filter (no topology/data/selection mutation).
  - Ensure label readability stays coherent under deemphasis.
- Out:
  - Hard-hiding entities or removing SVG nodes from the DOM.
  - Data model/schema changes for subnetwork tags.

# Acceptance criteria
- Entities not connected to active subnetworks render at 50% opacity when filtering is active.
- Segments and associated nodes participate in the deemphasis behavior.
- Selection and routing logic remain unchanged (visual filter only).
- Rendering remains performant for typical graph sizes (no obvious re-render regressions).

# Priority
- Impact: High (main analytical value of the feature).
- Urgency: High.

# Notes
- Dependencies: item_161.
- Blocks: item_164, item_165.
- Related AC: AC3, AC5, AC6.
- References:
  - `logics/request/req_028_network_summary_2d_subnetwork_visibility_filter_toggles_and_default_tag_labeling.md`
  - `src/app/components/NetworkSummaryPanel.tsx`
  - `src/app/styles/canvas/canvas-diagram-and-overlays.css`
  - `src/app/styles/base/base-theme-overrides/network-canvas-entity-theme-variables.css`
  - `src/tests/app.ui.navigation-canvas.spec.tsx`

