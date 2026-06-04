# Changelog (`1.14.6 -> 1.14.7`)

## Major Highlights

- Fixed stale Wires tag filtering when switching active networks.
- Hardened imported network entity state against duplicate or missing `allIds` entries.
- Protected collection selectors from rendering duplicate entities when older saved data already contains a broken entity index.

## Patch Notes

- The Wires tag filter now resets to `Any` when the selected functional tag does not exist in the newly active network.
- Network file import normalization now deduplicates `allIds` and drops ids that no longer have a matching `byId` entity for connectors, splices, nodes, segments, and wires.
- Collection selectors now skip duplicate and missing ids before exposing entity arrays to UI and graph renderers.
- Added regression coverage for stale wire-tag filters across network switching and duplicated imported node ids.

## Version 1.14.7 - Network Switch and Import Integrity Fixes

### Wire Filters

- Kept valid tag filters active across network switches when the target network still exposes the selected tag.
- Cleared invalid tag filters automatically so switching networks cannot leave the Wires table empty with no visible recovery option.

### Import Integrity

- Normalized imported entity indexes before exposing imported network state to the app.
- Prevented duplicate node ids in imported `allIds` from producing duplicate canvas render models.
- Preserved existing entity sorting while enforcing the one-id, one-entity invariant for imported network files.

### Verification

- `npm run -s ci:blocking`
- `npm test -- src/tests/app.ui.list-ergonomics.spec.tsx`
- `npm test -- src/tests/portability.network-file.spec.ts`
- `npm run -s typecheck`
- `npm run -s lint`
- `npm test -- src/tests/app.ui.navigation-canvas.spec.tsx`
