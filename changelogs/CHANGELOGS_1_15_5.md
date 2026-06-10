# Changelog (`1.15.4 -> 1.15.5`)

## Major Highlights

- Wire XLSX/CSV exports now resolve connector endpoint terminal and seal references from linked catalog defaults when the wire side was not manually overridden.
- Exported wire endpoint connection cells now append the terminal name when one is defined, keeping the displayed label aligned with the exported reference.
- Splice endpoints now export `Preden 13mm` in the connection-ref cell instead of connector/seal-style reference values.

## Patch Notes

- Added shared endpoint material resolution in `src/app/lib/wireListExport.ts` with manual override precedence, connector catalog fallback, optional seal suppression, and splice-specific export output.
- Updated Modeling and Analysis wire exports to use the shared endpoint resolver so CSV and XLSX paths stay consistent.
- Updated grouped workbook wire-sheet export in `src/app/hooks/useNetworkImportExport.ts` to pass catalog context when resolving default connector materials.
- Added `src/tests/wire-list-export.spec.ts` for catalog-default export, manual override precedence, terminal-name rendering, and splice output.
- Updated the wire CSV ergonomics regression in `src/tests/app.ui.list-ergonomics.spec.tsx` for the new splice export behavior.

## Version 1.15.5 - Wire Export Default Terminal Resolution

### Wire Endpoint Resolution

- Begin/end `connection ref` and `seal ref` cells use the wire's manual values when present.
- Without a manual override on a connector cavity, the export falls back to the resolved connector material from connector-level overrides or linked catalog defaults.
- When a resolved terminal or seal has a name, the matching export cell writes `REFERENCE - Name`.

### Splice Output

- Splice endpoints export `Preden 13mm` in the `connection ref` cell.
- Splice endpoints leave the `seal ref` cell empty.

### Verification

- `logics-manager status`
- `npm run -s test -- src/tests/wire-list-export.spec.ts`
- `npm run -s test -- src/tests/app.ui.wire-export-preview.spec.tsx src/tests/app.ui.list-ergonomics.spec.tsx`
- `npm run -s typecheck`
- `npm run -s ci:blocking`
