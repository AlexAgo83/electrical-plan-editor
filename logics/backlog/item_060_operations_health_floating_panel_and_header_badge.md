## item_060_operations_health_floating_panel_and_header_badge - Operations/Health Floating Panel and Header Badge
> From version: 0.3.0
> Understanding: 99%
> Confidence: 97%
> Progress: 0%
> Complexity: Medium
> Theme: Operational Visibility and Control Access
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
`Undo/Redo` and model-health controls are buried in sidebar layout, reducing discoverability and slowing issue triage.

# Scope
- In:
  - Add a right-side header action to open a floating operations/health panel.
  - Move `Undo`, `Redo`, and model health issue navigation controls into this panel.
  - Show issue-count badge in header for quick glance status.
  - Keep outside click/focus loss close behavior and keyboard accessibility.
- Out:
  - Validation rule redesign.
  - New severity taxonomy beyond existing error/warning model.

# Acceptance criteria
- Header exposes a dedicated operations/health trigger.
- Floating panel provides undo/redo and issue navigation with behavior parity.
- Header badge reflects current issues and updates with validation state.
- Panel closes via outside interaction and keyboard escape with focus return to trigger.

# Priority
- Impact: High (faster operational loops and model quality visibility).
- Urgency: High once header shell is in place.

# Notes
- Dependencies: item_056, item_012.
- Blocks: item_059.
- Related AC: AC8, AC9.
- References:
  - `logics/request/req_010_network_scope_workspace_shell_and_global_defaults.md`
  - `src/app/components/workspace/WorkspaceSidebarPanel.tsx`
  - `src/app/components/workspace/AppHeaderAndStats.tsx`
  - `src/app/AppController.tsx`
  - `src/tests/app.ui.validation.spec.tsx`
  - `src/tests/app.ui.navigation-canvas.spec.tsx`

