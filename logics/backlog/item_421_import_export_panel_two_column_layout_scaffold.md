## item_421_import_export_panel_two_column_layout_scaffold - Import/Export panel two-column layout scaffold
> From version: 0.9.18
> Status: Done
> Understanding: 99%
> Confidence: 97%
> Progress: 100%
> Complexity: Low
> Theme: Settings panel layout compaction
> Reminder: Update status/understanding/confidence/progress and linked task references when you edit this doc.

# Problem
The current Import/Export panel layout is vertically stretched and lacks a two-column scaffold on readable widths.

# Scope
- In:
  - introduce two-column structure for panel body on desktop/tablet;
  - place selected-networks fieldset in right column;
  - ensure responsive collapse to one column when width is insufficient.
- Out:
  - import/export behavior changes;
  - unrelated settings panel redesign.

# Acceptance criteria
- AC1: Two-column layout is active when readable width allows.
- AC2: Right column hosts `Selected networks for export`.
- AC3: Mobile/narrow fallback collapses cleanly to one column.

# Priority
- Impact: Medium.
- Urgency: Medium.

# Notes
- Dependencies: `req_082`.
- Blocks: `item_422`, `item_424`, `task_073`.
- Related AC: `AC1`, `AC2`, `AC5`, `AC6`.
- References:
  - `logics/request/req_082_import_export_networks_panel_two_column_compaction_and_right_side_selected_export_list.md`
  - `src/app/components/workspace/SettingsWorkspaceContent.tsx`
  - `src/app/styles/validation-settings/validation-and-settings-layout.css`
