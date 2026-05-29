# Changelog (`1.9.7 -> 1.9.8`)

## Major Highlights

- Fixed the connector override clear action so it remains clickable from the connector edit form.
- Added UI regression coverage for clearing connector-level terminal and seal overrides.

## Version 1.9.8 - Connector Override Clear Button

### Connector Catalog Materials

- Fixed the "Clear terminal and seal overrides" action so it remains clickable from the connector edit form.
- Added UI regression coverage that verifies clearing overrides removes connector-level terminal and seal overrides after saving.

## Validation and Regression Evidence

- `npm test -- --run src/tests/app.ui.creation-flow-ergonomics.spec.tsx`
- `npm run -s typecheck`
- `npm run -s lint`
