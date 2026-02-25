## item_337_network_summary_2d_text_on_top_pointer_and_interaction_non_regression_hardening - Network summary 2D text-on-top pointer and interaction non-regression hardening
> From version: 0.9.6
> Understanding: 98%
> Confidence: 94%
> Progress: 100%
> Complexity: Medium
> Theme: 2D interaction non-regression after text layer reordering
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
Moving text above node/segment graphics can accidentally intercept pointer events or alter hit behavior, causing regressions in 2D selection and navigation interactions.

# Scope
- In:
  - Verify and harden pointer-event behavior after text-on-top layering changes.
  - Ensure node/segment selection, pan/zoom, and relevant hover/focus interactions continue to work.
  - Keep keyboard accessibility semantics for interactive 2D nodes intact.
  - Apply intentional pointer-events strategy (text/hitbox layering) if required to avoid click interception.
- Out:
  - Visual layer ordering implementation itself (handled in `item_336`).
  - Broader UX redesign of 2D interactions.

# Acceptance criteria
- Node selection interactions remain functional after text layer ordering changes.
- Pan/zoom interactions remain functional and unchanged in normal usage.
- Text-on-top rendering does not introduce unintended click interception on interactive nodes/segments.
- Keyboard focus/activation behavior for interactive 2D nodes remains functional (where already supported).

# Priority
- Impact: High.
- Urgency: Medium-High.

# Notes
- Dependencies: `req_058`, `item_336`.
- Blocks: `item_338`, `task_055`.
- Related AC: req_058 AC3.
- Delivery notes:
  - Existing `pointer-events: none` behavior on 2D text labels remains compatible with the new top-layer label rendering.
  - Segment hitboxes and node interactions remain in geometry layers; targeted integration suites confirm no regressions for select/pan/zoom/keyboard flows.
- References:
  - `logics/request/req_058_network_summary_2d_text_labels_must_render_above_nodes_and_segments.md`
  - `src/app/components/NetworkSummaryPanel.tsx`
  - `src/tests/app.ui.navigation-canvas.spec.tsx`
  - `src/tests/app.ui.network-summary-workflow-polish.spec.tsx`
