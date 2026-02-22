## item_163_subnetwork_multiselect_enable_all_control_and_default_tag_display_formatting - Subnetwork Multi-Select Enable-All Control and Default Tag Display Formatting
> From version: 0.6.2
> Understanding: 99%
> Confidence: 97%
> Progress: 100%
> Complexity: Medium
> Theme: Multi-Selection UX and Display-Layer Label Normalization for Subnetwork Filters
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
The requested subnetwork filtering UX requires free-form multi-selection and a quick way to restore full visibility, plus a clearer display treatment for the default subnetwork tag (`(default)` -> `DEFAULT` italic). These behaviors are not currently available.

# Scope
- In:
  - Support arbitrary multi-selection of active subnetworks (one, many, all).
  - Add an `Enable all` control at the top of the subnetwork list.
  - Keep all subnetworks active by default when the panel/session starts.
  - Render `(default)` as italic `DEFAULT` in the floating panel display layer.
  - Keep the `Enable all` control compact and visually aligned with floating panel controls.
- Out:
  - Persisting subnetwork filter state across app sessions (unless explicitly introduced and documented).
  - Advanced modes (invert/isolate presets/save presets).

# Acceptance criteria
- Users can independently toggle any subset of subnetworks on/off.
- A compact `Enable all` control exists at the top of the subnetwork list and restores all subnetworks active.
- Initial state defaults to all subnetworks active.
- The default subnetwork tag is displayed as `DEFAULT` in italic style in the floating panel.

# Priority
- Impact: High (core UX completeness).
- Urgency: High.

# Notes
- Dependencies: item_161.
- Blocks: item_164, item_165.
- Related AC: AC2, AC4, AC5, AC6.
- References:
  - `logics/request/req_028_network_summary_2d_subnetwork_visibility_filter_toggles_and_default_tag_labeling.md`
  - `src/app/components/network-summary/NetworkCanvasFloatingInfoPanels.tsx`
  - `src/app/components/NetworkSummaryPanel.tsx`
  - `src/app/styles/canvas/canvas-toolbar-and-shell.css`
  - `src/tests/app.ui.navigation-canvas.spec.tsx`

