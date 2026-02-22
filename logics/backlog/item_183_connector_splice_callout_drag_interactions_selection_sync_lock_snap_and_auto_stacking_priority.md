## item_183_connector_splice_callout_drag_interactions_selection_sync_lock_snap_and_auto_stacking_priority - Connector/Splice Callout Drag Interactions, Selection Sync, Lock/Snap, and Auto Stacking Priority
> From version: 0.6.4
> Understanding: 98%
> Confidence: 95%
> Progress: 0%
> Complexity: High
> Theme: Interactive Callout Manipulation with Node-Like Movement Rules and Linked Selection Feedback
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
Callouts must behave like draggable diagram elements without breaking existing node interactions. They need the same movement rules (snap/lock), independent drag behavior, linked selection semantics, and improved visibility in dense layouts via active/hover/drag stacking priority.

# Scope
- In:
  - Add drag interactions for callouts using the same movement constraints/rules as nodes.
  - Respect lock movement and snap-to-grid settings.
  - Ensure dragging a callout does not drag the linked connector/splice node.
  - Clicking a callout selects/focuses the linked connector/splice entity.
  - Synchronize highlight state between selected entity and its callout.
  - Implement automatic stacking priority so active/hovered/dragged callout renders above others.
- Out:
  - Multi-select callout drag.
  - Separate drag handles (V1 uses whole frame drag area).

# Acceptance criteria
- Callouts drag independently with the same lock/snap behavior as nodes.
- Callout interaction does not move the underlying connector/splice node unintentionally.
- Clicking a callout selects the linked connector/splice and updates visual highlight coherently.
- Active/hovered/dragged callout is visually stacked above other callouts in dense diagrams.

# Priority
- Impact: Very high.
- Urgency: High.

# Notes
- Dependencies: `req_031`, item_179.
- Blocks: item_186.
- Related AC: AC6, AC8, AC10.
- References:
  - `logics/request/req_031_network_summary_2d_connector_and_splice_cable_info_frames_with_draggable_callouts.md`
  - `src/app/hooks/useCanvasInteractionHandlers.ts`
  - `src/app/components/NetworkSummaryPanel.tsx`
  - `src/app/hooks/useCanvasState.ts`
  - `src/tests/app.ui.navigation-canvas.spec.tsx`

