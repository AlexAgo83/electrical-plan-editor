# Changelog (`1.16.5 -> 1.16.6`)

## Major Highlights

- Segment length labels for segments carrying multiple floating splices are now placed in the visual gaps between the evenly-spread splice markers, so they no longer bunch up or collide. The displayed length values remain the real physical sub-span lengths.

## Patch Notes

- Extracted a shared `computeFloatingSpliceVisualRatios` helper that drives both the floating splice marker positions and the segment length sub-label placement, keeping them consistent.
- `buildRenderedSegments` now positions each length sub-label at the midpoint of the render-only visual boundaries (`0, i/(N+1)…, 1`) instead of the physical sub-span midpoint, while still displaying the physical sub-span length in mm.
- Updated the graph-model sub-label test to assert the new visual midpoint positions (lengths unchanged).
- Aligned release metadata to `1.16.6` across `VERSION`, `package.json`, `package-lock.json`, and `README.md`.

## Version 1.16.6 - Smart Segment Length Label Placement

### Network Summary

- Length labels follow the visual splice layout (gaps between markers) rather than the physical offsets, keeping multi-splice segments readable.
- Splice marker spreading and label placement now share a single visual-ratio mapping.

### Verification

- `npm run -s typecheck`
- `npm run -s lint`
- `npm run -s test:ci:fast` (499 tests passing)
- `npm run -s test:ci:ui` (all chunks passing)
- Focused suite: `network-summary-graph-model`
- `npm run -s build:vite` + `npm run -s quality:pwa`

### Notes

- Follow-up fix on top of `1.16.5`; no workflow doc changes.
- Full Playwright e2e is not run locally in this WSL environment; it is validated by remote CI.
