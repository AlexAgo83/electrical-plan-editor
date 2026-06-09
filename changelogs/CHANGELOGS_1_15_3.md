# Changelog (`1.15.2 -> 1.15.3`)

## Major Highlights

- Segment callouts now render in the intended layer order, keeping callout connectors and related overlays readable in the network summary canvas and exported SVG output.
- Rear backshell catalog defaults now detect material defaults correctly, with focused regression coverage split into the UI lane that owns the catalog workflow.
- Legacy product context for fuse box schematics, import conflict handling, network statistics, and pin-level current diagnostics has been migrated into managed Logics product briefs.
- The segment callout follow-up workflow is closed with linked request, backlog, task, product, and release evidence.

## Patch Notes

- Aligned segment callout rendering hierarchy across the network summary panel, canvas panel, graph layers, viewport coverage, and layering tests.
- Updated network canvas and SVG export assertions to cover the corrected segment callout layer.
- Fixed rear backshell catalog default detection in catalog handlers.
- Split rear backshell catalog regression coverage out of the broad catalog UI test and registered the dedicated spec in segmented UI quality checks.
- Migrated legacy product brief documents into managed Logics product docs and updated related request, backlog, task, architecture, and changelog references.
- Closed the `req_141` delivery chain for segment callout layering, product brief migration, and connector material default sync.

## Version 1.15.3 - Segment Callout Layering and Catalog Default Sync

### Segment Callout Rendering

- Segment callouts now maintain the expected visual hierarchy in the network summary canvas.
- SVG export coverage now verifies the corrected segment callout layer behavior.
- Canvas snapshot coverage was refreshed for the updated callout rendering order.

### Catalog Defaults

- Rear backshell catalog material defaults are detected consistently by the catalog handlers.
- Dedicated UI regression coverage keeps rear backshell catalog behavior in the segmented UI gate.

### Product Context Migration

- Fuse box functional schematics, network import conflict resolution, network statistics, and pin-level source/consumer current diagnostics now have managed Logics product briefs.
- Related Logics documents link to the managed product context instead of legacy standalone docs.

### Verification

- `logics-manager status`
- `logics-manager health`
- `logics-manager audit --legacy-cutoff-version 1.1.0 --group-by-doc --skip-ac-traceability`
- `npm run -s ci:blocking`
