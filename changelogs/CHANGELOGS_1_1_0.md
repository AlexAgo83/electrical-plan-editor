# Changelog (`1.0.1 → 1.1.0`)

## Major Highlights

- Delivered the full **req_085 -> req_091** roadmap across this window.
- Expanded canvas and workspace customization with:
  - widescreen layout mode,
  - independent segment-name visibility,
  - SVG/PNG export format switching,
  - tabular callouts with optional wire-name column,
  - zoom-invariant node-shape rendering plus adjustable target size.
- Improved wire CSV interoperability and readability:
  - UTF-8 BOM export for accent-safe opening in spreadsheet tools,
  - endpoint schema split into explicit begin/end ID+pin columns.
- Hardened reliability with focused regression coverage and layout performance test stabilization.
- Added mobile-oriented workspace table compaction for denser but controlled small-screen behavior.

## Product and UX Changes

### Workspace Layout and Responsive Ergonomics (req_085, req_086)

- Implemented mobile UI compaction across workspace tables.
- Added `Wide screen` under `Workspace panels layout`:
  - default disabled,
  - removes app shell max-width cap when enabled.

### Canvas Display and Export Controls (req_087, req_088)

- Added `Show segment names by default` preference independent from segment length visibility.
- Added export format preference under canvas tools:
  - `SVG` (default),
  - `PNG`.
- Kept existing export controls and behavior aligned with selected format.

### Callout Readability and Information Structure (req_089)

- Reworked callouts to a tabular content structure for clearer per-field mapping.
- Added optional `wire name` column toggle in settings.
- Preserved wire length visibility in tabular callouts for operational relevance.

### Zoom-Invariant Node Shapes and Size Tuning (req_090 + follow-up tuning)

- Added `Keep connector/splice/node shape size constant while zooming`.
- Introduced a dedicated size slider under this option:
  - final calibrated range: `50%` to `125%`,
  - final default: `75%`.
- Kept interaction hitboxes aligned with rendered shape size to preserve usability.

### Wire CSV Export Quality and Schema (req_091)

- Added UTF-8 BOM support on wire CSV exports to prevent accent corruption in common spreadsheet flows.
- Removed legacy `Endpoints` aggregate column.
- Split endpoint exports into explicit columns:
  - `Begin ID`,
  - `Begin pin`,
  - `End ID`,
  - `End pin`.
- Applied this schema to both modeling and analysis wire CSV exports.

## Engineering Quality, CI, and Reliability

- Hardened layout performance test stability around the 1.1.0 release boundary.
- Added targeted regression coverage for:
  - wire CSV payload structure and encoding behavior,
  - zoom-invariant node-shape behavior and preference persistence,
  - settings-driven canvas rendering controls.
- Maintained full CI lane health (fast/ui/e2e) while integrating this feature set.

## Documentation and Planning Artifacts

- Added and synchronized request/backlog/task artifacts for req_085 through req_091.
- Updated closure traceability across related orchestration and backlog items.

## Version Progression in This Window

- `1.0.2`: workspace table mobile compaction release step.
- `1.1.0`: req_086 -> req_091 delivery bundle and layout test hardening.
- `1.1.0` (post-bump mainline refinements): node-shape size slider calibration to `50..125` with `75` default and additional CSV assertion hardening.
