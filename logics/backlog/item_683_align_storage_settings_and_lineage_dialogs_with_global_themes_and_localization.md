## item_683_align_storage_settings_and_lineage_dialogs_with_global_themes_and_localization - Align storage settings and lineage dialogs with global themes and localization
> From version: 1.19.0
> Schema version: 1.0
> Status: Done
> Understanding: 95%
> Confidence: 90%
> Progress: 100%
> Complexity: Medium
> Theme: Workspace storage settings
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.
> Indicators reviewed: 2026-10-08 10:16:12

# AI Context
- Lineage UI uses bespoke controls and fixed status colors, while Settings search still describes legacy actions.
- Follow the parent request action disposition and storage-mode contracts. Preserve lineage recovery and history semantics.

# Problem
- Lineage UI uses bespoke controls and fixed status colors, while Settings search still describes legacy actions.

# Scope
- In:
  - Reuse Settings panel, action-row, icon/button, input, details, status and dialog conventions across the relocated UI and remaining Home/context surfaces.
  - Replace fixed status colors with existing semantic theme styles; validate all theme enum values including custom variants and dialog overlays.
  - Update semantic EN/FR dictionaries and mode-aware Settings search/highlighting/counts; preserve the section anchor and keyboard section navigation.
  - Ensure narrow-screen wrapping, long translated labels/workspace names, accessible state labels, visible focus and focus return when dialog navigation replaces its trigger.
- Out:
  - New persistence formats, cloud sync, network import/export redesign and deletion of user history.

# Acceptance criteria
- AC1: All supported themes show consistent surfaces and readable interactive/status states, with evidence for actual browser rendering; screenshots cover representative light, dark and custom themes.
- AC2: At 360px and desktop widths, long EN/FR labels do not create page overflow; keyboard-only section and dialog flows work.
- AC3: New actions are searchable and highlighted in EN/FR; removed or unavailable legacy controls do not appear as named-mode search hits; i18n validation passes.

# AC Traceability
- request-AC5 -> This backlog slice. Proof: AC1: All supported themes show consistent surfaces and readable interactive/status states, with evidence for actual browser rendering; screenshots cover representative light, dark and custom themes.
- request-AC6 -> This backlog slice. Proof: AC2: At 360px and desktop widths, long EN/FR labels do not create page overflow; keyboard-only section and dialog flows work.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_019_workspace_storage_settings_information_architecture_and_theme_consistency`
- Architecture decision(s): (none yet)
- Request: `req_168_consolidate_release_1_19_workspace_controls_in_settings_storage_and_align_global_ui`
- Primary task(s): `task_165_deliver_workspace_storage_settings_consolidation_and_ui_alignment`

# Priority
- Priority: High
- Rationale: Set by scaffold input or defaulted for grooming.

# Tasks
- `task_165_deliver_workspace_storage_settings_consolidation_and_ui_alignment`

# Notes
- Task `task_165_deliver_workspace_storage_settings_consolidation_and_ui_alignment` was finished via `logics-manager flow finish task` on 2026-10-08.
