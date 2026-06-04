# Changelog (`1.14.4 -> 1.14.5`)

## Major Highlights

- Fixed SVG/PNG network export previews so they open already fitted to export content.
- Removed the manual `Fit export` preview action because fitting is now part of preview preparation.
- Kept off-viewport cable callouts rendered for export fitting so dragged callouts remain inside the exported frame.

## Patch Notes

- Export FIT now computes SVG content bounds, applies deterministic export padding, and sizes the output viewBox to the fitted frame.
- Root export layers are translated for the fitted frame without moving nested segment-label, node-label, connector-drawing, or callout internals a second time.
- SVG and PNG option changes preserve the fitted export mode across frame, identity, grid, and theme refreshes.
- Release metadata is updated for `1.14.5`.

## Version 1.14.5 - Fitted Export Previews

### Network Export

- SVG and PNG preview loading now performs the same fitted export preparation users previously had to trigger manually.
- Export previews no longer mutate the live network canvas viewport when preparing a fitted frame.
- Hidden hitboxes and grid-only elements stay excluded from fitted content bounds, while visible callouts and labels are included.

### Verification

- `npm run -s typecheck`
- `npx vitest run src/tests/app.ui.network-summary-svg-preview.spec.tsx src/tests/app.ui.settings-canvas-export.spec.tsx src/tests/app.ui.network-summary-workflow-polish.spec.tsx src/tests/app.ui.statistics.spec.tsx src/tests/network-statistics.spec.ts`
