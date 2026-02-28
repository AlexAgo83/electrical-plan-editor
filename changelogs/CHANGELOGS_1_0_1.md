# Changelog (`0.9.16 → 1.0.1`)

## Major Highlights

- Delivered the full **req_077 -> req_084** roadmap across this window.
- Hardened import/export and persistence safety:
  - package-version single source of truth,
  - malformed imported network timestamp normalization,
  - CSV formula-injection neutralization,
  - safer JSON object-URL revoke timing.
- Improved 2D workflow quality and readability:
  - stronger crossing reduction in `Generate`,
  - selected-callout-only preference,
  - stable callout interaction/reset behavior.
- Rolled out app-wide mobile mode hardening and removed reliance on desktop minimum-width constraints.
- Stabilized CI governance for UI modularization and timeout debt handling.

## Product and UX Changes

### Save/Export and Home UX (req_077, req_078)

- `Update app` action switched from blink behavior to breathing glow style.
- Network export filenames now include filesystem-safe timestamps.
- Home changelog feed supports progressive/lazy loading as users scroll.
- Changelog presentation was normalized:
  - version range header style (`X.X.X → X.X.X`),
  - `Major Highlights` kept visible,
  - subsequent sections collapsed by default.

### 2D Generation, Callouts, and Canvas Behavior (req_080, req_081)

- `Generate` now prioritizes crossing reduction earlier in layout scoring.
- Added aggressive untangle behavior to improve dense topology output.
- Added `Show only selected connector/splice callout` preference (default disabled).
- Selected-callout filtering now follows selected connector/splice context reliably.
- Hidden/offscreen callouts no longer intercept pointer events.
- `Generate` resets persisted callout drag positions for clean relayout starts.
- Fixed auto-rotated segment length label placement regressions.

### Settings Import/Export and Panel Composition (req_082)

- `Import / Export networks` panel now uses a compact two-column internal composition in wide layouts.
- `Selected networks for export` stays on the right in desktop/tablet layouts.
- `Import from file` was repositioned under export actions to reduce vertical spread.
- Panel ordering/placement was refined for better settings scanability.

### Mobile Mode Rollout and Follow-Up Hardening (req_083 + hotfixes)

- Removed global `min-width: 700px` dependency and enabled responsive mobile behavior.
- Improved narrow-screen header behavior (`Settings`, `Ops & Health`) and settings panel responsiveness.
- Network summary mobile behavior refined:
  - heavy 2D content hidden at narrow breakpoints,
  - explicit “not available on mobile” copy shown,
  - route preview header kept on one line,
  - quick-entity navigation chips reflow into wrapped grid rows.
- Additional width-fit fixes removed remaining horizontal overflow in modeling/settings mobile views.

### Network Scope Recent Changes Persistence (req_084)

- Recent-changes metadata for active networks is now persisted and restored across relaunch.
- Network Scope recent-changes panel now survives reload while preserving expected visibility rules.

## Engineering Quality, CI, and Reliability

- Added and enforced `quality:ui-timeout-governance` in local/CI flows with explicit allowlist policy.
- Continued `AppController` decomposition via extracted orchestration hooks for confirm-dialog and save/export actions.
- Strengthened canvas/shell interaction handlers to avoid update-depth loops and expensive click/mousedown paths.
- Fixed `manifest.webmanifest` syntax issue that surfaced in browser console/runtime.
- Updated UI modularization governance with documented temporary oversize exceptions and rationale.

## Documentation and Planning Artifacts

- Added/updated requests for:
  - `req_077` review follow-up hardening bundle,
  - `req_078` update glow + timestamped export + changelog lazy loading,
  - `req_079` UI reliability debt reduction + AppController decomposition continuation,
  - `req_080` through `req_084` delivery set.
- Added backlog/orchestration artifacts and closure traceability for req_077 -> req_084.
- Updated Logics kit integration for Render-oriented workflows and deployment planning support.

## Version Progression in This Window

- `0.9.17`: req_077/078 baseline delivery wave (persistence/export hardening, update glow, timestamped export filenames, Home changelog lazy loading).
- `0.9.18`: req_079 reliability/decomposition wave plus 2D label/canvas interaction fixes.
- `1.0.0`: req_080 -> req_084 implementation baseline.
- `1.0.1`: post-1.0.0 mobile/layout follow-up hardening and quality-gate stabilization.
