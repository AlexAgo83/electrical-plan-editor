## task_122_multi_network_functional_analysis_view_and_assembly_scope - Multi-network functional analysis view + assembly scope + L1

> From version: 1.15.3
> Schema version: 1.0
> Status: Done
> Understanding: 100%
> Confidence: 96%
> Progress: 100%
> Complexity: Large
> Theme: Electrical analysis / Diagnostics

# Definition of Done (DoD)
- [x] `computePinElectricalLoad` `assembly` arm implemented per `adr_010`.
- [x] Bridges (`InterHarnessConnectorLink` + shared master connector refs) treated as Kirchhoff pass-through with 1:1 cavity pairing.
- [x] Cycle-safe traversal keyed by `(networkId, connectorId, cavityIndex)`.
- [x] L1 link declaration mismatch emitted as `warning` with `max(currentA)` continuation per ADR.
- [x] Out-of-assembly networks excluded; bridges with far end outside the selected `networkIds` reported in `skippedBridges`.
- [x] Read-only "Multi-network functional analysis" Analysis panel with current-network / active-assembly scope picker.
- [x] Current-network D1–D4 findings plus active-assembly L1 and skipped-bridge diagnostics listed in the view.
- [x] Custom subset scope, union graph summary, and assembly-grade D1–D4 findings listed inside the view.
- [x] `Go to` switches active network before focusing the entity.
- [x] Tests cover assembly aggregation, L1 bridge mismatch, current-scope findings, and component scope picker / finding list rendering.
- [x] Tests cover custom subset, union graph summary, and loop display.
- [x] Tests cover active-network-switching `Go to` target construction and component dispatch.

# Backlog
- `item_614_multi_network_functional_analysis_view_and_assembly_scope`


```mermaid
%% logics-kind: task
%% logics-signature: task|multi-network-functional-analysis-view-a|item-614-multi-network-functional-analys|1-confirm-scope|2026-06-09-rtk-npm-run-s-test
flowchart TD
    Backlog[Backlog item] --> Build[Implementation]
    Build --> Validate[Validation]
    Validate --> Close[Finish workflow]
```

# Acceptance criteria
Mirror `item_614` AC1–AC14.

# Implementation Plan

## Step 1 — Engine assembly arm
- Replace the `NotImplemented` throw in `computePinElectricalLoad` with a real implementation.
- Build the cross-network adjacency by walking each selected network's wires + splices + fuse-box pairs, then adding bridge edges from the active `HarnessAssembly.connectorLinks` and from shared master connector references.
- Reuse the BFS traversal from the `currentNetwork` arm with scoped keys.

## Step 2 — L1 emission
- For each bridge edge, compare the two declared roles + currentA.
- Emit a single L1 warning per (bridge, cavityIndex) on incompatibility (rules from `adr_010` §4).
- Continue aggregation with `max(declaredCurrentA, declaredCurrentA)`.

## Step 3 — Skipped-bridge + loop diagnostics
- Output `diagnostics.skippedBridges` for bridges whose far end is outside `networkIds`.
- Loop warnings list participating scoped pins.

## Step 4 — View
- New top-level view (under "Analysis" tab or sibling).
- Scope picker component with three modes.
- Union graph summary without duplicating the dedicated Harness assembly functional schematic view.
- Findings panel listing D1–D4 + L1 + loop / skipped-bridge entries.
- `Go to` action that dispatches the network switch and focus.

## Step 5 — Tests
- `src/tests/core.pin-electrical-load-assembly.spec.ts` — two-network link, skipped bridge, L1 cases.
- `src/tests/app.lib.multi-network-functional-analysis.spec.ts` — current-scope D1-D4 mapping and active-assembly L1 model.
- `src/tests/app.ui.multi-network-functional-analysis.spec.tsx` — scope picker, themed status chips, finding list.

# Links
- Request: `req_133`
- Architecture decision(s): `adr_010_inter_network_current_bridge_semantics`

# Progress Report
- Delivered in 1.14.0: assembly-scope aggregation core for `InterHarnessConnectorLink`, bridge traversal, skipped-bridge diagnostics, L1 mismatch computation, and core assembly tests.
- Real-status audit on 2026-06-09: no read-only multi-network functional analysis view, scope picker, view-level D1-D4/L1 findings panel, or active-network-switching `Go to` UI was found.
- Completed on 2026-06-09: custom subset selection, union graph summary, assembly-grade D1-D4 findings from the selected union, master-connector-ref aggregation parity, loop warnings surfaced in the panel, and active-network-switching `Go to`.
- Delivery status: done for `item_614`; broader `req_133` remains open for other backlog slices.

# Validation
- 2026-06-09: `rtk npm run -s test -- src/tests/app.lib.multi-network-functional-analysis.spec.ts src/tests/app.ui.multi-network-functional-analysis.spec.tsx --run` passed (2 files, 3 tests). Covers the delivered model and component MVP: current-scope D1-D4 projection, active-assembly L1/skipped-bridge surfacing, and scope picker/finding-list rendering.
- 2026-06-09: `rtk npm run -s lint` passed.
- 2026-06-09: `rtk npm run -s typecheck` passed.
- 2026-06-09: `rtk npm run -s test -- src/tests/app.lib.multi-network-functional-analysis.spec.ts src/tests/app.ui.multi-network-functional-analysis.spec.tsx --run` passed (2 files, 4 tests). Adds coverage for D1-D4/L1 navigation targets and the component `Go to` callback.
- 2026-06-09: `rtk npm run -s test -- src/tests/core.pin-electrical-load-assembly.spec.ts src/tests/app.lib.multi-network-functional-analysis.spec.ts src/tests/app.ui.multi-network-functional-analysis.spec.tsx --run` passed (3 files, 14 tests). Covers master connector refs, loop warnings, custom subset scope, union graph summary, assembly-grade D1-D4 findings, L1, skipped-bridge surfacing, and `Go to` target dispatch.
- 2026-06-09: `rtk npm run -s lint` passed.
- 2026-06-09: `rtk npm run -s typecheck` passed.
