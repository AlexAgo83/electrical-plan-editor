# Changelog (`1.16.8 -> 1.16.9`)

## Major Highlights

- The network entity ID prefix show/hide setting now also applies to the Network Summary connector and splice callouts. With the prefix hidden, the callout title, the `Wire ID` cell, and the `End ID` cell drop the active network prefix (e.g. `LAT-EP 2` reads as `EP 2`), so the plan reads consistently with the canvas labels. Canonical IDs and AI-agent JSON are unchanged.

## Patch Notes

- Threaded the shared per-network `formatEntityId` resolver into the callout model builders (`buildConnectorCalloutGroupsById`, `buildSpliceCalloutGroupsById`, `buildCableCalloutViewModels`) as an optional option with an identity default, so existing callers are unaffected.
- Formatting is applied to display cells only: connector/splice callout titles (the `technicalId` passed to `buildCalloutHeaderDisplay`), the wire-row `Wire ID` cell (`entry.technicalId`), and the wire-row `End ID` cell (`targetId`) for both connector and splice endpoints.
- Prefix hiding stays display-only: callout keys (`connector:<id>` / `splice:<id>`), `entityId`, selection targets, drag-position persistence, the canonical `wireId` row key, and entry sorting continue to use canonical IDs and are unchanged whether the prefix is shown or hidden.
- SVG/PNG/PDF network-plan exports inherit the formatted callout text via the existing live-DOM snapshot; no export-geometry change.
- `NetworkSummaryPanel` now computes the memoized `formatEntityId` before the callout memos and passes it into all three callout builders.
- Aligned release metadata to `1.16.9` across `VERSION`, `package.json`, `package-lock.json`, and `README.md`.

## Version 1.16.9 - Network Summary Callouts Honor the Entity Prefix Setting

### Network Summary

- Connector and splice callouts now honor the `canvasShowNetworkEntityPrefix` setting: titles, `Wire ID`, and `End ID` cells hide the active network prefix when the setting is off, matching the canvas labels.

### Notes

- Builds on `1.16.8`; implements Logics task `task_146` (request `req_151`, backlog `item_637`).
- Direct follow-up to the `task_145` scope note: callouts were intentionally left on canonical IDs and now adopt the same `formatEntityIdForDisplay` / `formatEntityId` seam. Other read-only label surfaces (modeling tables, inspector, analysis panels) still keep full canonical IDs.
- Canonical stored `technicalId` values and AI-agent JSON are unchanged.

### Verification

- `npm run -s typecheck`
- `npm run -s lint`
- `npm run -s test:ci:fast`
- `npm run -s test:ci:ui`
- `npm run -s build:vite`
- Focused suite: `network-summary-callout-prefix`
- Logics `lint --require-status` and `audit --legacy-cutoff-version 1.1.0 --group-by-doc --skip-ac-traceability`

### Notes on CI

- Full Playwright e2e is not run locally in this WSL environment; it is validated by remote CI.
