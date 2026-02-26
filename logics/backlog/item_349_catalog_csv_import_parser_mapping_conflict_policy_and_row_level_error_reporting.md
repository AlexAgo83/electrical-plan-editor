## item_349_catalog_csv_import_parser_mapping_conflict_policy_and_row_level_error_reporting - Catalog CSV import parser, mapping, conflict policy, and row-level error reporting
> From version: 0.9.8
> Understanding: 97%
> Confidence: 93%
> Progress: 100%
> Complexity: High
> Theme: Catalog CSV import parsing and deterministic upsert behavior
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
Even with catalog CSV export, users cannot bulk-create or bulk-update catalog items unless the app supports CSV import with a clear and safe row-mapping policy.

# Scope
- In:
  - Parse catalog CSV files (client-side) using the V1 schema/headers with strict header matching (no aliases).
  - Map CSV rows to `CatalogItem` fields (`manufacturerReference`, `name`, `connectionCount`, `unitPriceExclTax`, `url`).
  - Implement locked deterministic create/update conflict behavior (match on trimmed `manufacturerReference`; update on match, create otherwise).
  - Handle duplicate rows within the import file with locked policy: `last row wins` + warning reporting.
  - Provide row-level error/skip handling and import summary counts (created/updated/skipped/errors).
  - Enforce strict row validation for required/typed fields (including URL when present) and ensure invalid rows do not crash the import flow.
- Out:
  - Catalog UI button placement and file picker action placement (handled in `item_350`).
  - Export CSV serialization (handled in `item_348`).

# Acceptance criteria
- Valid CSV rows are imported into the active-network catalog with deterministic create/update behavior.
- Import only accepts the exact V1 header set (strict header matching) and rejects malformed/unknown-header files deterministically.
- Invalid rows (including invalid URL / numeric fields) are strictly skipped/rejected safely with deterministic error reporting (no crash).
- Duplicate import-row conflicts are handled via `last row wins` and are reported in import warnings.
- Import feedback includes actionable summary counts (created/updated/skipped/errors).

# Priority
- Impact: High.
- Urgency: High.

# Notes
- Dependencies: `req_062`, `item_348` (schema alignment), `req_053`/`req_059` (validation awareness).
- Blocks: `item_350`, `item_351`, `task_059`.
- Related AC: AC4, AC5.
- V1 locked decisions:
  - Matching key: trimmed `manufacturerReference`
  - Duplicate rows in import file: `last row wins` + warning
  - Validation policy: strict row validation (required fields, numeric fields, URL format)
  - Header policy: exact export headers only (no aliases in V1)
- References:
  - `logics/request/req_062_catalog_csv_import_export_actions_and_round_trip_support.md`
  - `src/core/entities.ts`
  - `src/store/catalog.ts`
  - `src/app/lib/catalogCsv.ts`
  - `src/app/AppController.tsx`
  - `src/app/hooks/useCatalogHandlers.ts`
  - `src/app/hooks/validation/buildValidationIssues.ts`
