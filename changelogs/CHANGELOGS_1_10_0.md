# Changelog (`1.9.8 -> 1.10.0`)

## Version 1.10.0 - Connector Endpoint Material Cleanup

### Connector Catalog Materials

- Changed "Clear terminal and seal overrides" so it clears manual connection reference/name and seal reference/name fields on every wire endpoint terminating at the edited connector.
- Kept cleanup scoped to the edited connector side only: opposite wire endpoints and other connectors keep their existing manual material fields.
- The action still clears connector-level terminal/seal override text so catalog defaults can regain priority after saving.

### Release Metadata

- Aligned release metadata to `1.10.0` across `VERSION`, `package.json`, `package-lock.json`, and README.
- Corrected the release line to `1.10.0` so the next release remains ordered correctly under semantic versioning.

## Validation and Regression Evidence

- `npm test -- --run src/tests/app.ui.creation-flow-ergonomics.spec.tsx`
- `npm run -s typecheck`
- `npm run -s lint`
- Verified root package metadata, lockfile metadata, and `VERSION` all resolve to `1.10.0`.
