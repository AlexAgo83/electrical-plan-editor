## req_006_large_store_files_split_and_reducer_modularization - Large Store Files Split and Reducer Modularization
> From version: 0.1.0
> Understanding: 99%
> Confidence: 97%
> Complexity: High
> Theme: Store Modularization
> Reminder: Update Understanding/Confidence and dependencies/references when you edit this doc.

# Needs
- Split oversized store/reducer files to reduce coupling and make business rules easier to maintain.
- Isolate reducer responsibilities by domain concern while preserving deterministic behavior.
- Split large store test suites to keep fast diagnosis and clearer coverage ownership.

# Context
Current state-management layer includes files above 500 lines:
- `src/store/reducer.ts` (~1070 lines)
- `src/tests/store.reducer.spec.ts` (~531 lines)

The reducer currently aggregates many responsibilities (connectors, splices, nodes, segments, wires, occupancy, route lock, validation-critical invariants) in one file, making reasoning and evolution harder.

Architecture reference to preserve:
- `logics/architecture/target_reference_v1_frontend_local_first.md`

## Objectives
- Decompose reducer logic by bounded concerns with explicit handler modules.
- Extract pure state transition helpers for occupancy, wire lifecycle, and graph-related updates.
- Keep store API contract stable for calling layers.
- Split reducer tests by domain concern with shared fixtures/utilities.

## Functional Scope
### Reducer modularization
- Split `src/store/reducer.ts` into dedicated modules (example grouping):
  - connector/splice lifecycle
  - node/segment lifecycle
  - wire lifecycle and route lock handling
  - occupancy updates and integrity guards
  - shared error/selection/history helpers
- Keep one top-level reducer entry that composes sub-reducers/handlers.
- Preserve existing action types and behavior contract unless explicitly documented.

### Pure helper extraction
- Extract deterministic pure helpers for:
  - endpoint occupancy set/release/validation
  - route recalculation and lock reset flows
  - referential cleanup on entity deletion
- Ensure helpers are unit-testable without React/UI dependencies.

### Test suite split
- Split `src/tests/store.reducer.spec.ts` into focused suites aligned with reducer modules.
- Add shared builders for base states and action sequences.
- Keep scenario coverage for occupancy conflicts, wire routing, lock behavior, and mutation safety.

## Acceptance criteria
- AC1: Reducer responsibilities are split into modular files with a stable composed entry point.
- AC2: Existing domain invariants (occupancy, routing, lock semantics, integrity checks) remain unchanged.
- AC3: Extracted pure helpers are covered by targeted tests.
- AC4: Store reducer tests are split by concern and maintain or improve current clarity/coverage.
- AC5: In targeted store scope, no file remains above 500 lines without explicit justified exception.
- AC6: Lint/typecheck/unit/integration/e2e gates pass after modularization.

## Non-functional requirements
- Deterministic state transitions must remain guaranteed.
- No hidden behavior drift for existing actions.
- Preserve local-first persistence compatibility.

## Out of scope
- New domain features.
- Action contract redesign for external API consumers.
- Performance micro-optimizations not required for split.

# Backlog
- To create from this request:
  - `item_035_reducer_module_boundary_definition_and_composed_entrypoint.md`
  - `item_036_occupancy_and_wire_transition_helper_extraction.md`
  - `item_037_connector_splice_node_segment_handler_split.md`
  - `item_038_store_reducer_test_suite_modularization.md`
  - `item_039_store_modularization_regression_and_quality_gate.md`

# References
- `logics/request/req_000_kickoff_v1_electrical_plan_editor.md`
- `logics/request/req_002_multi_network_management_and_navigation.md`
- `logics/request/req_004_network_import_export_file_workflow.md`
- `logics/tasks/task_005_ui_store_large_file_modularization_orchestration_and_delivery_control.md`
- `src/store/reducer.ts`
- `src/tests/store.reducer.spec.ts`
