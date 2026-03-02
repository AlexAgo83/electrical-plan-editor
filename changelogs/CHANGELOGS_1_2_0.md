# Changelog (`1.1.0 → 1.2.0`)

## Major Highlights

- Delivered the full **req_092 -> req_095** roadmap across this window.
- Updated splice modeling contracts for real-world usage:
  - optional catalog association for splices,
  - new splice capacity modes (`bounded` / `unbounded`).
- Added adaptive unbounded splice rendering across analysis and network summary surfaces.
- Improved zoom-invariant node-shape visual quality by scaling node border strokes proportionally.
- Added a new canvas resize behavior mode to keep content scale locked on viewport resize (`Resize changes visible area only`).

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

- Added a new canvas render preference under `Reset zoom target (%)`:
  - `Responsive content scaling (default)`,
  - `Resize changes visible area only`.
- In `Resize changes visible area only` mode:
  - resizing viewport changes visible graph extent,
  - apparent content scale remains stable.
- Preference is persisted/restored with existing UI preference hydration.
- `Reset current view` and `Fit network view to current graph` continue to work in both modes.

## Persistence, Import/Export, and Validation

- Persistence and import normalization were updated for splice `portMode` compatibility.
- Mixed bounded/unbounded datasets now round-trip safely through network portability paths.
- Validation rules were aligned with new splice semantics:
  - missing splice catalog link is no longer an error,
  - broken splice catalog links remain validated when link exists,
  - bounded/unbounded endpoint range checks are mode-aware.
- Legacy portability expectations were adjusted to preserve unlinked splice behavior without forced placeholder manufacturer references.

## Engineering Quality and Regression Coverage

- Added/updated targeted regression tests for:
  - settings canvas render behavior (including resize mode),
  - navigation/canvas workflows,
  - analysis `Go to wire` flows,
  - portability network-file normalization.
- Verified with:
  - `logics_lint`,
  - `lint`,
  - `typecheck`,
  - targeted UI and portability test suites.

## Version Progression in This Window

- `1.2.0`: req_092 -> req_095 implementation bundle (splice contract modernization + canvas behavior refinements + orchestration/doc closure).
