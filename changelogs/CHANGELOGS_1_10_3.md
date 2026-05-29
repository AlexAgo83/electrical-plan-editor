# Changelog (`1.10.2 -> 1.10.3`)

## Version 1.10.3 - Render Release Deployment Recovery

### Release and CI

- Published a recovery release from the CI-green commit after the `v1.10.2` tag was blocked by the UI modularization line-budget gate.
- Kept the Network Summary panel within its locked 1020-line budget so the Render release workflow can pass its CI-success guard before triggering deployment.
- Aligned release metadata to `1.10.3` across `VERSION`, `package.json`, `package-lock.json`, and README.

## Validation and Regression Evidence

- `npm run ci:blocking`
