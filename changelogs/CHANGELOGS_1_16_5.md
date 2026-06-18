# Changelog (`1.16.4 -> 1.16.5`)

## Major Highlights

- Multiple floating splices on the same segment are now spread evenly along the segment instead of all biasing to the center, so they no longer overlap or hide the distance labels between them.
- A single click on a floating splice opens its edit form without force-opening the inspector panel, matching the connector icon behavior.

## Patch Notes

- `buildRenderedFloatingSplices` now groups splices per segment and assigns each a render-only visual ratio of `i / (N + 1)` in physical order (2 splices → 1/3, 2/3; 3 splices → 1/4, 2/4, 3/4; etc.). A lone splice keeps its mild center bias toward the physically closer endpoint. Persisted placement, routing, lengths and exports keep the real offset.
- The floating splice single-click handler no longer calls `onOpenInspectorForSelection`; it selects and opens the edit form only. The inspector still opens on double-click (parity with connectors).
- Updated graph-model tests (even-distribution and physical ordering) and the splice click-to-edit test (asserts a hidden inspector stays hidden on single click).
- Aligned release metadata to `1.16.5` across `VERSION`, `package.json`, `package-lock.json`, and `README.md`.

## Version 1.16.5 - Even Co-Segment Splice Spread And Inspector Click Parity

### Network Summary

- Co-segment floating splices distribute evenly at `i / (N + 1)`, keeping markers and inter-splice length labels readable.
- Single-click splice activation matches connector behavior: edit opens, inspector does not pop open unless double-clicked.

### Verification

- `npm run -s typecheck`
- `npm run -s lint`
- `npm run -s test:ci:fast` (499 tests passing)
- `npm run -s test:ci:ui` (all chunks passing)
- Focused suites: `network-summary-graph-model`, `app.ui.floating-splice-click-to-edit`
- `npm run -s build:vite` + `npm run -s quality:pwa`

### Notes

- Follow-up fixes on top of `1.16.4`; no workflow doc changes.
- Full Playwright e2e is not run locally in this WSL environment; it is validated by remote CI.
