# Changelog (`1.6.1 -> 1.6.2`)

## Major Highlights

- Fixed wire endpoint reference rename propagation so a confirmed `connection` or `seal` name overwrite now applies to every matching occurrence of the same reference across the dataset.
- Removed cross-reference contamination during rename resolution: choosing a name for one shared reference no longer replays stale endpoint data and no longer rewrites unrelated `connection` or `seal` names on the same wire.
- Added regression coverage for the exact conflicting-name workflow reproduced from production data, including mixed endpoint-side occurrences and catalog/wire edit entry points.

## Version 1.6.2 - Wire Reference Rename Stability

### Shared Reference Rename Propagation

- Kept the single-name-per-reference behavior for wire endpoint `connection` and `seal` references.
- Ensured that when a conflict dialog is confirmed, the selected name is propagated to every wire endpoint carrying the same normalized reference.
- Preserved endpoint-side scoping so propagation still ignores unrelated references and empty reference fields.

### Atomic Plan Application

- Fixed the rename conflict application flow so sequential propagation plans no longer reuse stale wire snapshots.
- Prevented a `seal` rename plan from restoring an outdated `connection` name, and the inverse, when both reference kinds are present on the same wire.
- Hardened the wire-side rename flow around the reproduced `DJ627A-7.8CL` conflict case validated on `W-2` and `W-3`.

### Regression Coverage and Release Alignment

- Added a dedicated UI regression for the conflicting-name choice where the selected value already exists on the currently edited wire and must still propagate to the other matching occurrence.
- Kept the broader wire endpoint and catalog rename suites green to guard against reintroducing cross-reference contamination.
- Aligned the visible release metadata to `1.6.2` across `VERSION`, `package.json`, `package-lock.json`, and the README badge/version display.

## Validation and Regression Evidence

- `npm run typecheck`
- `npx vitest run src/tests/app.ui.creation-flow-wire-endpoint-refs.spec.tsx`
- `npx vitest run src/tests/app.ui.catalog.spec.tsx`
