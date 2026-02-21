## item_056_workspace_header_sticky_and_navigation_drawer_overlay - Workspace Header Sticky and Navigation Drawer Overlay
> From version: 0.3.0
> Understanding: 100%
> Confidence: 98%
> Progress: 100%
> Complexity: High
> Theme: Workspace Shell Interaction Model
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
The always-visible sidebar and non-sticky top framing reduce usable workspace area and make global controls harder to access consistently while scrolling.

# Scope
- In:
  - Add a sticky top header that remains visible over scrolling content.
  - Display app identity and active network context in the header.
  - Convert left navigation into a drawer overlay opened/closed from a header button.
  - Support drawer close by outside click/focus loss and keyboard escape behavior.
  - Preserve coherent focus return and navigation accessibility semantics.
- Out:
  - Floating operations/health panel feature details (covered by item_060).
  - Settings button behavior and left-nav cleanup details (covered by item_062).

# Acceptance criteria
- Header remains sticky while screen content scrolls underneath without overlap artifacts.
- Left navigation works as an overlay drawer toggled by the header.
- Drawer closes on outside click/focus loss and keyboard escape.
- App name and active network label remain visible in header shell.

# Priority
- Impact: Very high (core shell ergonomics and discoverability).
- Urgency: High (required before right-side floating controls).

# Notes
- Dependencies: item_055.
- Blocks: item_060, item_062, item_063.
- Related AC: AC3, AC4.
- References:
  - `logics/request/req_010_network_scope_workspace_shell_and_global_defaults.md`
  - `src/app/components/workspace/AppHeaderAndStats.tsx`
  - `src/app/components/WorkspaceNavigation.tsx`
  - `src/app/components/workspace/WorkspaceSidebarPanel.tsx`
  - `src/app/AppController.tsx`
  - `src/tests/app.ui.navigation-canvas.spec.tsx`
