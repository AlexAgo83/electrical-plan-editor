# Electrical Plan Editor (V1)

Logic-first kickoff repository for a local-first electrical plan editor.

The V1 goal is to model connectors, splices, routing segments, and wires as a deterministic graph, then compute wire routes and lengths automatically.

## Project Status

This repository is currently in **Wave 2 execution**:
- Product request is defined in `logics/request/req_000_kickoff_v1_electrical_plan_editor.md`.
- Target architecture is defined in `logics/architecture/target_reference_v1_frontend_local_first.md`.
- Backlog is split into 9 V1 items in `logics/backlog/`.
- Delivery orchestration lives in `logics/tasks/task_000_v1_backlog_orchestration_and_delivery_control.md`.

Foundation item `item_000` is implemented:
- TypeScript strict project scaffold (Vite + React + Vitest + ESLint).
- Domain contracts in `src/core`.
- Deterministic normalized store in `src/store`.
- Local persistence adapter skeleton in `src/adapters/persistence`.
- Baseline reducer/store invariants tests in `src/tests/store.reducer.spec.ts`.

Connector item `item_001` is implemented:
- Connector create/edit/delete flow in `src/app/App.tsx`.
- Unique connector technical ID validation in `src/store/reducer.ts`.
- Connector cavity occupancy reservation/release and single-occupancy enforcement.
- Real-time connector cavity visualization and occupancy counters.

Splice item `item_002` is implemented:
- Splice create/edit/delete flow in `src/app/App.tsx`.
- Unique splice technical ID validation in `src/store/reducer.ts`.
- Splice port occupancy reservation/release and single-occupancy enforcement.
- Distinct splice visualization with junction marker and branch count.

Routing network item `item_003` is implemented:
- Node management for connector/splice/intermediate node types.
- Segment management with strict endpoint and length validation.
- Sub-network grouping tag on segments with summary visualization.
- Graph index builder (`src/core/graph.ts`) consumable by routing logic.

Shortest-path item `item_004` is implemented:
- Dijkstra-based routing engine in `src/core/pathfinding.ts`.
- Deterministic tie-break: shortest length, then fewer segments, then stable segment ID ordering.
- Route computation API exposed via `findShortestRoute(...)` and `selectShortestRouteBetweenNodes(...)`.
- Route preview panel integrated in the app for graph-level validation.

Wire lifecycle item `item_005` is implemented:
- Wire create/edit/delete workflow with connector/splice endpoints.
- Automatic shortest-path routing and computed wire length on save.
- Forced route locking with ordered segment validation.
- Route reset to shortest path.
- Automatic impacted wire recomputation when segment definitions change.
- Endpoint occupancy enforcement for connector cavities and splice ports.

Network and synthesis views item `item_006` is implemented:
- Wire route highlight in network segment view when a wire is selected.
- Connector synthesis table with destination and computed wire lengths.
- Splice synthesis table with destination and computed wire lengths.
- Selection snapshot and route tooling wired to synthesis/navigation workflows.

## V1 Scope

- Connector management with cavity occupancy constraints.
- Splice management with port occupancy constraints.
- Routing network with weighted segments (`lengthMm`).
- Automatic shortest-path wire routing (Dijkstra).
- Deterministic tie-break (fewer segments, then stable ordering).
- Forced route lock/reset for wires.
- Automatic wire length recomputation when segment lengths change.
- Global network + connector/splice synthesis views.
- Local persistence with schema versioning.

## Repository Structure

```text
logics/
  architecture/   # technical reference architecture and decisions
  request/        # product needs and context
  backlog/        # scoped items with acceptance criteria
  tasks/          # execution orchestration and validation plans
  skills/         # Logics kit (scripts + guides, imported as submodule)
```

## Prerequisites

- `python3`
- `git`
- `node` 20+ (target runtime for implementation phase)

## Working with Logics

Bootstrap or maintain the Logics workflow:

```bash
python3 logics/skills/logics-bootstrapper/scripts/logics_bootstrap.py
python3 logics/skills/logics-doc-linter/scripts/logics_lint.py
```

Create and promote documents:

```bash
python3 logics/skills/logics-flow-manager/scripts/logics_flow.py new request --title "My need"
python3 logics/skills/logics-flow-manager/scripts/logics_flow.py new backlog --title "My need"
python3 logics/skills/logics-flow-manager/scripts/logics_flow.py new task --title "Implement my need"
python3 logics/skills/logics-flow-manager/scripts/logics_flow.py promote request-to-backlog logics/request/req_001_my_need.md
python3 logics/skills/logics-flow-manager/scripts/logics_flow.py promote backlog-to-task logics/backlog/item_001_my_need.md
```

## Delivery Waves (V1)

- Wave 1: `item_000` to `item_004` (foundation + routing engine).
- Wave 2: `item_005` to `item_007` (wire lifecycle + views + persistence).
- Wave 3: `item_008` (validation matrix and AC1..AC6 automated coverage).

## Validation Baseline

Current orchestration task references:

```bash
python3 logics/skills/logics-doc-linter/scripts/logics_lint.py
npm run lint
npm run typecheck
npm run test:ci
npm run test:e2e
```

Note: npm-based checks are target validation gates for the upcoming application implementation phase.

## Key References

- `logics/request/req_000_kickoff_v1_electrical_plan_editor.md`
- `logics/architecture/target_reference_v1_frontend_local_first.md`
- `logics/tasks/task_000_v1_backlog_orchestration_and_delivery_control.md`
