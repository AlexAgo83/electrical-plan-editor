# Changelog (`1.5.0 -> 1.6.0`)

## Major Highlights

- BOM export is now a first-class output layer: flat row model, parallel CSV/XLSX format selection, and a two-sheet XLSX workbook with connector-grouped rows and merged cells.
- Wire termination references can now carry an optional friendly name that persists and auto-fills on reuse, making connector-level documentation faster and more consistent.
- Wire reference renames that would create conflicts across multiple wires are now staged as a plan and confirmed through an explicit choice dialog, preventing partial or silent overwrites.
- A compact-columns toggle is available on the BOM panel, reducing the exported column set for leaner worksheets.

## Version 1.6.0 - Req_119 Delivery

### BOM Export Layer Rewrite

- Unified BOM row model: connector, seal, and connection reference data now share a single flat column layout. The legacy split wire-termination block has been removed.
- New `tabularExport.ts` layer handles workbook construction and file download for both CSV and XLSX outputs. CSV behavior is unchanged when selected.
- Parallel format selection: users can explicitly choose CSV or XLSX for BOM and wire-by-wire exports via a new format selector in Settings.
- XLSX BOM workbook contains two sheets: a global summary sheet and a connector-grouped sheet with merged connector ID and name cells, stable row ordering, and correct per-sheet quantities.
- Compact-columns toggle in the BOM panel reduces the exported column set (hides tax, unit price, and extended price columns) without affecting the on-screen catalog or summary table.
- `exceljs` added as a runtime dependency to support XLSX serialization.

### Wire Reference Naming Fallback

- Seal references and connection references now carry an optional `name` field in the wire termination data model.
- When the same reference is entered again on any wire, the previously recorded name is suggested as a fallback and pre-filled automatically.
- Name fields are editable from both the form-entry flow and the catalog-linked flow. An empty name stays empty — no forced naming.
- Persistence schema bumped with a forward migration that sets `name: null` on existing records lacking the field.
- New `wireReferences.ts` module centralises reference lookup, name normalisation, and fallback resolution.

### Wire Reference Rename — Atomicity and Conflict Resolution

- Fixed a bug where renaming a wire reference that appears on multiple wires could be applied partially if some wires had conflicting values.
- Renames are now staged as a sync plan before being applied. When a conflict is detected, a `ChoiceDialog` is shown to let the user confirm or discard the operation.
- New `ChoiceDialog` component and `useChoiceDialogController` hook handle the choice surface. The dialog uses the same confirm-dialog CSS foundation for visual consistency.
- `useWireHandlers` refactored to route rename decisions through the new choice action path.

### Architecture

- `adr_005` created, covering the unified BOM row model, parallel CSV/XLSX format, XLSX workbook layout, catalog export column toggles, and reference naming fallback contracts.

## Validation and Regression Evidence

- `npm run lint`
- `npm run typecheck`
- `npm run test:ci:fast`
- `npm run test:ci:ui`
- `npm run test:e2e`
- `npm run build`
- `python3 logics/skills/logics-doc-linter/scripts/logics_lint.py`
- `python3 logics/skills/logics-flow-manager/scripts/workflow_audit.py --legacy-cutoff-version 1.1.0 --skip-ac-traceability`
