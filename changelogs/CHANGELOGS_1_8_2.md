# Changelog (`1.8.1 -> 1.8.2`)

## Major Highlights

- Added guided and free connector keying placement controls for catalog layouts.
- Linked connector and splice manufacturer references back to their catalog item and opened the catalog edit panel directly.
- Hardened canvas and callout click handling so a simple click does not accidentally become a drag while parallel loading is in progress.
- Improved network summary viewport fitting and connector callout drawing/keying rendering.

## Version 1.8.2 - Connector Keying Placement and Catalog Reference Navigation

### Connector Layout Keying

- Added keying scale controls to the catalog connector layout editor.
- Replaced side/position editing with a guided perimeter slider that moves the keying around the connector shell.
- Added free placement mode for drag-and-drop keying positioning in the connector preview.
- Kept free-mode keying shapes stable without self-rotation, while arrow keying continues to point inward.
- Snapped square-shell free-mode arrow orientation to the nearest perpendicular edge axis.
- Rendered connector keying shapes inside connector callout drawings.

### Catalog Reference Navigation

- Made connector and splice edit-form manufacturer references clickable when they are linked to catalog items.
- Navigating from a manufacturer reference now opens the Catalog view with the matching row selected and the `Edit catalog item` panel active.
- Preserved the fallback selection behavior when the referenced catalog item is no longer present.

### Network Summary and Callouts

- Defaulted network summary viewports to fitted content and migrated legacy default viewport behavior.
- Prevented accidental node dragging from plain clicks during parallel load-sensitive interactions.
- Refined connector drawing callout sizing and spacing so callout content stays tighter and more readable.

## Validation and Regression Evidence

- `npm run -s lint`
- `npm run -s typecheck`
- `npm run -s test -- src/tests/app.ui.catalog-layout.spec.tsx src/tests/app.ui.catalog.spec.tsx src/tests/connector-layout.spec.ts --run`
- `npm run -s test -- src/tests/app.ui.inspector-shell.spec.tsx src/tests/app.ui.creation-flow-ergonomics.spec.tsx --run`
