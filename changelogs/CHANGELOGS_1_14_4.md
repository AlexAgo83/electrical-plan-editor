# Changelog (`1.14.3 -> 1.14.4`)

## Major Highlights

- Added a read-only `Statistics` workspace tab between `Modeling` and `Validation`.
- Added active-network and manual multi-network statistics covering KPIs, length metrics, wire distributions, and utilization tables.
- Prepared release metadata and documentation for `1.14.4`.

## Patch Notes

- The new statistics calculator aggregates counts, physical wire lengths, route-lock coverage, connector/splice utilization, wire section/color distributions, and per-network comparison rows without mutating workspace data.
- Manual network selection shows readable network names only and avoids exposing internal network identifiers in the checkbox list.
- The first statistics release intentionally excludes charts, CSV export, pricing rollups, persistence fields, and AI Agent integration.
- README badge/current-version metadata, root `VERSION`, package metadata, and package lock metadata are updated for `1.14.4`.

## Version 1.14.4 - Network Statistics Workspace

### Statistics Workspace

- Introduced a top-level `Statistics` screen with active-network defaults and manual multi-network scope selection.
- Rendered compact KPI tiles, longest-wire and length-metric tables, wire section/color distributions, connector utilization, and splice utilization.
- Kept unavailable wire lengths explicit so unrouted wires are not reported as zero-length physical wires.

### Release Scope

- Kept the feature read-only with no schema migration, export surface, pricing rollup, chart dependency, or AI Agent context change.
- Added calculator and UI regression coverage, including tab placement, empty state, manual multi-network selection, and hidden out-of-scope panels.

### Verification

- `npm run ci:blocking`
