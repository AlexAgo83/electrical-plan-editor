# Changelog (`1.10.0 -> 1.10.1`)

## Version 1.10.1 - Analysis Wire Navigation Controls

### Wire Analysis

- Changed connector analysis "Go to" actions so they open the targeted wire directly in edit mode.
- Added a Settings preference to hide the Wire analysis auto route panel when route details are not needed.
- Persisted the new route panel visibility preference with a UI preference schema migration.

## Validation and Regression Evidence

- `npx tsc --noEmit`
- `npm run -s test -- src/tests/app.ui.analysis-go-to-wire.spec.tsx src/tests/app.ui.settings-route-preview.spec.tsx --pool=forks --maxWorkers=2 --testTimeout=20000`
