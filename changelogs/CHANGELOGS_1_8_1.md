# Changelog (`1.8.0 -> 1.8.1`)

## Version 1.8.1 - Callout Connector Drawing Controls

### Network Summary Callouts

- Added a `Connector drawing size (%)` slider after `Show connector drawing in callouts`.
- Connector drawings now default to `125%` size while keeping `100%` as the minimum available value.
- The drawing size preference is persisted with the UI preferences schema and remains backward compatible for older stored preferences.
- Callout layout measurement now reserves drawing width and height based on the configured connector drawing scale.

### Connector Layout Readability

- Connector way labels longer than two characters now render with a reduced font size.
- The reduced label sizing applies consistently in callout drawings, the catalog connector layout editor, and connector physical analysis views.

## Validation and Regression Evidence

- `npm run -s typecheck`
- `npm test -- --run src/tests/app.ui.catalog-layout.spec.tsx src/tests/app.ui.settings-canvas-callouts.spec.tsx`
