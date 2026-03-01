## item_422_import_export_panel_action_flow_reorder_with_import_under_export_all - Import/Export panel action flow reorder with import under export-all
> From version: 0.9.18
> Status: Done
> Understanding: 99%
> Confidence: 97%
> Progress: 100%
> Complexity: Low
> Theme: Action sequencing clarity in Settings portability panel
> Reminder: Update status/understanding/confidence/progress and linked task references when you edit this doc.

# Problem
Current action ordering does not group export and import actions in the compacted left-column flow as requested.

# Scope
- In:
  - position `Import from file` below export actions in left column;
  - preserve export scope actions order and enabled/disabled logic;
  - keep status and summary readability in new flow.
- Out:
  - import/export handler refactor;
  - file format or workflow contract changes.

# Acceptance criteria
- AC1: Left column action stack shows Export Active/Selected/All then Import from file.
- AC2: Action behavior and guards remain unchanged.
- AC3: Import summary/status remain readable in new composition.

# Priority
- Impact: Medium.
- Urgency: Medium.

# Notes
- Dependencies: `req_082`, `item_421`.
- Blocks: `item_424`, `task_073`.
- Related AC: `AC3`, `AC4`, `AC6`.
- References:
  - `logics/request/req_082_import_export_networks_panel_two_column_compaction_and_right_side_selected_export_list.md`
  - `src/app/components/workspace/SettingsWorkspaceContent.tsx`
  - `src/tests/app.ui.import-export.spec.tsx`
