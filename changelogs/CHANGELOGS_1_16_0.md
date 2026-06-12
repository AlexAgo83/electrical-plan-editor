# Changelog (`1.15.6 -> 1.16.0`)

## Major Highlights

- Splices can now be placed as **floating splices** anchored at a segment offset (`segmentId` + reference `fromNodeId` + `offsetMm`) instead of always requiring a dedicated splice node, decoupling splice placement from network topology.
- A central splice placement resolver drives routing, validation, and rendering from the new placement metadata, with a derived routing graph that inserts virtual splice points and accounts for partial segment traversal in route lengths.
- Legacy splice-node workspaces and imported network files migrate automatically on load: adjacent segments fuse under a safe-fusion predicate (with an intermediate-node fallback), affected wire routes are rewritten, and a modal migration report summarizes every created/converted node, fused segment, rewritten route, and clamped/unresolved placement.
- Network Summary renders floating splices without splice nodes, preserving current splice styling, selection, activation, callouts, and a deterministic anti-superposition render-only offset so markers are never hidden under nodes or other splices.

## Patch Notes

- Added the segment-offset placement contract and `resolveSplicePlacement` resolver (`src/core/splicePlacement.ts`, `src/store/reducer/helpers/splicePlacement.ts`) and renamed the canvas-position reducer to `src/store/reducer/spliceCanvasLayoutReducer.ts`.
- Added load-time legacy splice-node migration with deterministic fusion, intermediate-node fallback, reserved `MIG-SPLICE-*` labels, and global wire-route rewriting (`src/adapters/persistence/spliceNodeMigration.ts`).
- Added derived virtual-splice routing, partial endpoint route detail, and zero-length route representation in the wire routing helpers.
- Added reducer/validation guards for unplaced-splice rejection, host-segment delete blocking, placement removal/move guards, `rearBackshellLink` exclusion, offset clamping, and a non-blocking warning channel.
- Bumped the workspace and network-file payload schemas to v4 with backward-compatible loading of older files and migration reporting on both load paths.
- Modularization recovery to keep the cumulative feature work within the project's per-file budgets, without behavior changes:
  - Split `src/store/reducer/helpers/wireTransitions.ts` (881 lines) into `wireEndpointHelpers.ts`, `derivedWireRouting.ts`, and `directionalSpliceSide.ts`, re-exporting the public API from `wireTransitions.ts`.
  - Extracted `convertWireEndpointsForDirectionalSplice` into `src/store/reducer/helpers/spliceDirectionalConversion.ts` (from `spliceReducer.ts`).
  - Extracted endpoint occupancy guards into `src/store/reducer/helpers/wireEndpointOccupancyGuards.ts` (from `wireReducer.ts`).
  - Extracted `useAppControllerSpliceMigrationReport` from `AppController.tsx`, and `useSpliceOptimizedPlacementSuggestion` + `useSplicePortReservation` from `useSpliceHandlers.ts`.
- Fixed an invalid `Connector` literal in `src/tests/persistence.splice-node-migration.spec.ts` that broke the TypeScript gate.
- Synced the root `VERSION` file with the released `1.16.0` version.

## Version 1.16.0 - Floating Splice Placements Decoupled From Network Topology

### Placement Model

- A splice may carry a canonical `segmentOffset` placement; `0 mm` and full-length offsets are allowed and displayed explicitly, and multiple splices may share the same segment offset.
- Splice forms expose host segment, reference node, offset, and the conversion workflow; analysis tables expose host segment, distance from reference node, and partial length detail.

### Migration And Compatibility

- Degree-0/1/2 and branch legacy splice nodes migrate deterministically; unfixable routes stay loadable with diagnostics, and newly exported files no longer emit legacy splice nodes.
- Local persisted workspaces and network export files are supported at equal priority on both load paths.

### Verification

- `npm run -s lint`
- `npm run -s typecheck`
- `logics-manager lint --require-status`
- `logics-manager audit --legacy-cutoff-version 1.1.0 --group-by-doc --skip-ac-traceability`
- `npm run -s ci:blocking`
