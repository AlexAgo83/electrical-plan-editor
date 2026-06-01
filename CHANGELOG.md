# Changelog

## [1.12.0] - 2026-06-01

### Added

#### Fuse box connector type
- Catalog items can now be marked as **fuse box** via a new checkbox in the catalog form. When enabled, the catalog item auto-generates consecutive fuse pairs from its connection count (pin 1↔2, 3↔4, …). The computed pairs are shown as a preview in the form.
- Connector instances backed by a fuse-box catalog item expose a **Fuse ratings** field in the connector properties form. Format: one line per pair as `pairIndex,amps` (e.g. `0,10` for fuse 0 at 10 A).
- In the **functional view**, fuse box connectors are fully transparent — they do not appear as connector nodes. Instead, each active fuse pair renders as a **fuse symbol on the wire** between the two external connectors, labelled `technicalId / 10A`. Fuse pairs with only one side connected remain visible in the graph (useful for spotting wiring errors). Multiple fuse boxes are disambiguated by their technical ID in the label.

#### New data model fields
- `CatalogItem.fuseBoxConfig` — stores the list of fuse pairs (`pairIndex`, `pinA`, `pinB`).
- `Connector.fusePairRatings` — stores per-instance fuse calibres as a `Record<pairIndex, amps>`.

### Changed

#### Wire tab — functional tag filter
- The **Tag** dropdown filter in the wire list (both modeling and analysis views) now filters by `wire.functionalDomainTag` instead of `wire.twistGroupLabel`.

#### Wire tab — column layout
- The conditional **Route mode** column has been replaced by a permanent **Functional tag** column, positioned between *Technical ID* and *Twist group*. The column displays the explicit functional domain tag or *Auto* if none is set.
