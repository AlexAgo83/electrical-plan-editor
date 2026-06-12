# Changelog (`1.15.9 -> 1.15.10`)

## Major Highlights

- Reworked the `Settings` export panel into compact, theme-aware blocks and aligned the full settings section order with the navigation.
- Improved the network-summary callouts: tuned dressing column sizing, gave connector/splice callouts a bordered table grid, and surfaced the connector/splice reference with clearer column labels.

## Patch Notes

- Settings export: grouped `Export selected` into a single themed row (`Wire list`, `BOM grouped`, `Network plan`) with `SVG / PNG / PDF` on one compact line, shortened copy, and removed the redundant `1 ready` badge.
- Settings layout: the panel stack now matches the navigation order (AI provider moved to the end), not just the section list.
- Fixed the wire-list and BOM export buttons rendering unthemed in themed modes by routing them through the shared `.row-actions` theming, and pinned the `SVG / PNG / PDF` buttons to one compact row.
- Dressing (segment sheath) callout: reduced the sheath-type (`Layer`) column width by 10% and enlarged the `Insulation` column by 35%, with column positions derived from a shared widths array.
- Connector/splice callouts now render vertical column dividers for a bordered table look consistent with the dressing callout.
- Connector/splice callouts display the manufacturer reference on a `ref : ...` line under the id and name, before the pin rows.
- Spelled out the `Len` and `Sec` callout column headers as `Length` and `Section`, and renamed `Node ID` to `End ID`.

## Verification

- `npm run -s test:ci -- src/tests/network-summary-callouts-layer.spec.tsx src/tests/app.ui.network-summary-callouts-viewport.spec.tsx src/tests/app.ui.network-summary-svg-export.spec.tsx src/tests/app.ui.import-export.spec.tsx src/tests/app.ui.settings.spec.tsx`
- `npm run -s lint`
- `npm run -s ci:blocking`
