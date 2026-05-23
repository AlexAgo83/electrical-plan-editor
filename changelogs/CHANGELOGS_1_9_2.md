# Changelog (`1.9.1 -> 1.9.2`)

## Major Highlights

- Added SVG export previews with theme overrides, grid controls, and safer rendering behavior before download.
- Improved export modal responsiveness with visual loading feedback for slower preview workflows.
- Expanded Network Scope import/export shortcuts and made selected-network export behavior explicit.
- Refined connector and canvas rendering details, including hitboxes, node connector drawings, labels, and scaling controls.

## Version 1.9.2 - Export Preview and Network Scope Polish

### SVG and Export Preview Workflow

- Added an SVG preview dialog before export download.
- Added preview-level theme override controls for SVG export.
- Added an `Include grid` option for Network Summary SVG preview exports.
- Hid unused Harness Assembly SVG preview controls, including `Fit network` and frame/identity toggles.
- Added visual loading states while preview modals are opening.
- Stabilized SVG preview rendering and export preview controls.

### Network Scope Import and Export

- Added a `Network` export entry in the Network Summary export menu for downloading the active network as a portable network file.
- Added an `Import` action alongside Network Scope actions.
- Changed Network Scope export availability so it depends on the selected row rather than the active network.
- Kept Network Scope action buttons aligned on one row with responsive short labels.

### Canvas, Connector, and Assembly Rendering

- Improved connector layout node hitboxes and physical connector rendering interactions.
- Rendered connector layout node titles inline.
- Used connector layout shapes for node click hit testing.
- Centered segment labels in visible node gaps.
- Fixed canvas global scale reset behavior and export scaling.
- Added assembly link selector improvements for connector names.

### Documentation and Version Alignment

- Aligned release metadata to `1.9.2` across `VERSION`, `package.json`, `package-lock.json`, and README.

## Validation and Regression Evidence

- `npm run -s lint`
- `npm run -s typecheck`
- `npm run -s test -- src/tests/changelog-feed.spec.ts src/tests/app.ui.import-export.spec.tsx --run`
- `npm run -s build`
- `npm run -s quality:pwa`
- `git diff --check`
