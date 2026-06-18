# Changelog (`1.16.3 -> 1.16.4`)

## Major Highlights

- Wire-to-wire exports now expose the connection and seal **reference** and **name** in separate columns instead of concatenating them as `ref - name`. This makes the wire list easier to filter, sort and reconcile against the BOM.

## Patch Notes

- `resolveWireExportEndpointMaterials` now returns `connectionRef`, `connectionName`, `sealRef` and `sealName` separately (the previous `"ref - name"` concatenation helper was removed).
- `buildWireListSheet` and the Analysis/Modeling wire CSV/XLSX exports now emit `Begin connection ref`, `Begin connection name`, `Begin seal ref`, `Begin seal name` (and the matching `End ...` columns) instead of the two combined columns.
- Updated wire-list and list-ergonomics CSV header tests to the new column layout and indexes.
- Aligned release metadata to `1.16.4` across `VERSION`, `package.json`, `package-lock.json`, and `README.md`.

## Version 1.16.4 - Split Wire Export Reference And Name Columns

### Exports

- The combined `connection ref` / `seal ref` columns are split into dedicated reference and name columns for both Begin and End endpoints across the wire-list sheet and the Analysis/Modeling tabular exports.
- Splice ends still never carry a seal reference; empty reference/name cells are emitted rather than a placeholder.

### Verification

- `npm run -s typecheck`
- `npm run -s lint`
- `npm run -s test:ci:fast` (497 tests passing)
- `npm run -s test:ci:ui` (all chunks passing)
- Focused suites: `wire-list-export`, `app.ui.list-ergonomics`, `app.ui.wire-export-preview`, `app.ui.grouped-bom-wire-list`

### Notes

- Follow-up refinement on top of `1.16.3`; no workflow doc changes.
- Full Playwright e2e is not run locally in this WSL environment; it is validated by remote CI.
