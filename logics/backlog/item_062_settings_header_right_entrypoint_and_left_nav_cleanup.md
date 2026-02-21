## item_062_settings_header_right_entrypoint_and_left_nav_cleanup - Settings Header Right Entrypoint and Left Nav Cleanup
> From version: 0.3.0
> Understanding: 99%
> Confidence: 97%
> Progress: 0%
> Complexity: Medium
> Theme: Global Settings Access Path
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
Keeping `Settings` in left navigation conflicts with the target shell model where global controls live in the header right area.

# Scope
- In:
  - Remove `Settings` from left primary navigation entries.
  - Add a right-side header `Settings` action.
  - Ensure header action routes users to the global settings entrypoint without state loss.
  - Preserve keyboard accessibility and predictable focus behavior for the new action.
- Out:
  - Additional settings categories redesign.
  - Per-project or per-network settings model changes.

# Acceptance criteria
- Left navigation no longer shows `Settings`.
- Header right area exposes a functional `Settings` action.
- `Settings` action opens the expected settings entrypoint with stable routing behavior.
- Existing settings persistence behavior remains unchanged except for intentional req_010 defaults.

# Priority
- Impact: Medium-high (navigation clarity and scope consistency).
- Urgency: High (explicit req_010 interaction contract).

# Notes
- Dependencies: item_055, item_056, item_058.
- Blocks: item_059.
- Related AC: AC11.
- References:
  - `logics/request/req_010_network_scope_workspace_shell_and_global_defaults.md`
  - `src/app/components/WorkspaceNavigation.tsx`
  - `src/app/components/workspace/AppHeaderAndStats.tsx`
  - `src/app/components/workspace/SettingsWorkspaceContent.tsx`
  - `src/app/AppController.tsx`
  - `src/tests/app.ui.settings.spec.tsx`

