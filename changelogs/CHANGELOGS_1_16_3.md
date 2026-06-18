# Changelog (`1.16.2 -> 1.16.3`)

## Major Highlights

- Floating splice markers in Network Summary now render with a bounded, center-biased visual placement so they stay clear of endpoint node icons and segment length labels while still hinting at the physically closer end. The persisted placement, routing, wire lengths and exports are unchanged.
- Exported deliverables are easier to identify: wire-to-wire export filenames carry the active network label, and grouped exports name every selected network/harness. Grouped BOM exports now bundle the wire list in the same package.
- Clicking a floating splice in Network Summary opens its edit form directly, matching connector edit activation.

## Patch Notes

- Added the render-only helper `biasFloatingSpliceVisualRatio` (bounded `[0.3, 0.7]` band, bias factor `0.35`) in `networkSummaryGraphModel.ts`; `buildRenderedFloatingSplices` now anchors on the biased visual ratio before the existing anti-superposition pipeline.
- Floating splice single click now triggers `onActivateFloatingSplice` directly in `NetworkSummaryGraphLayers.tsx`.
- Wire-to-wire export filenames in `AnalysisWireWorkspacePanels.tsx` and `ModelingSecondaryTables.tsx` include the sanitized active network label (new `activeNetworkName` prop threaded through the screen-content slice).
- New shared helper `buildGroupedFileNameBase` in `exportFileName.ts` composes grouped filenames from every selected label with deterministic `-plus-<n>-more` truncation; reused for grouped BOM, grouped wire list and grouped plan PDF.
- `handleExportGroupedBom` now appends a per-network wire-list sheet alongside the BOM sheets without changing single-network BOM semantics.
- Aligned release metadata to `1.16.3` across `VERSION`, `package.json`, `package-lock.json`, and `README.md`.

## Version 1.16.3 - Floating Splice Readability And Export Naming

### Network Summary

- Center-biased, render-only floating splice placement keeps markers near the segment midpoint with only a mild directional bias toward the physically closer endpoint.
- Single-click splice edit activation matches the connector interaction pattern for selection, focus and edit-panel activation.

### Exports

- Wire-to-wire export filenames include the active network label.
- Grouped BOM / wire list / plan PDF filenames include every selected network or harness label in deterministic order, with bounded truncation for long selections.
- Grouped BOM export includes the wire list so the operator receives a complete grouped package without a separate wire-list export.

### Verification

- `npm run -s typecheck`
- `npm run -s lint`
- `npm run -s test:ci:segmentation:check`
- `npm run -s test:ci:fast` (497 tests passing)
- `npm run -s test:ci:ui` (all chunks passing)
- Focused suites: `network-summary-graph-model`, `export-file-name`, `app.ui.grouped-bom-wire-list`, `app.ui.floating-splice-click-to-edit`, `app.ui.wire-export-preview`
- Quality gates: ui/hooks/store modularization, exceljs-boundary, ui-timeout-governance, dependency-audit, pin-role-release-gate
- `python3 -m logics_manager audit --legacy-cutoff-version 1.1.0 --group-by-doc --skip-ac-traceability` (OK)

### Notes

- Closes `task_142_tune_floating_splice_visual_placement_and_wire_export_naming` (request `req_147`).
- Full Playwright e2e is not run locally in this WSL environment; it is validated by remote CI.
