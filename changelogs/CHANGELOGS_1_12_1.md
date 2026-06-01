## 1.12.1

- Added explicit import-failure popups for invalid network JSON imports and blocking catalog CSV import errors, with actionable reason details.
- Harmonized export and save filenames so exported networks, BOMs, SVG/PNG plans, and workspace files prefer readable entity names or technical IDs when available.
- Removed redundant save-confirmation dialogs before native file-save pickers when the browser can already present a local save dialog.
- Added an XLSX preview step for wire-list exports from modeling before download, aligned with the existing preview-first export behavior.

### Verification

- `npm run -s typecheck`
- `npm run -s lint`
- `npm test -- --run src/tests/network-import-export.spec.ts src/tests/workspace-file.spec.ts src/tests/workspace-file-storage.hook.spec.tsx src/tests/app.ui.settings.spec.tsx src/tests/app.ui.network-summary-bom-export.spec.tsx src/tests/app.ui.catalog-csv-import-export.spec.tsx src/tests/app.ui.import-export.spec.tsx src/tests/app.ui.wire-export-preview.spec.tsx`
