# Fuse-Box Functional Schematic Release Brief

## Objective

Make fuse-box based electrical traces reliable and readable in the functional schematic.

The release fixes a trace expansion bug where a wire leaving the protected side of a fuse-box pair can disappear from the schematic. It also makes fuse nodes visually distinct from splices and replaces the free-form fuse rating textarea with a structured per-pair editor.

## User Problem

When a main connector feeds a fuse-box pin and another wire leaves the paired pin toward a consumer, the stored network is valid but the functional schematic can show only the incoming side. This hides the outgoing protected branch and makes the schematic unsuitable for review, export, or debugging.

The current fuse symbol also looks too similar to a splice, and fuse ratings are entered through opaque `pairIndex,amps` text lines that are easy to mistype.

## Scope

- Expand functional traces across fuse-box pairs in addition to splices.
- Keep the persisted data model unchanged.
- Render fuse-box pairs as explicit fuse nodes with a cartridge-style schematic symbol.
- Show missing ratings as `?A`.
- Display fuse-to-fuse wires as explicit labeled interconnections, for example `MAIN -> [FUSE 1] -- W-CENTER -- [FUSE 2] -> CONSUMER`.
- Render same-pair fuse-box loops instead of hiding them, so invalid or surprising wiring can be debugged visually.
- Replace the connector fuse rating textarea with one editable row per configured pair.
- Provide quick-pick ratings: `3`, `4`, `5`, `7.5`, `10`, `15`, `20`, `25`, `30`, `40`.
- Do not reject large numeric ratings in the editor; display and persist what the user enters when it is a valid non-negative number.

## Out Of Scope

- Persistence schema migrations.
- Release version bump, changelog, or Logics workflow updates.
- Backend, cloud sync, or import/export file format changes.

## Acceptance Criteria

- Seeding the functional schematic from either side of a fuse-box pair includes both incoming and outgoing wires when both exist.
- A fuse-box pair without a connected outgoing wire does not invent an outgoing schematic edge.
- Trace expansion never bridges unrelated fuse-box pairs.
- Mixed splice and fuse-box traces expand through both electrical link types.
- Fuse-to-fuse wires render as labeled edges between fuse nodes.
- Same fuse-box pair loops render as visible loop edges.
- Fuse nodes use a distinctive cartridge fuse visual with a rating chip.
- Existing stored `Connector.fusePairRatings` hydrate into the new structured editor.
- Empty pair rating omits the pair from `Connector.fusePairRatings`.
- Quick-pick buttons update the targeted pair and expose matching pressed state.
- Applying the same rating to all pairs propagates subsequent edits to every row.

## Iteration: vertical fuse symbol, side-mounted labels, Amp unit, editable pairs

### Visual

- The fuse cartridge in the functional schematic is rendered vertically: terminals enter at the top and exit at the bottom along the same vertical fuse element line.
- The cartridge body uses sharp right-angle corners (no rounded radius) and is taller than wide.
- The connector technical ID label and the rating chip are rendered to the side of the cartridge instead of above and below, taking advantage of the space freed by the vertical orientation.
- The functional schematic layout tolerates the taller fuse node by allowing the vertical overflow into adjacent rows; no schematic-wide row sizing change is required for this iteration.

### Fuse rating editor

- The fuse rating row order is: free-text amperage input, then the unit suffix `Amp`, then the quick-pick rating chips.
- The unit suffix is rendered as `Amp` (replacing the previous `A`).
- Fuse pairs can be edited directly inside the connector form. Each pair row exposes editable `pin A` and `pin B` inputs so the user can override the catalog-derived defaults locally for that connector.
- Pair overrides persist on the connector itself as an optional override and never mutate the catalog item. When no override is present, the catalog `fuseBoxConfig.pairs` continue to drive the editor and the functional schematic.
- Functional trace expansion and fuse-node generation respect the per-connector pair override when present and fall back to the catalog pairs otherwise.

### Persistence Note

- The connector entity gains an optional `fusePairOverrides` field. Absence preserves prior behavior, so legacy stored connectors continue to work without migration.
