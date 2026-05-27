# Changelog (`1.9.5 -> 1.9.6`)

## Version 1.9.6 - Import Overwrite and Grouped BOM Export

### Import / Export

- Added overwrite detection on network import: when imported networks closely match existing ones (same technical ID, same name, or name differing only by an `-IMP` suffix), a dialog is shown allowing the user to choose between overwriting the existing network or importing as a new copy.
- Added grouped multi-network BOM export: select one or more networks in the Settings import/export panel and click "Export grouped BOM (XLSX)" to download a single workbook containing, for each selected network, a BOM sheet, a by-connector termination sheet, and a wire list (fil à fil) sheet.
- Wire list sheet columns: Technical ID, Name, Twist group, Section (mm²), Color, Begin type/ref/pin/connection ref/seal ref, End type/ref/pin/connection ref/seal ref, Length (mm). Splice pins are displayed as L or R.
- BOM preferences (currency, tax, compact columns, traceability) are applied to the grouped export.

## Validation and Regression Evidence

- TypeScript strict check passes with no errors (`npx tsc --noEmit`).
