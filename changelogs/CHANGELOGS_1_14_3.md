# Changelog (`1.14.2 -> 1.14.3`)

## Major Highlights

- Prevented mouse-wheel interactions from accidentally editing focused numeric fields across the app.
- Refined connector analysis pin-role editing with shorter bulk action wording and cleaner role workflow coverage.
- Prepared release metadata and documentation for `1.14.3`.

## Patch Notes

- Numeric inputs such as wire endpoint `Way index`, splice ports, connector cavity counts, currents, and settings values now ignore wheel-driven value changes by removing focus before the browser applies native number stepping.
- Connector pin role bulk actions now use shorter labels: `Apply role` and `Use catalog default`.
- Workspace shell regression coverage now verifies that focused numeric inputs are protected from wheel edits.
- README badge/current-version metadata and package lock metadata are updated for `1.14.3`.

## Version 1.14.3 - Numeric Input Wheel Guard and Pin Role Polish

### Form Interaction Safety

- Added an app-wide wheel guard for `input[type="number"]` controls so users do not accidentally alter numeric values while scrolling panels.
- The guard applies globally instead of requiring each form to opt in individually.

### Connector Pin Roles

- Shortened connector pin-role bulk action labels while preserving existing save/reset behavior.
- Kept catalog pin role and connector inspector tests aligned with the updated wording.

### Verification

- `npm run ci:blocking`
