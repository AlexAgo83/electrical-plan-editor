# Changelog (`1.6.3 -> 1.6.4`)

## Major Highlights

- Added a read-only functional schematic view in the Network scope so harness traces can be reviewed from the network workspace.
- Added main harness connector selection on connectors, letting the functional view start from one or more configured root connectors.
- Improved functional schematic readability with vertical flow layout, compact parent/child spacing, wire labels, color hover feedback, filters, and export support.
- Included CI regression fixes that landed after `v1.6.3` for directional splice and export helper changes.

## Version 1.6.4 - Network Functional Schematic

### Functional Schematic View

- The Network scope now exposes a read-only functional schematic derived from the detailed network model.
- The view starts from configured main harness connectors when available, with fallback behavior for selected wires, connectors, or splices.
- Functional filters are available for `signal`, `12V power`, `-12V power(GND)`, `48V`, and `CAN`.
- The generated schematic remains transient and recomputed from the source model instead of becoming a second editable model.

### Layout and Readability

- Added a vertical flow layout tuned for wide screens, with parent/child grouping that keeps high fan-out branches readable.
- Added wire names and technical labels above wires, with compact collision handling so labels stay close to their nominal wire.
- Added hover/focus hitboxes around wire labels, making wire color preview easier to target than thin wire paths.
- Adjusted label layering so labels render above wires and nodes while avoiding connector, splice, and fuse blocks where practical.

### Connector Metadata

- Added a main harness connector marker on connector entities.
- Normalized the new connector marker through reducer, persistence migration, and import/export paths.
- Added connector form wiring and reducer coverage for the new marker.

### CI and Regression Coverage

- Added unit coverage for functional schematic graph derivation, filtering, root connector seeding, and non-blocking warnings.
- Added UI regression coverage for the Network scope functional schematic integration, filters, labels, color swatches, and export action.
- Preserved Network Summary export plumbing by reusing the existing SVG/PNG export path.
- Carried forward post-`v1.6.3` CI fixes for directional splice features and export helper typing.

## Validation and Regression Evidence

- `.\node_modules\.bin\tsc.cmd --noEmit`
- `.\node_modules\.bin\eslint.cmd src/app/components/network-summary/FunctionalSchematicPanel.tsx src/tests/app.ui.network-summary-workflow-polish.spec.tsx`
- `.\node_modules\.bin\vitest.cmd run src/tests/core.functional-schematic.spec.ts src/tests/app.ui.network-summary-workflow-polish.spec.tsx --testTimeout=15000`
