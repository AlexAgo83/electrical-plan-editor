# Changelog (`1.13.0 -> 1.13.1`)

## Major Highlights

- Fixed a persistence regression where fuse-box catalog items lost their `Fuse box` flag after reloading the app or reopening a workspace file.
- Preserved connector fuse-pair ratings and pair metadata across local persistence, workspace-file round-trips, and network import/export round-trips.
- Added regression coverage on the shared normalization path used by persistence and portability adapters.

## Version 1.13.1 - Fuse Box Persistence Round-Trip Fix

### Fix

- `normalizeCatalogItem` now preserves and validates `fuseBoxConfig` instead of dropping it during catalog normalization.
- The fix is applied centrally in `src/store/catalog.ts`, so the same behavior now holds for:
  - local storage hydration;
  - workspace file open/save round-trips;
  - network import/export payload normalization.

### Validation

- `npm test -- --run src/tests/workspace-file.spec.ts src/tests/persistence.migrations.spec.ts src/tests/portability.network-file.spec.ts`
- `npm run typecheck`
- `npm run lint`
