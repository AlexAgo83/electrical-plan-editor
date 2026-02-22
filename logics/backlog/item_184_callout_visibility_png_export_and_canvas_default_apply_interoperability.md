## item_184_callout_visibility_png_export_and_canvas_default_apply_interoperability - Callout Visibility, PNG Export, and Canvas Default Apply Interoperability
> From version: 0.6.4
> Understanding: 97%
> Confidence: 95%
> Progress: 0%
> Complexity: Medium
> Theme: Ensure Callout Visibility State Integrates Cleanly with PNG Export and Canvas Default Application Flows
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
The new callout visibility toggle interacts with existing canvas workflows (`Apply canvas defaults now`) and PNG export. Without explicit integration, exports may show hidden callouts (or hide visible ones) and the defaults flow may leave runtime state inconsistent with the configured preference.

# Scope
- In:
  - Ensure visible callouts are included in PNG export output.
  - Ensure hidden callouts are omitted from PNG export output.
  - Wire callout visibility into `Apply canvas defaults now` behavior.
  - Verify interoperability with the PNG background export option and existing canvas visibility toggles.
- Out:
  - Export-only visibility overrides.
  - Additional export formats.

# Acceptance criteria
- PNG export includes callouts only when callout visibility is enabled.
- `Apply canvas defaults now` applies the configured default callout visibility.
- No regressions to existing PNG export background behavior or other canvas toggle flows.

# Priority
- Impact: Medium-High.
- Urgency: Medium-High.

# Notes
- Dependencies: `req_031`, item_178.
- Blocks: item_186.
- Related AC: AC1, AC9, AC10.
- References:
  - `logics/request/req_031_network_summary_2d_connector_and_splice_cable_info_frames_with_draggable_callouts.md`
  - `src/app/components/NetworkSummaryPanel.tsx`
  - `src/app/hooks/useWorkspaceHandlers.ts`
  - `src/app/components/workspace/SettingsWorkspaceContent.tsx`
  - `src/tests/app.ui.settings.spec.tsx`
  - `src/tests/app.ui.network-summary-workflow-polish.spec.tsx`

