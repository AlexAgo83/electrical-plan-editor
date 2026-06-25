# Changelog (`1.16.7 -> 1.16.8`)

## Major Highlights

- Colocated floating splices that share the same physical point on a segment are now both visible: they are drawn symmetrically on either side of the carrier segment with spacing derived from the splice symbol size, joined by a short link line (toggleable in settings). The stored placement is never changed.
- Networks can declare an entity ID prefix (e.g. `LAT-`). A new settings toggle hides or shows that prefix in canvas labels and human-readable wire-list and BOM exports, while canonical IDs and AI-agent JSON always keep the full value.

## Patch Notes

- `buildRenderedFloatingSplices` clusters placed splices into colocation groups by their canonical along-segment ratio (so placements expressed from opposite segment nodes are recognized as the same point). Distinct points keep the existing even along-segment spread; colocated groups are offset symmetrically along the segment normal by `COLOCATED_SPLICE_OFFSET_STEP` (derived from the splice diamond size) and tagged `isColocated`.
- Colocated splices draw a short link line back to their shared placement point, gated by the new `canvasShowColocatedSpliceLinkLine` UI preference (default on); SVG/PNG/PDF exports honor it automatically via the live-DOM snapshot.
- Added `Network.entityPrefix` to the core model with normalization, workspace save/load, and single-network import/export, including conservative prefix auto-detection on import (obvious shared `LAT-` / `PRI-` style tokens only; ambiguous sets stay blank).
- Added an editable "Entity ID prefix" field to the network scope form, and prefix-anchored technical-ID suggestions so new entities in a prefixed network are created as `LAT-C-001`, etc. Existing IDs are never renamed.
- Added shared prefix-aware display helpers (`core/networkEntityPrefix`) and the `canvasShowNetworkEntityPrefix` UI preference. When off, the active network prefix is hidden in canvas labels and the human-readable wire-list and BOM exports (grouped and active-network export/preview); the BOM preview's clickable connector links are keyed by the formatted ID so they keep resolving. AI-agent JSON keeps canonical full IDs.
- Multi-network functional analysis surfaces a disambiguation hint when hidden prefixes would make bare IDs look duplicated across the selected networks.
- Added EN/FR i18n entries for the new settings, the network-scope prefix field, the disambiguation hint, and prefix validation messages.
- Aligned release metadata to `1.16.8` across `VERSION`, `package.json`, `package-lock.json`, and `README.md`.

## Version 1.16.8 - Colocated Splice Rendering and Network Entity Prefix

### Network Summary

- Colocated floating splices render symmetrically on both sides of the carrier segment with a toggleable link line instead of drawing on top of each other.
- Canvas entity labels can hide the active network prefix (`LAT-`) for legibility without changing stored IDs.

### Modeling / Store / Persistence

- New `Network.entityPrefix` model field, persisted through save/load and network import/export with import-time auto-detection.
- Technical-ID suggestions anchor the network prefix into newly created entity IDs.

### Exports

- Wire-list and BOM human-readable exports honor the network prefix show/hide setting; AI-agent JSON and canonical stored IDs are unchanged.

### Verification

- `npm run -s typecheck`
- `npm run -s lint`
- `npm run -s test:ci:fast`
- `npm run -s test:ci:ui`
- Focused suites: `network-entity-prefix`, `network-summary-graph-model`, `technical-id-suggestions`, `wire-list-export`, `network-summary-bom-csv`, `portability.network-file`, `app.ui.networks`
- Logics `lint --require-status` and `audit --legacy-cutoff-version 1.1.0 --group-by-doc --skip-ac-traceability`

### Notes

- Builds on `1.16.7`; implements Logics task `task_145` (request `req_150`).
- Prefix hiding is applied to the canvas, wire-list, and BOM surfaces; other read-only label surfaces intentionally keep full canonical IDs.
- Full Playwright e2e is not run locally in this WSL environment; it is validated by remote CI.
