# Changelog (`1.4.1 -> 1.4.3`)

## Major Highlights

- BOM wire terminations now aggregate by normalized reference text only, even when the same value appears across connection and seal fields.
- Explicit `New` and `Edit` actions now scroll the page to the corresponding form panel in `Modeling`, `Catalog`, and `Network Scope`.
- Release metadata and Logics delivery artifacts were synchronized for req_109 before publishing `1.4.3`.

## Version 1.4.2 - Req_108 Delivery

### BOM Wire Terminations

- Updated BOM aggregation so all four wire-side termination inputs contribute to the same grouping model:
  - `endpointAConnectionReference`
  - `endpointASealReference`
  - `endpointBConnectionReference`
  - `endpointBSealReference`
- Replaced the previous `Type + Reference` grouping with normalized `Reference` only.
- If the same text appears in both a connection field and a seal field, the BOM now exports one merged quantity line.

### Export Schema Alignment

- Removed the obsolete `Type` column from the `Wire terminations` section.
- The section now exports stable headers:
  - `Reference`
  - `Quantity`
- Existing catalog-backed BOM rows, totals, and pricing-context rows remain unchanged.

## Version 1.4.3 - Req_109 Delivery

### Explicit Form Navigation

- Clicking `New` now scrolls to the corresponding create panel when the form is rendered in the current page.
- Clicking `Edit` now scrolls to the corresponding edit panel for the same in-page workflows.
- Covered screens include `Modeling`, `Catalog`, and `Network Scope`.

### Guardrails Preserved

- Direct row selection does not trigger the new page scroll behavior.
- Indirect selection sources such as selection synchronization and other passive UI updates keep their existing no-auto-scroll contract.
- The scroll helper avoids aggressive movement when the target panel is already sufficiently visible.

### Regression Coverage

- Added deterministic scroll-intent coverage for:
  - representative `New` flows;
  - representative `Edit` flows;
  - non-regression of row-click and indirect-selection no-scroll behavior.

## Version 1.4.3 - Req_096 Delivery

### Recent Changes Readability

- Recent-changes history labels now prefer human-readable entity references instead of opaque storage identifiers.
- Connectors, splices, wires, catalog items, nodes, segments, and layout events resolve labels from business-facing refs such as `technicalId`, manufacturer reference, linked node names, or endpoint-derived topology text.
- Delete and update history entries preserve readable identity by using previous and next state context during label generation.

### Persistence And Restore Safety

- Existing persisted recent-changes entries remain loadable without migration.
- Newly generated readable labels restore correctly after reload while undo/redo stack semantics stay unchanged.

### Regression Coverage

- Added targeted coverage for readable label generation across representative entity kinds and for wire-delete labels in the recent-changes UI.
- Preserved existing reload and Network Scope visibility regression coverage for recent-changes persistence behavior.

## Version 1.4.3 - Req_110 Delivery

### Assisted Wire Sizing

- Networks now support optional `Voltage (V)` metadata used by assisted wire sizing.
- Wires now support optional `Current (A)` and `Material`, with `Copper` as the default V1 material in forms.
- The wire form now shows `Recommended section: X mm²` directly below `Section (mm²)` with an explicit `Apply` action.

### Compatibility And Determinism

- Recommendation logic is centralized and normalizes to a locked standard wire-section set.
- Local persistence and network import/export now preserve `voltageV`, `currentA`, and `material`.
- Legacy workspaces and imports that lack the new fields remain loadable without fake default voltage write-back.

## Version 1.4.3 - Req_111 Delivery

### Modeling Dropdown Ordering

- Dynamic dropdowns in `Modeling` are now sorted alphabetically by the visible option label.
- The shared sort contract keeps deterministic tie-breaks and preserves selected missing fallback options at the top when needed.
- Static semantic selects keep their deliberate order and are not forced through the alphabetical policy.

## Version 1.4.3 - Req_112 Delivery

### Delete Feedback And Safe Cascade

- Blocked delete attempts now open a dedicated impact dialog instead of feeling like a silent no-op.
- The dialog summarizes dependency categories with counts and representative references for connectors, splices, nodes, segments, and catalog items.
- Safe cascade delete is now available only for bounded `connector` and `splice` cases where the exact impact set is limited to linked nodes, and the cascade remains one logical undo/redo step.

## Validation and Regression Evidence

- `npm run -s lint`
- `npm run -s typecheck`
- `npm test -- --run src/tests/app.ui.delete-confirmations.spec.tsx`
- `npm test -- --run src/tests/network-summary-bom-csv.spec.ts src/tests/app.ui.network-summary-bom-export.spec.tsx src/tests/app.ui.creation-flow-ergonomics.spec.tsx src/tests/app.ui.catalog.spec.tsx src/tests/app.ui.networks.spec.tsx`
- `npm run -s build`
- `npm run -s ci:blocking`
