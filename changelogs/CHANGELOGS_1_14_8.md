# Changelog (`1.14.7 -> 1.14.8`)

## Major Highlights

- Rewrote the harness assembly functional schematic so the BCM (or any main harness master) sits at the head of the layout, fuse boxes are represented by the fuse node directly, and interconnector pins render as the interconnector block instead of an extra connector pin node.
- Fixed several cross-master leak paths in the assembly functional graph: reverse fuse-pair traversal and shared-pin expansion at main harness boundaries no longer drag wires from unrelated power buses into the trace.
- Added a PDF export option for single 2D plan views and a grouped multi-page PDF for selected networks.
- Simplified the wire color form: the primary selector now lists catalog colors directly and includes Free as an option.

## Patch Notes

- Fuse-box pins no longer appear as standalone connector pin nodes in assembly graphs. The wire endpoint is now drawn directly against the fuse node.
- Interconnector pins (saved master or not) render as the interconnector node. The root-pin to interconnector synthetic edge is gone.
- BFS only seeds wires from `isMainHarnessConnector` masters when at least one is configured; other saved masters remain crossable but no longer pull in their own downstream wires.
- Fuse-pair BFS traversal only flows pinA -> pinB, blocking reverse flow back into power feed splices and onward leaks to other main harness territory.
- Main harness connector pins act as endpoint-expansion boundaries in BFS; fuse-pair and interconnector traversal still pass through.
- Fuse-adjacent wire direction is set at render time (pinA-in, pinB-out) and preserved by orient via a `fusePairNodeId` marker so the fuse always has at least one in and one out edge.
- Panel layout sort places `isMainHarnessConnector` roots before interconnector roots so the BCM is anchored at the head of the schematic.
- 2D plan export adds a PDF option with a higher-density raster so text stays legible; grouped network summary export now produces a single multi-page PDF.
- Wire color form: replaced the separate color-mode selector with a primary selector listing catalog colors and Free; reducer and persistence normalization unchanged.

## Version 1.14.8 - Trustworthy Functional Schematic, PDF Export, Wire Color Form

### Harness Assembly Functional Schematic

- Replaced fuse-box pin connector nodes with the fuse node directly in assembly graphs.
- Replaced interconnector pin connector nodes with the interconnector node, even when the pin is a saved master.
- Restricted fuse-pair BFS traversal to the pinA -> pinB direction.
- Made `isMainHarnessConnector` pins endpoint-expansion boundaries during BFS while keeping fuse-pair and interconnector traversal active.
- Restricted BFS seeding to main harness masters when at least one is configured.
- Sorted root nodes so main harness connectors lead in the layout.
- Surfaced `isMainHarnessConnector` on `FunctionalSchematicNode` for layout decisions.
- Extended `src/tests/core.functional-schematic.spec.ts` with regression coverage for the new representation.

### PDF Export

- Added a PDF export option for 2D plan views in the network summary export menu.
- Added a grouped PDF export that packages multiple selected networks into one multi-page PDF.
- Rasterises the existing SVG/canvas output at higher density so embedded text remains legible.
- Added `src/tests/pdf-export.spec.ts` with format and image density assertions.

### Wire Color Form

- Replaced the separate color-mode selector in `ModelingWireFormPanel` with a single primary selector listing catalog colors and a Free option.
- Preserved `colorMode` reducer behaviour and persistence normalization.
- Updated `src/tests/app.ui.creation-flow-wire-ergonomics.spec.tsx` and `src/tests/app.ui.wire-free-color-mode.spec.tsx` to exercise the simplified form.

### Verification

- `npm run -s typecheck`
- `npm run -s lint`
- `npm run -s quality:dependency-audit`
- `npm run -s test:ci:segmentation:check`
- `npm run -s quality:ui-modularization`
- `npm run -s quality:ui-timeout-governance`
- `npm run -s quality:hooks-modularization`
- `npm run -s quality:store-modularization`
- `npm run -s quality:exceljs-boundary`
- `npm run -s build:vite`
- `npm run -s quality:pwa`
- `python3 -m logics_manager lint --require-status`
- `python3 -m logics_manager audit --legacy-cutoff-version 1.1.0 --group-by-doc --skip-ac-traceability`
- `npm test -- --run src/tests/core.functional-schematic.spec.ts src/tests/pdf-export.spec.ts src/tests/app.ui.network-summary-workflow-polish.spec.tsx`
