# Changelog (`1.6.7 -> 1.6.8`)

## Major Highlights

- Polished the Harness Assembly / Current Network Functional switcher so the selected mode, title, and assembly selector are consistent across desktop and mobile.
- Removed the now-redundant visual connector/splice classification frame and interconnection selection controls from the functional schematic.
- Hardened the harness assembly mobile breakdown layout, including assembly rows, embedded network rows, and action buttons.
- Preserved the sample harness assembly when migrating legacy single-network sample data.

## Version 1.6.8 - Harness Assembly Functional Schematic Polish

### Harness Assembly Functional Schematic

- Harness Assembly now appears before the Current Network Functional schematic in the panel order.
- The Harness Assembly selector lives in the top mode panel and is disabled while Current Network Functional is active.
- Current Network Functional displays the active network name using the same themed subtitle treatment as Network Summary.
- Functional schematic connector/splice nodes no longer use a green classification frame because wire tags already carry that rule.
- Interconnection selection and the source/target selection panel were removed from this screen.

### Mobile Breakdown Layout

- Assembly rows and nested network rows keep stable spacing and wrapping on mobile.
- The top Harness Assembly / Current Network Functional panel now keeps all controls visible instead of compacting them out of view.
- A New assembly action is available before Save and Delete assembly.

### Visual Polish

- Export SVG uses the same icon treatment as the other screens.
- Functional schematic subtitles no longer include an extra leading colon.
- Harness assembly color selectors render as circular swatches without the black square artifact.

### Persistence Compatibility

- Legacy sample-network migration restores the sample harness assembly when loading the older single-network fixture shape.

## Validation and Regression Evidence

- `npm run ci:blocking`
- `npx vitest run src/tests/sample-network.compat.spec.ts --pool=forks --maxWorkers=2 --testTimeout=15000`
