# Changelog (`1.9.4 -> 1.9.5`)

## Version 1.9.5 - Import Warning Details

### Import / Export

- Added visible warning and error detail lists below the network import summary.
- Kept the existing import counters while exposing the exact reason for partial imports, including deterministic ID and technical ID renames.
- Added a regression test covering duplicate-network import warnings in the settings import/export panel.

## Validation and Regression Evidence

- `npx vitest run src/tests/app.ui.import-export.spec.tsx`
