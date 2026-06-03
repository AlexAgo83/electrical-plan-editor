# Changelog (`1.14.1 -> 1.14.2`)

## Major Highlights

- Added a dedicated, opt-in `Pin electric roles` catalog panel before connector physical layout settings.
- Reordered connector analysis so `Physical` appears before `Ways & roles`.
- Preserved connector cavity role management while restoring CI coverage and release readiness.

## Patch Notes

- Catalog connector editing now keeps pin electric role controls in their own enabled panel instead of visually nesting them inside material defaults.
- Empty accessory messaging is vertically aligned with its status icon for cleaner catalog form scanning.
- Connector analysis prioritizes physical connector data before ways and roles, while retaining cavity card rendering and occupant labels.
- Release documentation, version metadata, and CI-facing changelog format are updated for `1.14.2`.

## Version 1.14.2 - Catalog Pin Roles Panel and Release Readiness

### Catalog Editing

- `Pin electric roles` is now a dedicated catalog panel with its own checkbox, placed before `Connector physical layout`.
- Additional accessory empty-state rows now center the icon and `No additional accessory.` label on the same baseline.
- Catalog accessory styles are split into a focused stylesheet to keep form CSS within modularization limits.

### Connector Analysis

- The `Physical` section now appears before `Ways & roles` in connector analyses.
- Ways and roles cavity cards remain available, including restored occupant references such as `W-1 / A`.

### CI and Release Readiness

- Changelog structure stays compatible with the home feed by listing `Major Highlights` before version sections.
- UI modularization, changelog feed coverage, and connector analysis regression paths were brought back into the blocking CI lane.

### Verification

- `npm run ci:blocking`
