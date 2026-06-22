# Changelog (`1.16.6 -> 1.16.7`)

## Major Highlights

- Directional splice sides are now resolved correctly on vertical carrier segments, so wires no longer collapse onto a single side of a splice. A new manual "Recompute routes" action in network scope recomputes every wire route and directional splice side on demand and reports what changed in a scrollable popup. Network Summary splice callouts now read `L` / `R` for directional splices instead of `P1` / `P2`.

## Patch Notes

- `resolveDirectionalSpliceEndpointSide` now falls back to the vertical (Y) axis when the carrier segment is vertical (exit X equals splice X), instead of collapsing all wires onto one side via the connector-count fallback. Horizontal and diagonal carriers keep their existing X-based behavior; `sideInverted` and locked sides are still honored.
- Added a `wire/recomputeAll` action and a `buildWireRecomputeReport` builder that produce a deterministic before/after diff (route, length, directional splice side A/B) surfaced on the transient `ui.lastRecomputeReport`.
- Added a "Recompute routes" button next to Cancel in the network edit form (edit mode only; enabled when the edited network is active), threaded through the controller chain, with EN/FR i18n labels.
- The shared `confirm-dialog-feedback-list` is now bounded and scrollable, fixing the previously non-scrollable splice "floating" migration report popup as well.
- Network Summary splice callouts label directional ports as `L` / `R`; bounded and unbounded splices keep numbered `P` labels.
- Aligned release metadata to `1.16.7` across `VERSION`, `package.json`, `package-lock.json`, and `README.md`.

## Version 1.16.7 - Directional Splice Sides, Manual Recompute, and L/R Callouts

### Network Summary

- Directional splice callouts show the side (`L` / `R`) a wire leaves on instead of `P1` / `P2`.
- Splice "floating" migration and recompute report popups scroll within a bounded height instead of overflowing the viewport.

### Modeling / Store

- Vertical carrier segments resolve two distinct directional splice sides instead of one.
- New on-demand full-network recompute with a change report (route / length / splice side).

### Verification

- `npm run -s typecheck`
- `npm run -s lint`
- `npm run -s build:vite`
- Focused suites: `store.reducer.helpers`, `network-recompute-report`, `network-summary-callout-splice-side-labels`, `app.ui.navigation-canvas`, `app-controller-workspace-handlers-domain`

### Notes

- Builds on `1.16.6`; includes Logics docs `req_148`/`req_149` and their backlog/task slices.
- Full Playwright e2e is not run locally in this WSL environment; it is validated by remote CI.
