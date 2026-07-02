# Changelog (`1.17.1 -> 1.17.2`)

## Major Highlights

- Wire endpoint displays now surface the physical connector way label configured in the catalog layout (e.g. `A10`) instead of the numeric `C<n>` fallback, keeping endpoint tables, panels, callouts, and exports aligned with the physical connector drawing.

## Patch Notes

- Connector cavity endpoint descriptions (detail panels, endpoint lists, `describeWireEndpoint*` helpers) render the configured physical layout label for the matching cavity index, falling back to `C<n>` when no label exists.
- Wire endpoint forms show a read-only "Physical label" preview beside the numeric way index input when the resolved physical label differs from the numeric fallback, so editing by index stays unambiguous.
- Network-summary connector and splice callouts use the physical way label for both local and target pins. Callout groups now carry the numeric `cavityIndex` directly, so cavity highlighting and wire lookup no longer depend on parsing a `C<n>`-shaped label.
- CSV/table exports and the wire-list export resolve the same physical way label policy as the UI endpoint descriptions.
- Fixed a physical-vs-numeric mismatch in the connector synthesis table: the local way column (and its CSV export) still emitted `C<n>` while the destination column already resolved physical labels. The local column now resolves the selected connector's physical way label with the same `C<n>` fallback.

## Non-Goals

- The persisted endpoint model, occupancy keys, routing, validation, imports, and exports remain based on the numeric `cavityIndex`; physical labels are display-only and are not enforced as unique identifiers.

## Verification

- `npm run -s lint`
- `npm run -s typecheck`
- Focused suites: `use-wire-endpoint-descriptions`, `use-entity-list-model-connector-synthesis`, `network-summary-callout-prefix`, `network-summary-callouts-layer`, `wire-list-export`

## Notes

- Builds on `1.17.1`.
