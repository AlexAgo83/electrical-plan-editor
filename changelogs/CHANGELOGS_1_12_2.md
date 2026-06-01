## Major Highlights

- Fixed a regression where toggling "Fuse box" on a catalog item appeared to save (toast confirmed) but `fuseBoxConfig` was silently dropped — the option is now correctly persisted and round-trips through the catalog form.
- Simplified wire color selection in the modeling form: removed the "Color mode" selector and the "Free color" mode. Primary color now defaults to "Not specified", and the secondary color picker only appears once a primary color is chosen.

## 1.12.2

- Fixed `catalog/upsert` so `fuseBoxConfig` is included in the normalized catalog item written to state. Previously the field was omitted from the reducer's normalized payload, so toggling Fuse box never persisted across edit/reload cycles.
- Removed the wire form "Color mode" select (none/catalog/free) and the "Free color label" input. The primary color dropdown now drives the mode implicitly: empty value means no color, a catalog color enables the secondary color picker.
- Renamed the empty primary color option from "None" to "Not specified" for clarity.
- The secondary color picker is hidden until a primary color is selected, and is reset when the primary color is cleared.
- Backward compatibility: existing wires stored with `colorMode: "free"` still render correctly in lists, inspectors, and exports. When opened in the edit form they load as "Not specified"; re-saving them replaces the free-color metadata with no-color (intentional — free color is no longer creatable).

### Verification

- `npm run -s lint`
- `npm run -s typecheck`
- `npm run -s quality:ui-modularization`
- `npm run -s quality:hooks-modularization`
- `npm run -s quality:store-modularization`
- `npm run -s quality:ui-timeout-governance`
- `npm run -s quality:exceljs-boundary`
- `npm run -s quality:dependency-audit`
- `npm run -s test:ci:segmentation:check`
- `npm test -- --run src/tests/store.reducer.catalog.spec.ts src/tests/store.reducer.wires.spec.ts src/tests/app.ui.wire-free-color-mode.spec.tsx src/tests/app.ui.creation-flow-wire-ergonomics.spec.tsx src/tests/app.ui.list-ergonomics-wire-colors.spec.tsx`
