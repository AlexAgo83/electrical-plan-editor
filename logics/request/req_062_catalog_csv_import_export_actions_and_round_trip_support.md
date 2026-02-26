## req_062_catalog_csv_import_export_actions_and_round_trip_support - Catalog CSV import/export actions and round-trip support
> From version: 0.9.8
> Understanding: 100% (UI placements and V1 import/export contracts now locked: key matching, duplicate handling, strict row validation, schema without internal ID, non-empty-catalog confirmation, local import summary, strict headers)
> Confidence: 96% (contract decisions are now explicit and implementation-ready)
> Complexity: Medium-High
> Theme: Catalog portability / CSV import-export / list-panel action ergonomics
> Reminder: Update Understanding/Confidence and dependencies/references when you edit this doc.

# Needs
- Users need to export the active-network `Catalog` as CSV for external editing/review.
- Users need to import catalog items from a CSV file back into the active-network `Catalog`.
- The user explicitly wants:
  - a `Catalog CSV export` button added **before `Help`** in the Catalog list header tools row (same interaction pattern as connectors tables),
  - a `Catalog CSV import` button added **between `Edit` and `Delete`** in the Catalog bottom action row.

# Context
The app already includes:
- a network-scoped `Catalog` screen (`req_051`) with CRUD and validation,
- CSV download helpers used in other tables and BOM export,
- validation support for catalog integrity and duplicate manufacturer references (`req_053`, `req_059`),
- pricing fields (`unitPriceExclTax`) and catalog/BOM pricing settings (`req_057`).

What is still missing is a direct CSV portability workflow for catalog items:
- **Export CSV** from the Catalog screen for bulk review/editing,
- **Import CSV** into the Catalog screen for bulk creation/update.

# Objective
- Add catalog CSV export and import actions to the `Catalog` UI with the requested placements.
- Define a deterministic CSV schema that supports practical round-trip (`export -> edit -> import`).
- Keep imports safe, validation-friendly, and non-destructive to unrelated network data.

# Functional scope
## A. Catalog CSV export action placement and UX (high priority)
- Add a `CSV` export action to the Catalog list header tools row.
- Placement contract:
  - in the Catalog list panel header tools row,
  - **before `Help`**,
  - same visual/button pattern as connectors tables (`filter-chip table-export-button` style).
- The action should export the active network's catalog items (network-scoped catalog), not cross-network workspace catalog data.
- The action should remain usable in responsive layouts and must not break existing header tool layout behavior.

## B. Catalog CSV export schema and serialization (high priority)
- Export format: browser-downloaded `.csv` file (no backend).
- Recommended filename pattern:
  - `catalog-items-<timestamp>.csv`
- V1 exported columns (stable order, English labels):
  - `Manufacturer reference` (required field in domain model)
  - `Name`
  - `Connection count`
  - `Unit price (excl. tax)`
  - `URL`
- V1 schema decision (locked):
  - **do not include `Catalog item ID`** in export/import
  - round-trip key is business-facing `Manufacturer reference`
- Export requirements:
  - deterministic row ordering (recommended: `manufacturerReference`, then `id`)
  - CSV-safe escaping for commas/quotes/newlines
  - preserve blank optional fields as blank cells
  - numeric formatting deterministic (`.` decimal separator)

## C. Catalog CSV import action placement and file workflow (high priority)
- Add an import action/button in the Catalog list bottom action row.
- Placement contract:
  - action row currently contains `New`, `Edit`, `Delete`,
  - add `Import CSV` (or `Import`) **between `Edit` and `Delete`**
  - preserve `Delete` danger styling and existing disabled-state semantics
- The import action opens a file picker for `.csv`.
- Import action should not require a selected catalog row.
- V1 non-empty catalog behavior (locked):
  - import mode is **merge/upsert** (not replace-all)
  - if the current catalog is non-empty, show a confirmation before import
  - confirmation copy should explicitly mention that rows may update existing catalog items by `Manufacturer reference`

## D. Catalog CSV import parsing and row mapping (high priority)
- V1 header contract (locked):
  - import accepts only the exact export headers (strict header matching)
  - no header aliases in V1
- Row mapping targets `CatalogItem` fields:
  - `manufacturerReference` (required; trimmed)
  - `name` (optional; blank -> unset/empty per existing form conventions)
  - `connectionCount` (required integer > 0)
  - `unitPriceExclTax` (optional number >= 0)
  - `url` (optional; may be blank)
- Invalid rows must not crash import.
- V1 validation policy (locked): **strict row validation**
  - reject/skip rows with invalid required/typed fields instead of importing partial malformed data
  - strict checks include:
    - `manufacturerReference` missing/blank after trim
    - `connectionCount` not a valid integer `> 0`
    - `unitPriceExclTax` present but not a valid number `>= 0`
    - `url` present but invalid (URL format)
- V1 import should provide deterministic handling/reporting for:
  - missing required values
  - invalid numeric values (`connectionCount`, `unitPriceExclTax`)
  - invalid URL values (`url`)
  - malformed CSV rows
  - duplicate manufacturer references inside the import file

## E. Import conflict policy (high priority)
- Define a deterministic V1 upsert policy for rows matching existing catalog items.
- V1 policy (locked):
  - match existing items by normalized `manufacturerReference` (trimmed)
  - matching row updates existing catalog item fields (preserve existing internal `id`)
  - non-matching row creates a new catalog item
- Duplicate rows in the same import file (locked behavior):
  - **last row wins**
  - import summary must report a warning count/message for duplicate-manufacturer-reference collisions resolved this way
- Import must stay network-scoped (active network catalog only) and must not mutate connectors/splices directly.

## F. Post-import UX feedback and validation interplay (medium-high priority)
- After import, users need actionable feedback:
  - created count
  - updated count
  - skipped/error row count
- V1 feedback placement (locked):
  - show import summary/status in the `Catalog` panel (local UI message/status line)
  - do not reuse `Settings` import/export status UX for Catalog CSV import
- Import is not a substitute for validation:
  - V1 strict import rejects malformed rows before they enter catalog state,
  - accepted rows should still remain compatible with downstream Validation behavior and category counts.
- Strict import policy and row-level error reporting must be explicitly tested.

## G. Regression coverage and round-trip confidence (medium priority)
- Add regression coverage for:
  - Catalog header CSV export action presence and placement before `Help`
  - Catalog bottom-row import action placement between `Edit` and `Delete`
  - CSV export serialization schema/order and escaping
  - CSV import parsing for valid rows and invalid-row resilience
  - deterministic create/update conflict behavior
  - round-trip smoke path (`export -> import`) on representative catalog data
- Preserve existing Catalog CRUD and `Help` behavior (no regression in action ordering and disabled states).

# Non-functional requirements
- Import/export must be fully client-side and responsive on typical catalog sizes.
- Parsing/serialization should be deterministic to reduce flaky tests and noisy diffs.
- No regressions to existing Catalog CRUD, validation navigation, or pricing display behavior.

# Validation and regression safety
- Add/extend tests for:
  - export button placement before `Help` in Catalog header tools row
  - import button placement between `Edit` and `Delete` in Catalog row actions
  - export CSV columns/order/escaping
  - import row parsing, invalid-row handling, and deterministic summary counts
  - non-empty-catalog confirmation before import (merge/upsert flow)
  - local Catalog import summary rendering (created/updated/skipped/errors/warnings)
  - create/update conflict policy and duplicate-import-row behavior
  - Catalog CRUD/Help non-regression after action insertion
- Run full validation pipeline after implementation (`lint`, `typecheck`, `quality:*`, `build`, `test:ci`, `test:e2e`, `logics_lint`)

# Acceptance criteria
- AC1: The Catalog screen exposes a CSV export action in the list header tools row, positioned **before `Help`**.
- AC2: The Catalog screen exposes a CSV import action in the bottom action row, positioned **between `Edit` and `Delete`**.
- AC3: Catalog CSV export downloads a deterministic CSV of active-network catalog items with stable columns and safe escaping.
- AC4: Catalog CSV import parses supported CSV rows and creates/updates catalog items using a documented deterministic conflict policy.
- AC5: Invalid CSV rows (including invalid URL / invalid numeric fields) do not crash import and are strictly skipped/rejected with deterministic error reporting and user-visible feedback.
- AC5a: When the current catalog is non-empty, import uses merge/upsert mode and asks for confirmation before applying changes.
- AC5b: Import feedback is displayed in the Catalog panel (local status/summary), including warnings for duplicate-row `last row wins` resolutions.
- AC6: Existing Catalog CRUD/help interactions remain functional and visually coherent after adding the new actions.
- AC7: Regression coverage exists for action placement, export schema/escaping, import parsing/conflicts, and a round-trip smoke path.

# Out of scope
- XLSX/Excel native import/export.
- Cross-network catalog merge workflows (bulk import into multiple networks at once).
- Advanced import field mapping UI (column mapping wizard) in V1.
- Remote catalog sync/backend APIs.

# Backlog
- `logics/backlog/item_348_catalog_csv_export_schema_serialization_and_download_contract_for_network_scoped_catalog_items.md`
- `logics/backlog/item_349_catalog_csv_import_parser_mapping_conflict_policy_and_row_level_error_reporting.md`
- `logics/backlog/item_350_catalog_panel_csv_export_import_action_placement_and_browser_file_workflow_integration.md`
- `logics/backlog/item_351_regression_coverage_for_catalog_csv_import_export_round_trip_and_action_placement.md`

# Orchestration task
- `logics/tasks/task_059_req_062_catalog_csv_import_export_orchestration_and_delivery_control.md`

# References
- `src/app/components/workspace/ModelingCatalogListPanel.tsx`
- `src/app/components/workspace/ModelingPrimaryTables.tsx`
- `src/app/lib/csv.ts`
- `src/store/catalog.ts`
- `src/core/entities.ts`
- `src/tests/app.ui.catalog.spec.tsx`
- `src/tests/csv.export.spec.ts`
- `logics/request/req_051_catalog_screen_with_catalog_item_crud_navigation_integration_and_required_manufacturer_reference_connection_count.md`
- `logics/request/req_053_validation_catalog_integrity_issues_and_catalog_go_to_navigation_support.md`
- `logics/request/req_057_catalog_and_bom_settings_currency_and_tax_defaults.md`
