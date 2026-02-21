## item_055_network_scope_screen_and_primary_navigation_restructure - Network Scope Screen and Primary Navigation Restructure
> From version: 0.3.0
> Understanding: 100%
> Confidence: 98%
> Progress: 100%
> Complexity: High
> Theme: Workspace Information Architecture
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
Network lifecycle and global context are currently blended into left navigation patterns that are hard to scan and do not reflect the intended workspace hierarchy.

# Scope
- In:
  - Add a dedicated `Network Scope` primary workspace screen.
  - Restructure primary navigation order so `Network Scope` appears before `Modeling`.
  - Keep clear visual separation between primary screens and entity-level tabs.
  - Preserve existing navigation behavior for Modeling, Analysis, and Validation.
- Out:
  - Sticky header and drawer overlay implementation details (covered by item_056).
  - Settings header entrypoint behavior (covered by item_062).

# Acceptance criteria
- `Network Scope` is available as a first-class primary screen.
- Primary navigation places `Network Scope` before `Modeling`.
- Navigation grouping remains explicit between primary screens and entity-level tabs.
- Existing screen switching and route state remain stable with no functional drift.

# Priority
- Impact: Very high (foundation for request shell redesign).
- Urgency: High (unblocks downstream req_010 items).

# Notes
- Blocks: item_057, item_058, item_061, item_062.
- Related AC: AC1, AC2.
- References:
  - `logics/request/req_010_network_scope_workspace_shell_and_global_defaults.md`
  - `src/app/components/WorkspaceNavigation.tsx`
  - `src/app/components/workspace/NetworkScopeWorkspaceContent.tsx`
  - `src/app/AppController.tsx`
  - `src/app/hooks/useWorkspaceNavigation.ts`
  - `src/tests/app.ui.navigation-canvas.spec.tsx`
