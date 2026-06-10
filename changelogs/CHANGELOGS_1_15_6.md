# Changelog (`1.15.5 -> 1.15.6`)

## Major Highlights

- `Network summary` now displays rear-backshell helper nodes using the real node-facing reference when it exists, instead of always forcing a synthetic `${connector technicalId}-BS` suffix.
- Curated or imported backshell helper node references such as `AR-N21` or `LAT-N10.1` now remain visible in the rendered plan and in descriptive SVG text.
- The backshell helper node model now supports an optional persisted `label`, keeping imported data, rendering, and accessibility text aligned.

## Patch Notes

- Added `src/app/lib/backshellHelperNodeReference.ts` to centralize backshell helper reference resolution with the fallback order `label -> id -> connectorTechnicalId-BS`.
- Updated `src/app/components/network-summary/graph/networkSummaryGraphModel.ts` so visible node labels use the shared backshell helper reference resolver.
- Updated `src/app/hooks/useNodeDescriptions.ts` so `<title>` and `aria-label` descriptions use the same backshell helper reference as the visible graph label.
- Extended `connectorBackshellHelper` in `src/core/entities.ts` with an optional `label` and normalized that field in `src/store/reducer/nodeReducer.ts`.
- Added focused regression coverage in `src/tests/network-summary-graph-model.spec.ts` and `src/tests/use-node-descriptions.spec.ts`.
- Added the associated workflow docs for `req_143` and `item_629`.

## Version 1.15.6 - Backshell Helper Node Label Fidelity

### Display Contract

- A `connectorBackshellHelper` node now renders `node.label` when it is present and non-empty.
- If no explicit label exists, the renderer falls back to `node.id`.
- `${connector technicalId}-BS` is now used only as a last-resort fallback.

### Accessibility Parity

- The same resolved backshell helper reference now drives the visible node label and the descriptive text used by `Network summary`.
- Connector-node and splice-node descriptive behavior remains unchanged.

### Verification

- `npm run -s test -- src/tests/network-summary-graph-model.spec.ts src/tests/use-node-descriptions.spec.ts`
- `npm run -s lint`
- `npm run -s typecheck`
- `logics-manager lint --require-status`
- `logics-manager audit --legacy-cutoff-version 1.1.0 --group-by-doc --skip-ac-traceability`
- `npm run -s ci:blocking`
