# Changelog (`1.6.4 -> 1.6.5`)

## Major Highlights

- Added the multi-harness assembly workflow for grouping connectors into harnesses and tracing cross-harness continuity.
- Promoted Harness Assembly to its own main workspace tab between Network Scope and Modeling.
- Improved Harness Assembly readability with harness-colored visible traces, preserved wire hover colors, editable interconnector names, and clearer connector/interconnector blocks.
- Added explicit functional tags on wires so derived schematic filters can use user-defined values before fallback heuristics.

## Version 1.6.5 - Harness Assembly Refinement

### Harness Assembly Workspace

- Added a dedicated Harness Assembly tab in the primary workspace navigation.
- Kept Network Scope focused on network-level work while Harness Assembly now owns the cross-harness schematic view.
- Updated keyboard navigation and user-facing shortcut copy to account for the new top-level tab.

### Harness and Interconnector Trace Readability

- Rendered visible trace links with the owning harness color while preserving the original wire color on hover/focus.
- Fixed wire labels so each link keeps the expected wire name plus technical ID instead of repeating technical IDs.
- Collapsed interconnector traces into a single expanded interconnector block instead of showing connector blocks before and after it.
- Added layout spacing for larger interconnector blocks to reduce overlap when several pins are close together.

### Wire Functional Tags

- Added a Functional tag selector to the wire definition form.
- Persisted, migrated, imported, and exported the explicit wire functional tag.
- Normalized filter labels to `Signal` and `-12V power (GND)`.
- Used explicit wire tags before text and routing heuristics in the derived functional schematic.

### Connector Block Layout

- Reworked Harness Assembly connector blocks so the network name appears top-left, the technical ID / pin appears centered, and the connector name appears centered below it.
- Harmonized technical ID typography with connector names in Harness Assembly rows.

## Validation and Regression Evidence

- `npm run -s typecheck`
- `npx vitest run src/tests/core.functional-schematic.spec.ts src/tests/store.reducer.wires.spec.ts --pool=forks --maxWorkers=1 --testTimeout=15000`
- `npx vitest run src/tests/app.ui.network-summary-workflow-polish.spec.tsx -t "renders a read-only functional schematic trace with filters and export action" --pool=forks --maxWorkers=1 --testTimeout=15000`
