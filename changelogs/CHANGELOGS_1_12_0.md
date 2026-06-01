# Changelog (`1.11.2 -> 1.12.0`)

## Major Highlights

- Added fuse-box catalog support with generated fuse pairs and connector-level fuse ratings.
- Rendered active fuse pairs as inline fuse symbols in the functional view instead of exposing fuse-box connectors as graph nodes.
- Added wire protection data for fuse-backed wires and catalog assignments.
- Changed the wire Tag filter to use `wire.functionalDomainTag`.
- Replaced the conditional route-mode wire column with a permanent Functional tag column.

## Version 1.12.0 - Fuse Box Catalog Type and Wire Functional Tags

### Fuse box connector type

- Catalog items can now be marked as fuse boxes via a new checkbox in the catalog form.
- Fuse-box catalog items auto-generate consecutive fuse pairs from their connection count (`1-2`, `3-4`, and so on).
- The catalog form shows a generated fuse-pair preview before save.
- Connector instances backed by a fuse-box catalog item expose a Fuse ratings field in the connector properties form.
- Fuse ratings use one line per pair as `pairIndex,amps`, for example `0,10` for fuse pair 0 at 10 A.

### Functional schematic fuse rendering

- Fuse-box connectors are transparent in the functional view and no longer appear as connector nodes.
- Active fuse pairs render as fuse symbols on the wire path between external connectors.
- Fuse labels include the connector technical ID and rating, such as `FUSE-BOX-1 / 10A`.
- Fuse pairs with only one side connected remain visible so incomplete fuse-box wiring is easier to diagnose.
- Multiple fuse boxes are disambiguated by connector technical ID in the rendered label.

### Data model

- Added `CatalogItem.fuseBoxConfig` to store fuse-pair definitions.
- Added `Connector.fusePairRatings` to store per-instance fuse calibres by pair index.
- Added wire protection assignment support for fuse-backed catalog references.

### Wire list and filters

- The wire Tag dropdown now filters by `wire.functionalDomainTag` instead of `wire.twistGroupLabel`.
- The wire list now shows a permanent Functional tag column between Technical ID and Twist group.
- Functional tag cells display the explicit tag when set, or `Auto` when the wire has no explicit functional domain tag.

## Validation and Regression Evidence

- `npm run -s lint`
- `npm run -s typecheck`
- `npm run -s test:ci:segmentation:check`
- GitHub Actions CI `26758334440` passed on `main`.
