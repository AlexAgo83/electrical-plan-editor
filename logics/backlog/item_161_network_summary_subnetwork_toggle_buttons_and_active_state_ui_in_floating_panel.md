## item_161_network_summary_subnetwork_toggle_buttons_and_active_state_ui_in_floating_panel - Network Summary Subnetwork Toggle Buttons and Active-State UI in Floating Panel
> From version: 0.6.2
> Understanding: 99%
> Confidence: 97%
> Progress: 100%
> Complexity: Medium
> Theme: Convert 2D Subnetwork Chips into Actionable Toggle Controls
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
The `Network summary` floating subnetwork list is currently informational only. Users can read subnetwork aggregates but cannot interactively toggle subnetwork visibility emphasis from the panel.

# Scope
- In:
  - Convert subnetwork chips in the floating 2D panel into interactive toggle buttons.
  - Add clear active/inactive visual states consistent with existing chip/toggle patterns.
  - Preserve compact panel width and avoid layout growth from button conversion.
  - Expose accessible semantics (`button`, pressed state, labels) for the toggles.
- Out:
  - Deemphasis rendering logic for non-active subnetworks (handled separately).
  - Persistence of subnetwork toggle state across sessions.

# Acceptance criteria
- Each subnetwork row in the floating panel is interactive and can toggle between active/inactive.
- Active/inactive state is visually distinguishable and theme-compatible.
- Toggle controls do not unnecessarily enlarge the floating subnetwork panel.
- Accessibility semantics are present (`button` + state semantics such as `aria-pressed`).

# Priority
- Impact: High (core interaction entrypoint for the request).
- Urgency: High (blocks filtering behavior work).

# Notes
- Dependencies: `req_028`.
- Blocks: item_162, item_163, item_164, item_165.
- Related AC: AC1, AC6.
- References:
  - `logics/request/req_028_network_summary_2d_subnetwork_visibility_filter_toggles_and_default_tag_labeling.md`
  - `src/app/components/network-summary/NetworkCanvasFloatingInfoPanels.tsx`
  - `src/app/components/NetworkSummaryPanel.tsx`
  - `src/app/styles/canvas/canvas-toolbar-and-shell.css`
  - `src/app/styles/base/base-theme-overrides/network-canvas-entity-theme-variables.css`

