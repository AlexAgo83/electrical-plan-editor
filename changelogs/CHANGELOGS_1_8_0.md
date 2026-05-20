# Changelog (`1.7.0 -> 1.8.0`)

## Major Highlights

- Refined network summary connector/splice callouts with clearer drawing settings, stable leader layering, and edited-layout-only connector drawings.
- Improved connector physical views with wire technical IDs, wire color markers, shell padding controls, and default `C1`, `C2`, `C3` way labels.
- Strengthened catalog navigation and reference workflows across inspector, catalog panels, endpoint reference rows, and wire drill-downs.
- Migrated the Logics workflow from the vendored `logics/skills` kit to the standalone `logics-manager` CLI.
- Refreshed README, contributing, and CI setup documentation to match the current standalone workflow.

## Version 1.8.0 - Callout Drawing and Logics Manager Migration

### Network Summary Callouts

- Connector drawings in callouts now render only when the catalog physical layout has been edited instead of showing an auto-generated fallback.
- The callout drawing preference remains configured in settings while the View menu only controls callout visibility.
- Callout leader lines render above the grid and below callout cards for clearer canvas layering.
- Regression coverage now protects edited-layout callout drawings and generated-layout suppression.

### Connector Physical Views

- Connector physical pins now show default labels as `C1`, `C2`, `C3`, and so on when no custom label exists.
- Physical connector badges can show wire technical IDs and wire color markers directly on occupied ways.
- Connector layout editing supports shell padding and keying placement refinements.

### Catalog and Reference Navigation

- Catalog-linked labels and inspector surfaces prefer business-facing manufacturer references.
- Catalog endpoint and seal reference rows can navigate directly to matching wires.
- Catalog panels and reference tables received targeted selection, hover, and theme polish.

### Workflow and CI

- Removed the `logics/skills` submodule and switched project validation to `python3 -m logics_manager`.
- Updated CI to install and run the standalone Logics Manager.
- Updated README and contributing setup instructions for the current workflow and local environment variables.

## Validation and Regression Evidence

- `npm run ci:blocking`
