# Changelog (`1.1.0 → 1.2.1`)

## Major Highlights

- Delivered the full **req_092 -> req_095** roadmap across this window.
- Updated splice modeling contracts for real-world usage:
  - optional catalog association for splices,
  - new splice capacity modes (`bounded` / `unbounded`).
- Added adaptive unbounded splice rendering across analysis and network summary surfaces.
- Improved zoom-invariant node-shape visual quality by scaling node border strokes proportionally.
- Added a canvas resize behavior mode to keep content scale locked on viewport resize (`Resize changes visible area only`).
- Follow-up `1.2.1` defaults and settings UX alignment:
  - `Warm Brown` as default theme baseline,
  - zoom-invariant node shapes enabled by default with `50%` target size,
  - simplified settings flows without manual “apply defaults now” actions.

## Product and UX Changes

### Splice Catalog and Capacity Model (req_092, req_093)

- Splice catalog association is now optional by design.
- Existing catalog-linked splice workflows remain supported.
- Connectors remain catalog-first and unchanged in contract.
- Added splice `portMode` with two behaviors:
  - `bounded` (existing finite `portCount` behavior),
  - `unbounded` (no upper limit on valid positive port indexes).
- Catalog-linked splices remain `bounded` and keep deriving capacity from catalog `connectionCount`.
- Selecting a catalog item while splice mode is `unbounded` now auto-switches to `bounded` with explicit form feedback.

### Splice Analysis and Network Summary Rendering (req_093)

- Unbounded splice analysis now renders adaptive finite ports instead of relying on a fixed max list:
  - occupied ports are always visible,
  - default free-slot buffer is shown,
  - manual `+ Add visible port(s)` expansion is available.
- Unbounded splice capacity is shown as `∞` in relevant UI surfaces.
- Splice table/CSV exports now include `portMode`; numeric `portCount` is empty for unbounded entries.
- Wire endpoint validation and occupancy handling now respect splice capacity mode semantics.

### Node Shape Stroke Parity (req_094)

- With zoom-invariant node shapes enabled, node border strokes now scale with shape size.
- Applied proportional scaling to all node families and all border states:
  - default,
  - selected,
  - focus-visible.
- Added bounded stroke clamps to avoid unreadable extremes.
- Hitbox behavior and interaction reliability are preserved.

### Canvas Resize Behavior Mode (req_095)

- Added a canvas render preference under `Reset zoom target (%)`:
  - `Responsive content scaling`,
  - `Resize changes visible area only`.
- In `Resize changes visible area only` mode:
  - resizing viewport changes visible graph extent,
  - apparent content scale remains stable.
- Preference is persisted/restored with existing UI preference hydration.
- `Reset current view` and `Fit network view to current graph` remain operational in both modes.

### Settings Defaults and Structure Alignment (1.2.1 follow-up)

- Theme default is now `Warm Brown` across:
  - initial app state,
  - empty workspace creation/reset flows,
  - legacy preference migration fallback.
- `Viewport resize behavior` now defaults to `Resize changes visible area only`.
- `Keep connector/splice/node shape size constant while zooming` is now enabled by default.
- `Node shape target size (%)` now defaults to `50%`.
- Segment-name visibility is now controlled as an active canvas value (`Show segment names`) instead of a “by default only” toggle.
- `Appearance preferences` moved to the 3rd panel position in Settings.
- `Show only selected connector/splice callout` placed directly under `Show connector/splice cable callouts by default`.
- Added `Ctrl/Cmd + S` to the visible shortcuts reference in `Action bar and shortcuts`.
- Removed:
  - `Apply canvas defaults now`,
  - `Apply sort defaults now`.

## Engineering Quality and Regression Coverage

- Added/updated targeted regression tests for:
  - settings canvas render behavior (including resize mode),
  - navigation/canvas workflows,
  - analysis `Go to wire` flows,
  - portability network-file normalization.
- Updated integration coverage around:
  - settings defaults and persistence,
  - theme startup behavior,
  - network summary workflow expectations.
- Verified with CI-equivalent gates:
  - `logics_lint`,
  - `lint`,
  - `typecheck`,
  - segmented fast/UI tests,
  - e2e smoke,
  - production build and PWA artifact gate.

## Version Progression in This Window

- `1.2.0`: req_092 -> req_095 implementation bundle (splice contract modernization + canvas behavior refinements).
- `1.2.1`: defaults and settings UX alignment, plus release-note consolidation and reporting-script stability fixes.
