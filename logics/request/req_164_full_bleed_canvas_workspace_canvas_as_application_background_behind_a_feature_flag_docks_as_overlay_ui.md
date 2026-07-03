## req_164_full_bleed_canvas_workspace_canvas_as_application_background_behind_a_feature_flag_docks_as_overlay_ui - Full-bleed canvas workspace: canvas as application background behind a feature flag, docks as overlay UI
> From version: 1.18.1
> Schema version: 1.0
> Status: Draft
> Understanding: 90%
> Confidence: 85%
> Complexity: High
> Theme: Canvas-first workspace UX
> Reminder: Update status/understanding/confidence and linked backlog/task references when you edit this doc.

# Needs
- The network canvas must become the application background on canvas-centric screens, with all other UI floating above it as overlay layers (reference model: Figma/Miro — the canvas is the world, the UI is an overlay). Today the canvas is a grid child inside workspace-content, squeezed alongside sidebars, tables, and forms.
- The new layout must ship as an opt-in mode behind a persisted settings preference: flag off means zero render or behavior difference, so the existing workspace keeps working untouched and rollback is instant.
- Entity work must flow canvas-first: click an entity on the canvas, its inspector opens in a right dock, edit, Escape collapses it — replacing the table-to-canvas round-trips.
- Wide panels must be transformed for dock width, never compressed: forms stack in a single column with accordion sections, embedded wide tables become key-value rows with truncation, side-by-side detail panels become a drill-in stack with breadcrumb. Depth replaces width; there is never a third column.
- All ~30 existing themes must stay readable in the new mode without per-theme rework: dock surfaces derive from existing theme variables, with readability guaranteed by construction (opacity floor), not by luck.
- The model must hold at real scale: a real user-exported production network (~30 connectors, 150 wires, 18 splices, 47 segments, very horizontal aspect ratio ~3.5:1) fits at roughly 23% zoom, which demands zoom-level decluttering (hide dimension labels below a threshold, collapse co-located connector clusters into a count badge, truncate long attached-wire lists).

# Context
- This request absorbs an unversioned design exploration (2026-07-03, working folder logics/external/: a full CR, six target-UX HTML mockups rendered to PNG, current-app captures, and real workspace exports used as the stress-test dataset). Because that folder is not versioned, this corpus is the durable record of its findings; the key ones are restated below.
- Target architecture is three layers. Background layer (z-0): the canvas uses position: fixed; inset: 0, mounted only on canvas-centric screens. Panel layer: a full-screen container with pointer-events: none where each panel restores pointer-events: auto, so clicks between panels reach the canvas; panels are floating cards with backdrop-filter. Modal/drawer layer: unchanged, already above everything. The app already has half this vocabulary (fixed navigation drawers, ops panel, blurred backdrops, canvas floating controls); the canvas is the part still trapped in the grid.
- Navigation model from the mockups: a ~48 px left icon rail replaces tabs (Home, Modeling, Scope, Analysis, Validation, Stats, Settings); an ultra-thin (~40 px) translucent header carries the active-network picker, breadcrumb, and global stats; a left dock hosts entity lists and a right dock hosts the inspector/forms, both collapsible to edge handles; Cmd+backslash hides/shows all panels (Tab was considered and withdrawn — it breaks keyboard-accessibility focus traversal); Cmd+K opens a direct-navigation palette that centers the canvas on any entity and opens its inspector (builds on the existing NetworkSummaryQuickEntityNavigation).
- Screen-by-screen audit verdicts: full-bleed for Network Scope (pilot), Harness Assembly, Analysis (biggest win: route highlighting lights up the whole background canvas), and Validation (click an issue to center the canvas on the offending entity and open its inspector). Central-panel mode (dense content in a near-full panel over a neutral background) for Modeling tables, Statistics, Settings, Home, and Catalog. Every existing panel maps to one of {background mode, left dock, right dock, floating bar/card, central panel, dialog}; nothing in the inventory resists the model.
- Real-scale stress test findings (mockup rendered from a real network export): fit-to-content lands at ~23% zoom, so dimension labels must hide below a zoom threshold and splice labels soften; one physical cluster of five co-located connectors overlaps unreadably and must collapse into a count badge below a threshold; the densest connector carries 27 attached wires, so the inspector accordion needs truncation with a view-all escape; search plus entity-type filter chips in the left dock are essential beyond ~30 entities.
- Feature-flag mechanics verified against the code: useAppControllerShellDerivedState builds appShellClassName as a preference-driven token list (table-density-compact, workspace-wide-screen, theme classes) — the mode is one more token (canvas-bleed) applied only when the flag is on and the active screen supports it; useUiPreferences already manages persisted booleans with localStorage hydration, so the flag is one more preference plus a Settings toggle. CSS-first: same component tree, same state, only the layout layer changes under .app-shell.canvas-bleed.
- The one place the flag crosses into logic is the safe area — the most structural risk. useNetworkSummaryViewportSizeChange and fit-to-content measure the container; in full bleed the viewport is the whole screen but open docks occlude part of it, so fit, zoom, Cmd+K centering, and center-on-issue must target the genuinely visible area via dynamic insets (measured dock widths when the flag is on, zero otherwise).
- Wide-panel transformation verified against the code: existing responsive styles trigger on @media (max-width: 900px) — viewport width — so the app already knows how to render every panel narrow but measures the wrong thing; a panel inside a 340 px dock on a 1920 px screen stays in wide mode. The fix is container queries: the dock gets container-type: inline-size and the narrow rules migrate to @container, including the visible-column threshold of ConfigurableTableColumns. Two fixed dock widths (~340 px for analysis sheets, ~440 px for heavy forms), no free resizing. InspectorContextPanel already plays the inspector role conceptually and becomes the dock's single host (breadcrumb, drill-in stack, accordions); existing panels become its content, not its neighbors. 2D content (connector physical view, grids) never goes in the dock — background mode or floating card.
- Themes verified against the code: ~30 ThemeMode values across ~27 override CSS files make any per-theme pass unaffordable. The mode introduces a handful of semantic variables (--dock-surface, --dock-border, --dock-blur, --canvas-scrim) defined once at shell level and derived from existing theme variables via color-mix, with an opacity floor of at least ~85% so dock text always sits on the panel surface. Dark and light themes are safe by construction; the risky cases are midrange themes where canvas and panel converge in luminance — that is what the optional scrim is for. prefers-reduced-transparency gets an opaque fallback through the same variable. Validation is a Playwright contact sheet (one screenshot per theme of the pilot screen, flag on), not eyeballing.
- Honest list of what the model breaks (kept out of this request's scope but recorded): the 9-step onboarding tour works by scrolling the page to a target panel and must be rebuilt as a spotlight pattern; small screens need a redesign of their own (docks become a three-state bottom sheet, the rail a bottom tab bar) — noting that full bleed is also mobile's biggest upside since the plan becomes the screen; Settings/Home reorganization is an independent effort.
- Anti-pattern explicitly refused: a second shell (AppShellLayoutV2). Two shells diverge within weeks and the flag becomes unremovable. One shell, one CSS mode, one insets parameter — abandoning the experiment must reduce to deleting a token, a CSS block, and a preference.

# Acceptance criteria
- AC1: With the preference off (default), the rendered workspace is unchanged — the existing shell regression suite passes without modification and no canvas-bleed class token or CSS applies.
- AC2: With the preference on, Network Scope renders the canvas as a fixed full-viewport background with the network table as a left-dock overlay and the scope form as a right-dock overlay; fit-to-content, zoom, and centering target the visible safe area between open docks (dynamic insets), not the full window.
- AC3: In bleed mode, canvas interactions survive the overlay routing: callout and node dragging work (acceptance test #1), wheel over a panel scrolls the panel while wheel over the canvas zooms, and clicks between panels reach the canvas.
- AC4: Wide panel content adapts to dock width via container-width rules, not compression: forms stack single-column with accordion sections at ~440 px, embedded wide tables render as key-value rows with a truncation escape to a central panel, and detail chains render as a breadcrumbed drill-in stack in the right dock with no third column ever.
- AC5: Every shipped theme is readable in bleed mode through derived dock-surface variables with an opacity floor — no per-theme CSS beyond point overrides justified by a generated all-themes contact sheet, which is produced by a rerunnable script.
- AC6: The Analysis screen runs full-bleed with route/entity highlighting on the background canvas and inspector details in the right-dock drill-in, and the canvas declutters at low zoom (dimension labels hidden below a threshold, co-located connector clusters collapsed to a count badge) validated against a real-scale network of at least 30 connectors and 150 wires.
- AC7: Removing the experiment reduces to deleting the preference, the class token, and the mode CSS — no component forks, no second shell, and no behavior change for flag-off users at any point.

# Definition of Ready (DoR)
- [x] Problem statement is explicit and user impact is clear.
- [x] Scope boundaries (in/out) are explicit.
- [x] Acceptance criteria are testable.
- [x] Dependencies and known risks are listed.

# Companion docs
- Product brief(s): `prod_015_canvas_first_workspace_shell`
- Architecture decision(s): (none yet)

# References
- src/app/components/layout/AppShellLayout.tsx
- src/app/hooks/useAppControllerShellDerivedState.ts
- src/app/hooks/useUiPreferences.ts
- src/app/components/network-summary/NetworkSummaryCanvasPanel.tsx
- src/app/components/InspectorContextPanel.tsx
- src/app/components/network-summary/NetworkSummaryQuickEntityNavigation.tsx
- src/app/styles/workspace/workspace-panels-and-responsive/action-icons-and-responsive-overrides.css
- src/app/styles/base/base-theme-overrides/network-canvas-entity-theme-variables.css
- src/store/types.ts
- src/tests/app.ui.workspace-shell-regression.spec.tsx

# AI Context
- Summary: Full-bleed canvas workspace: canvas as application background behind a feature flag, docks as overlay UI
- Keywords: request-chain-scaffold, full-bleed canvas workspace: canvas as application background behind a feature flag, docks as overlay ui, development-ready
- Use when: You need to implement or review the scaffolded workflow for Full-bleed canvas workspace: canvas as application background behind a feature flag, docks as overlay UI.
- Skip when: The change is unrelated to this scaffolded request chain.

# Backlog
- `item_661_canvas_bleed_foundations_and_network_scope_pilot_behind_a_settings_flag`
- `item_662_derived_dock_surface_theme_variables_with_all_themes_contact_sheet_validation`
- `item_663_dock_content_system_container_queries_inspector_host_drill_in_stack`
- `item_664_analysis_screen_full_bleed_with_route_highlighting_and_low_zoom_decluttering`
