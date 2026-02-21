## item_052_layout_regeneration_control_and_user_safeguards - Layout Regeneration Control and User Safeguards
> From version: 0.2.0
> Understanding: 99%
> Confidence: 96%
> Progress: 0%
> Complexity: Medium
> Theme: Layout Interaction UX
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
Users currently lack an explicit and safe control to recompute 2D placement, which makes recovery from suboptimal layouts cumbersome and non-discoverable.

# Scope
- In:
  - Add a visible `(Re)generate layout` action in the 2D workspace toolbar.
  - Recompute and apply layout for the active network using the deterministic heuristic.
  - Persist regenerated coordinates immediately after apply.
  - Add user safeguards (confirmation/explicit wording) before overwriting manual placement.
- Out:
  - Batch regeneration across all networks in one click.
  - Keyboard shortcut customization for regeneration in this wave.

# Acceptance criteria
- Toolbar exposes a clear regeneration action in modeling workspace context.
- Triggering regeneration updates node coordinates and re-renders the active network.
- Regeneration outcome is persisted and restored after reload.
- Safeguard flow prevents accidental destructive overwrite of manual arrangement.

# Priority
- Impact: High (operability and recovery ergonomics).
- Urgency: High once crossing-aware layout is available.

# Notes
- Dependencies: item_050, item_051.
- Blocks: item_054.
- Related AC: AC4, AC5.
- References:
  - `logics/request/req_009_2d_layout_persistence_and_crossing_minimization.md`
  - `src/app/components/NetworkSummaryPanel.tsx`
  - `src/app/hooks/useWorkspaceHandlers.ts`
  - `src/app/AppController.tsx`
  - `src/tests/app.ui.navigation-canvas.spec.tsx`
