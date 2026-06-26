# Changelog (`1.16.9 -> 1.16.10`)

## Major Highlights

- Wire-to-wire exports now include a right-side reference table starting at column `AA`, listing connector, splice, and node names alongside their display IDs and internal IDs for downstream processing.
- Wire exports now expose an `Untwisted length (mm)` column for actual twisted groups. It keeps the stripping allowance but omits the twisted-pair coefficient, making pre-twist lengths available without changing the existing `Length (mm)` value.

## Patch Notes

- Added shared wire export helpers to append the reference table consistently across grouped wire-list exports, Modeling wire table exports, and Analysis wire table exports.
- The reference table begins at `AA` with `Entity type`, `Entity ID`, `Entity name`, and `Internal ID`; spacer columns are inserted as needed so downstream spreadsheets can rely on a stable position.
- Added `resolveWireUntwistedExportLengthMm`, which returns `lengthMm + 2 * Wire stripping allowance (mm)` only when the wire belongs to a normalized twist group containing at least two wires. Non-twisted wires and singleton twist labels stay blank in the new column.
- Grouped BOM exports that include the wire-list sheet now also pass network nodes into the wire export, so connector, splice, and node references are complete.
- Aligned release metadata to `1.16.10` across `VERSION`, `package.json`, `package-lock.json`, and `README.md`.

## Version 1.16.10 - Wire Export Reference Table and Untwisted Length

### Exports

- Wire-to-wire CSV/XLSX exports include post-processing reference data at column `AA`.
- Twisted wires now expose both the existing coefficient-adjusted length and the untwisted length with stripping allowance.

### Verification

- `npm run -s typecheck`
- `npm run -s lint`
- Focused suites: `wire-list-export`, `app.ui.wire-export-preview`

### Notes

- Builds on `1.16.9`.
- The existing `Length (mm)` calculation is unchanged.
