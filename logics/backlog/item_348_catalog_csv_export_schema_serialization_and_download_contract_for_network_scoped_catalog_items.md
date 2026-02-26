## item_348_catalog_csv_export_schema_serialization_and_download_contract_for_network_scoped_catalog_items - Catalog CSV export schema, serialization, and download contract for network-scoped catalog items
> From version: 0.9.8
> Understanding: 97%
> Confidence: 94%
> Progress: 0%
> Complexity: Medium
> Theme: Catalog CSV export engine + schema contract
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
The Catalog screen lacks a CSV export engine/contract, so users cannot bulk review or edit catalog items outside the app.

# Scope
- In:
  - Define a deterministic CSV schema for exporting active-network catalog items.
  - Keep V1 schema business-facing (no internal `Catalog item ID` column).
  - Implement row extraction from the active network catalog (network-scoped only).
  - Serialize rows to CSV with stable ordering and CSV-safe escaping.
  - Wire browser download filename contract (timestamped, catalog-specific).
  - Preserve blank optional fields and deterministic numeric formatting.
- Out:
  - Catalog UI button placement/wiring (handled in `item_350`).
  - CSV import parsing/upsert (handled in `item_349`).

# Acceptance criteria
- Export engine produces deterministic CSV rows for active-network catalog items with stable column order.
- Export schema excludes internal `Catalog item ID` in V1 and remains compatible with `manufacturerReference`-based round-trip import.
- CSV escaping handles commas/quotes/newlines in user fields (`manufacturerReference`, `name`, `url`).
- Export is network-scoped and does not include cross-network catalog data.
- Download contract is browser-based and uses a deterministic timestamped filename.

# Priority
- Impact: High.
- Urgency: Medium-High.

# Notes
- Dependencies: `req_062`, `req_051`.
- Blocks: `item_350`, `item_351`, `task_059`.
- Related AC: AC3.
- References:
  - `logics/request/req_062_catalog_csv_import_export_actions_and_round_trip_support.md`
  - `src/app/lib/csv.ts`
  - `src/store/catalog.ts`
  - `src/core/entities.ts`
