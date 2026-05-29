# Changelog (`1.10.1 -> 1.10.2`)

## Version 1.10.2 - Grouped SVG Export and Cleaner Filenames

### Settings / Import & Export

- Added an "Export grouped SVG" button next to "Export grouped BOM (XLSX)" in Settings, driven by the same "Selected networks for export" checkbox list.
- Sequentially renders the network plan SVG for each selected network, downloads one file per network, then restores the originally active network.
- Auto-navigates to the Modeling screen so the canvas is mounted before capturing the SVG.
- Displays a fullscreen progress overlay ("Exporting SVG N of M" with the network name) during the batch to block interactions and mask active-network flashes.

### Network Plan Export

- SVG and PNG canvas exports now use the network name in the filename (e.g. `faisceau-moteur-2026-05-29_14-30-45.svg`) instead of a raw ISO timestamp.
- Added a direct SVG export path (`NetworkSummaryPanelHandle.exportSvgDirect`) that downloads without opening the preview dialog, used by the grouped SVG export.

## Validation and Regression Evidence

- `npx tsc --noEmit`
