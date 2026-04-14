# Changelog (`1.6.0 -> 1.6.1`)

## Major Highlights

- Split the network summary menu controls into dedicated View and Export components, then updated the focused UI tests to match the new menu structure.
- Restored CI health after the menu split by updating the segmented UI lane contract, splitting one oversized settings canvas spec, and fixing a React hook dependency warning.
- Refreshed the README with a clearer product/technical overview and aligned the visible release metadata to `1.6.1`.

## Version 1.6.1 - Release Prep and UI Maintenance

### Network Summary Menu Extraction

- Extracted the network summary View and Export menus into dedicated components for better modularity.
- Updated the affected UI tests to open the correct menu surfaces before asserting on `Length`, `Callouts`, `SVG`, and `PNG` options.

### CI and Quality Gates

- Split `settings-canvas-render` coverage into a dedicated `settings-canvas-export` spec so the UI modularization gate stays under the 500-line limit.
- Updated the explicit UI lane contract so the new export spec participates in CI segmentation.
- Fixed the missing React hook dependencies in `useUiPreferences` so ESLint runs cleanly.

### Documentation and Version Alignment

- Reworked the README to separate product and technical documentation more clearly.
- Aligned the root release metadata to `1.6.1` across `VERSION`, `package.json`, `package-lock.json`, and the README badge.

## Validation and Regression Evidence

- `rtk npm test -- run src/tests/app.ui.settings-canvas-render.spec.tsx src/tests/app.ui.settings-canvas-export.spec.tsx`
- `rtk npm run lint`
- `rtk npm run ci:local`
