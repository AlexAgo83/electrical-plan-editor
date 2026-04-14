## item_588_grouped_bom_workbook_with_merged_connector_rows - Grouped BOM Workbook With Merged Connector Rows
> From version: 1.4.4
> Schema version: 1.0
> Status: Ready
> Understanding: 95%
> Confidence: 86%
> Progress: 0%
> Complexity: High
> Theme: Export
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
The BOM XLSX export needs a second sheet grouped by connector, with merged connector identity cells and correct connector-level quantities.

# Scope
- In:
  - Build a two-sheet BOM workbook.
  - Keep the first sheet as the global summary view.
  - Add a second sheet grouped by connector.
  - Merge the connector ID and name cells across each connector group.
  - Order grouped rows so each connector is followed by its related rows in a stable sequence.
- Out:
  - CSV export behavior.
  - Catalog export controls.
  - Wire-by-wire XLSX formatting.

```mermaid
%% logics-kind: backlog
%% logics-signature: backlog|grouped-bom-workbook-with-merged-connector-rows|req-119-bom-and-catalog-export-enhancement|two-sheet-bom-workbook|ac1-two-bom-sheets-and-merged-cells
flowchart TD
    Request[req 119 bom and catalog export enhancements] --> Problem[Grouped BOM workbook]
    Problem --> Scope[Two sheet BOM XLSX]
    Scope --> Acceptance[AC1 two sheets and merged cells]
    Acceptance --> Tasks[Implementation task]
```

# Acceptance criteria
- AC1: The BOM XLSX export contains a global summary sheet and a connector-grouped sheet.
- AC2: The grouped sheet merges the connector ID and connector name cells across the rows in each connector group.
- AC3: The grouped sheet keeps connector-related rows under the right connector and preserves a stable order.
- AC4: Quantity totals are correct in both sheets.

# AC Traceability
- AC1 -> Two sheet workbook.
- AC2 -> Merged connector identity cells.
- AC3 -> Group rows by connector in a stable order.
- AC4 -> Correct quantities in both views.

# Decision framing
- Product framing: Not needed
- Architecture framing: Required
- Architecture signals: workbook layout, merged-cell rules, and export integration
- Architecture follow-up: Create or link an architecture decision before implementation because the workbook structure is a new export contract.

# Links
- Product brief(s): (none yet)
- Architecture decision(s): `adr_005_bom_and_export_contracts_for_csv_xlsx_and_reference_naming`
- Request: `req_119_bom_and_catalog_export_enhancements`
- Primary task(s): `task_102_grouped_bom_workbook_with_merged_connector_rows`

# Priority
- Impact: High
- Urgency: High

# Notes
- Derived from request `req_119_bom_and_catalog_export_enhancements`.
- Source file: `logics/request/req_119_bom_and_catalog_export_enhancements.md`.
- This slice covers the workbook layout and formatting layer.
