## Major Highlights

- Fuse nodes in the functional schematic now render as a vertical cartridge with sharp right-angle corners, with terminals entering top and bottom and labels mounted on the side, so the symbol reads naturally inside power-trace paths.
- Fuse cartridge colors are harmonized with the surrounding network blocks: the body uses the connector fill, the stroke and fuse element line match the network node stroke color, and the rating chip background derives from the connector fill instead of the previous standalone orange palette.
- The connector fuse rating editor now exposes editable pin assignments per pair: pin A and pin B sit on the same row separated by a vertically-centered dash, and the rating input, `Amp` suffix, and quick-pick chips line up on the same row immediately after the pins.
- A non-blocking warning surfaces when a pin number is reused across pairs in the same connector, so duplicate wiring is visible without preventing save.

## 1.12.5

- Replaced the horizontal cartridge fuse symbol with a vertical, sharp-cornered cartridge (26x60), moved the connector technical ID label and the rating chip to the side, and aligned the wires entering the cartridge with the vertical fuse element line.
- Harmonized fuse cartridge fill/stroke and rating-chip colors with the network connector tokens (`--network-node-connector-fill`, `--network-node-stroke-color`, `--network-node-label-color`).
- Renamed the rating input unit from `A` to `Amp` and placed it as a standalone element between the rating input and the quick-pick chips.
- Added editable pin A / pin B inputs per fuse pair in the connector form, with a `PIN` prefix label, top-aligned to the pin input row regardless of any wrapped warnings.
- Added a `Connector.fusePairOverrides` optional field that captures per-connector pair pin overrides. Persistence stays backward compatible: connectors without overrides continue to read pairs from the catalog `fuseBoxConfig`.
- Wired `fusePairOverrides` into functional schematic trace expansion and node generation: cavity-to-pair mapping now prefers the connector override, falling back to the catalog pairs.
- Added a "Reset pairs to catalog" action next to "Clear all" in the fuse rating editor to restore catalog-derived pin assignments in one click.
- Added a non-blocking inline warning in the editor when a pair pin number collides with another pair in the same connector, listing the conflicting pair indexes.
- Restyled the fuse rating row as a single flex line: `#X PIN A - PIN B [rating] Amp [chips]`, with the dashes vertically centered on the pin input row and the rating cell aligned with the pin input row rather than the rectangle center.
- Updated the connector fuse rating editor test to cover pin override editing and persistence of `fusePairOverrides`.
- Updated the fuse-box functional schematic product brief with the iteration scope.

### Verification

- `npm run lint`
- `npm run typecheck`
- `npm run quality:ui-modularization`
- `npm run quality:store-modularization`
- `npm run quality:pwa`
- `npm run build`
- `npx vitest run src/tests/core.functional-schematic.spec.ts src/tests/app.ui.connector-fuse-rating-editor.spec.tsx src/tests/persistence.localStorage.spec.ts src/tests/portability.network-file.spec.ts src/tests/store.reducer.catalog.spec.ts src/tests/ai-agent-operation-contract.spec.ts src/tests/ai-agent-apply.spec.ts`
