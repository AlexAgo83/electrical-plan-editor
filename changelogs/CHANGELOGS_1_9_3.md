# Changelog (`1.9.2 -> 1.9.3`)

## Major Highlights

- Improved Analysis navigation so table references open the relevant modeling editors instead of staying in analysis-only context.
- Polished wire-route and segment-analysis ergonomics with clearer `Go to` behavior and inspector handoffs.
- Refined catalog and inspector workflows, including manufacturer-reference navigation and catalog physical-layout panel gating.
- Hardened CI quality gates after dependency-audit and modularization growth, including dedicated audit allowlists and boundary checks.
- Added Render release deployment automation after release CI.

## Version 1.9.3 - Analysis Navigation and Release Pipeline Hardening

### Analysis Navigation and Inspector Ergonomics

- Improved navigation from Analysis rows back into modeling forms for connectors, splices, wires, and related endpoints.
- Added richer selection handoff behavior from analysis tables into the modeling workspace.
- Polished wire-route analysis layout and interaction flow.
- Kept canvas selection and inspector actions aligned with the active analysis target.

### Catalog and Modeling Workflow Polish

- Linked inspector manufacturer references back to their catalog items.
- Renamed inspector selection actions to use clearer edit-oriented copy.
- Gated catalog connector material defaults and physical-layout panels so they only appear when relevant.
- Merged catalog usage panels to reduce repeated context and improve scanability.
- Preserved selection after canvas pan interactions.

### Export and Canvas Controls

- Added SVG and PNG export previews with stable preview-format retention on refresh.
- Exposed canvas selection inspector actions.
- Swapped network canvas controls to icon-based affordances, including a dedicated fit icon.
- Improved functional schematic and connector-layout internals through focused component extraction.

### CI, Release, and Quality Gates

- Added Render deployment after release CI.
- Hardened npm audit handling with an explicit quality gate and ExcelJS exception guard.
- Split oversized integration specs and extracted controller, table, and persistence helpers to stay within modularization gates.
- Added dedicated quality checks for UI timeout governance, store modularization, and ExcelJS boundaries.

### Documentation and Version Alignment

- Aligned release metadata to `1.9.3` across `VERSION`, `package.json`, `package-lock.json`, and README.

## Validation and Regression Evidence

- `npm run -s lint`
- `npm run -s typecheck`
- `npm run -s test:ci:segmentation:check`
- `npm run -s quality:dependency-audit`
- `npm run -s test -- src/tests/changelog-feed.spec.ts --run`
- `npm run -s build`
- `npm run -s quality:pwa`
- `git diff --check`
