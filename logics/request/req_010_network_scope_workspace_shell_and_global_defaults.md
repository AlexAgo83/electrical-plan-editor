## req_010_network_scope_workspace_shell_and_global_defaults - Network Scope Workspace Shell and Global Defaults
> From version: 0.3.0
> Understanding: 99%
> Confidence: 97%
> Complexity: High
> Theme: Navigation and Workspace Shell Clarity
> Reminder: Update Understanding/Confidence and dependencies/references when you edit this doc.

# Needs
- Replace the current ad-hoc network scope management in the left sidebar with a dedicated screen.
- Reorganize navigation so network scope is a first-class entry before modeling, with clear visual separation from entity-level navigation.
- Align settings placement with their scope: global settings must be attached to the new network scope area (not grouped under validation flow).
- Move the `Settings` entry-point from left navigation to a right-side header button.
- Make dark mode the default theme and enable snap-to-grid by default.
- Introduce a sticky top header with app identity and active network context.
- Convert the left menu into an overlay drawer that opens/closes from the header and closes on focus loss/click outside.
- Move `undo/redo` and `model health` controls into a floating panel opened from the right side of the header, with issue-count badge for quick status glance.
- Move the top summary capsules (item/entity counters currently in header area) into the dedicated `Network Scope` screen.
- Move `Inspector context` into a floating panel permanently anchored at the bottom-right of the workspace viewport.

# Context
Current workspace navigation mixes primary screens, network lifecycle controls, and global preferences in ways that reduce clarity and creates a "patched-in" feeling for network scope operations.

The user intent is to establish a clearer information architecture:
- global context and controls in a sticky header,
- a dedicated network scope entry-point,
- modeling/analysis/validation as downstream workspaces,
- a drawer-style left navigation that can be summoned on demand.

Architecture references to preserve:
- `logics/architecture/target_reference_v1_frontend_local_first.md`
- `logics/request/req_002_multi_network_management_and_navigation.md`
- `logics/request/req_003_theme_mode_switch_normal_dark.md`
- `logics/request/req_008_app_orchestration_shell_completion_and_final_line_budget.md`

## Objectives
- Deliver a dedicated "Network Scope" workspace screen for network lifecycle and global workspace preferences.
- Relocate top summary capsules (counts/quick metrics) from header area into `Network Scope` content.
- Expose `Settings` as a right-side header action instead of a left-navigation entry.
- Reposition `Inspector context` as a dedicated floating panel anchored bottom-right across workspace screens.
- Refactor primary navigation order and grouping to make network context explicit before modeling.
- Replace always-visible left sidebar with a drawer overlay controlled by the top header.
- Keep deterministic local-first behavior, network isolation, and existing validation/routing flows intact.
- Set better first-run defaults: dark theme + snap-to-grid enabled.
- Improve operational visibility by exposing model health state directly in header badge while keeping detailed controls in an on-demand floating panel.

## Functional Scope
### Navigation and information architecture
- Add a new primary screen: `Network Scope`.
- Place `Network Scope` before `Modeling` in primary navigation order.
- Move global settings controls into `Network Scope` screen content.
- Remove `Settings` as a primary left-navigation entry and access it from a header right action.
- Keep validation scoped to model integrity only; remove settings coupling from validation flow.
- Preserve a clear separator between primary navigation and entity-level sub-navigation (like current divider intent between settings and connector-level tabs).

### Dedicated network scope screen
- Create a dedicated screen content area for:
  - active network selection,
  - create/rename/duplicate/delete actions,
  - global preferences previously housed in settings,
  - summary capsules with key model/entity counters previously displayed in top workspace area.
- Keep behavior parity for existing network lifecycle actions and safeguards (confirmations, deterministic fallback).
- Ensure empty-state handling remains explicit when no active network exists.

### Workspace shell and header
- Add a sticky top header that remains visible while screen content scrolls.
- In header:
  - left: button to open/close navigation drawer,
  - center/left area: app name,
  - right: active network label + `Settings` button + operations/health button.
- Ensure page-level content scrolls beneath the sticky header without overlap artifacts.

### Left menu as drawer overlay
- Convert current left sidebar into an overlay drawer rendered above workspace screens.
- Drawer open/close triggers:
  - header button toggles open/closed,
  - click/focus loss outside drawer closes it.
- Preserve keyboard accessibility (focus management, escape/blur behavior).
- Keep existing navigation shortcuts behavior coherent with drawer state.

### Floating operations and health panel
- Move the current sidebar section containing:
  - `Undo` / `Redo`,
  - `Model health` summary and issue navigation controls,
  into a floating panel (overlay/popover style) opened from a header button on the right.
- Header right action must display a badge when issues exist (quick glance), with error/warning differentiation if available.
- Floating panel open/close triggers:
  - right header button toggles open/closed,
  - click/focus loss outside closes it.
- Preserve existing issue navigation behavior and undo/redo behavior without functional drift.
- Keep keyboard accessibility for the panel (escape close, focus return to trigger button).

### Context inspector floating panel
- Move `Inspector context` out of static sidebar layout into a floating panel.
- Keep this panel always docked/anchored at the bottom-right of the workspace viewport.
- Ensure it remains visible while the underlying screen content scrolls.
- Preserve existing inspector actions and selection behavior (open selected entity in inspector, empty-state behavior).

### Default preferences update
- Default theme mode for new/empty preference state becomes `dark`.
- Default canvas snap-to-grid for new/empty preference state becomes `enabled`.
- Migration/compatibility rule:
  - existing persisted UI preferences must be respected (no forced overwrite),
  - new defaults apply when preference payload is absent or reset to defaults.

## Acceptance criteria
- AC1: A dedicated `Network Scope` primary screen exists and centralizes network lifecycle plus global settings content.
- AC2: Primary navigation exposes `Network Scope` before `Modeling` with clear visual separation from entity tabs.
- AC3: The top header is sticky and shows app name plus active network context while workspace content scrolls underneath.
- AC4: Left navigation behaves as overlay drawer, toggled by header button and closable by click/focus loss outside.
- AC5: Theme default is `dark` and snap-to-grid default is `enabled` when no prior UI preference exists.
- AC6: Existing persisted preferences are preserved on upgrade; only fresh/default-reset states adopt new defaults.
- AC7: Existing network isolation, routing, validation, and import/export workflows remain functionally stable.
- AC8: `Undo/Redo` and `Model health` controls are available in a floating panel opened from a right-side header button.
- AC9: Header shows issue badge for quick glance and panel supports close on outside focus/click with accessible keyboard behavior.
- AC10: Top summary capsules (counts/quick metrics) are no longer rendered in header area and are rendered in the `Network Scope` screen.
- AC11: `Settings` is no longer a left-navigation entry and is accessible through a right-side header button.
- AC12: `Inspector context` is rendered as a floating panel anchored to the bottom-right of the viewport and keeps current inspector interactions.

## Non-functional requirements
- Preserve accessibility for drawer interactions (focus trap/return, escape close semantics).
- Maintain responsive behavior across desktop/laptop viewport sizes.
- Keep local-first deterministic behavior and persistence reliability.
- Maintain compatibility with quality gates: `lint`, `typecheck`, `test:ci`, `test:e2e`, `quality:ui-modularization`, `quality:store-modularization`.

## Out of scope
- Redesign of domain model or routing algorithm.
- Mobile-first responsive redesign beyond shell/drawer behavior required for this request.
- Full design-system overhaul of all screens.

# Backlog
- To create from this request:
  - `item_055_network_scope_screen_and_primary_navigation_restructure.md`
  - `item_056_workspace_header_sticky_and_navigation_drawer_overlay.md`
  - `item_057_network_scope_lifecycle_ui_extraction_and_safeguards.md`
  - `item_058_global_settings_relocation_and_default_preference_update.md`
  - `item_059_workspace_shell_regression_accessibility_and_scroll_behavior.md`
  - `item_060_operations_health_floating_panel_and_header_badge.md`
  - `item_061_network_scope_summary_capsules_relocation.md`
  - `item_062_settings_header_right_entrypoint_and_left_nav_cleanup.md`
  - `item_063_inspector_context_floating_bottom_right_panel.md`

# References
- `src/app/components/WorkspaceNavigation.tsx`
- `src/app/components/workspace/WorkspaceSidebarPanel.tsx`
- `src/app/components/workspace/SettingsWorkspaceContent.tsx`
- `src/app/components/workspace/AppHeaderAndStats.tsx`
- `src/app/components/workspace/NetworkSummaryPanel.tsx`
- `src/app/components/InspectorContextPanel.tsx`
- `src/app/hooks/useUiPreferences.ts`
- `src/app/hooks/useWorkspaceNavigation.ts`
- `src/app/AppController.tsx`
- `src/tests/app.ui.networks.spec.tsx`
- `src/tests/app.ui.settings.spec.tsx`
- `src/tests/app.ui.theme.spec.tsx`
- `src/tests/app.ui.navigation-canvas.spec.tsx`
