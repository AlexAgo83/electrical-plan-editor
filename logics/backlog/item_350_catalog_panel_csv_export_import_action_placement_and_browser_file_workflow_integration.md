## item_350_catalog_panel_csv_export_import_action_placement_and_browser_file_workflow_integration - Catalog panel CSV export/import action placement and browser file workflow integration
> From version: 0.9.8
> Understanding: 99% (user specified exact button placements for both export and import actions)
> Confidence: 95%
> Progress: 0%
> Complexity: Medium-High
> Theme: Catalog UI action integration for CSV portability workflows
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
CSV export/import capabilities are not discoverable unless they are integrated into the Catalog UI with ergonomic placement that matches existing table patterns and user expectations.

# Scope
- In:
  - Add Catalog header CSV export action in the list header tools row.
  - Placement contract:
    - position the export action **before `Help`**
    - reuse the table CSV export action pattern (`filter-chip table-export-button`) used in connectors tables.
  - Add Catalog bottom-row CSV import action in the main action row.
  - Placement contract:
    - action order becomes `New`, `Edit`, `Import CSV` (or `Import`), `Delete`
    - import action is **between `Edit` and `Delete`**
  - Wire browser workflows:
    - export -> CSV download
    - import -> file picker (`.csv`) and callback into import parser flow
  - If Catalog is non-empty, show a confirmation before merge/upsert import and keep the user in the Catalog workflow.
  - Surface import summary feedback in the Catalog panel (local status line/message), not in Settings.
  - Preserve existing `Delete` styling/semantics and `Help` behavior.
- Out:
  - CSV export serialization internals (handled in `item_348`)
  - CSV import parser/conflict logic (handled in `item_349`)

# Acceptance criteria
- Catalog header tools row shows a CSV export action before `Help`.
- Catalog bottom action row shows CSV import action between `Edit` and `Delete`.
- Export action triggers CSV download using the export engine.
- Import action opens file picker and triggers the import workflow.
- Import on non-empty catalog asks for confirmation before applying merge/upsert changes.
- Import summary feedback is visible in the Catalog panel after completion/failure.
- Existing Catalog CRUD and Help actions remain functional and aligned in responsive layouts.

# Priority
- Impact: High.
- Urgency: High.

# Notes
- Dependencies: `req_062`, `item_348`, `item_349`.
- Blocks: `item_351`, `task_059`.
- Related AC: AC1, AC2, AC6.
- Related AC (extended): AC5a, AC5b.
- References:
  - `logics/request/req_062_catalog_csv_import_export_actions_and_round_trip_support.md`
  - `src/app/components/workspace/ModelingCatalogListPanel.tsx`
  - `src/app/components/workspace/ModelingPrimaryTables.tsx`
  - `src/app/AppController.tsx`
  - `src/app/hooks/controller/useAppControllerScreenContentSlices.tsx`
