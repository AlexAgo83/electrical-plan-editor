# Changelog (`1.9.0 -> 1.9.1`)

## Major Highlights

- Added a BOM export preview confirmation so generated CSV content can be reviewed before download.
- Introduced optimized splice placement suggestions with preview, apply, and hardening around placement updates.
- Expanded connector layout editing with edge resize controls, coordinate overlap guards, keying improvements, shell thickness control, and refined physical-view rendering.
- Improved modeling and inspector ergonomics with close actions, aligned header controls, wire twist group filtering, and richer recent-change labels.
- Changed the default connector drawing display to render on nodes at `150%` size.

## Version 1.9.1 - BOM Preview, Splice Placement, and Connector Layout Polish

### BOM Export Preview

- Added a dedicated BOM export preview dialog before CSV download.
- Wired preview confirmation through the network summary export workflow.
- Improved BOM preview and network controls so export intent is clearer.
- Added UI regression coverage for the preview confirmation path.

### Splice Placement Optimization

- Added a splice placement optimizer for suggested splice positions.
- Added preview and apply behavior for optimized splice placement suggestions.
- Refined the splice length optimization workflow and hardened placement suggestion updates.
- Added reducer and optimizer regression coverage for splice placement behavior.

### Connector Layout Editor and Physical Views

- Added connector layout edge resize controls.
- Blocked overlapping connector layout coordinate edits.
- Improved connector catalog layout grid behavior.
- Enhanced connector keying layout editing and label placement.
- Added connector shell thickness controls.
- Refined connector layout controls and physical connector rendering coverage.

### Network Summary and Canvas Defaults

- Changed the default connector drawing display from callouts to nodes.
- Increased the default connector drawing size from `125%` to `150%`.
- Extended connector drawing coverage for callout and node rendering paths.
- Preserved existing range limits for connector drawing size.

### Modeling, Inspector, and Recent Changes

- Added inspector close behavior and splice suggestion actions.
- Aligned inspector header button heights.
- Added wire twist group tag filtering.
- Improved recent-change labels for more specific action and entity context.
- Added UI coverage for list ergonomics, creation-flow ergonomics, inspector behavior, and navigation polish.

### Documentation and Version Alignment

- Added product framing for optimized splice placement suggestions.
- Aligned release metadata to `1.9.1` across `VERSION`, `package.json`, `package-lock.json`, and README.

## Validation and Regression Evidence

- `npm run -s typecheck`
- `npx vitest run src/tests/changelog-feed.spec.ts src/tests/app.ui.settings-canvas-callouts.spec.tsx --pool=forks --maxWorkers=2 --testTimeout=15000`
