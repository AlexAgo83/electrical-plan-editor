## req_113_technical_debt_hardening_persistence_safety_performance_and_architecture_quality - Technical debt hardening: persistence safety, performance, and architecture quality
> From version: 1.4.4
> Schema version: 1.0
> Status: Draft
> Understanding: 97% (all 12 issues sourced from a systematic audit of the live codebase at v1.4.4 — root causes are confirmed, fixes are scoped conservatively)
> Confidence: 92% (persistence and pathfinding fixes are well-bounded; architecture refactors carry higher delivery risk and are explicitly scoped to safe increments)
> Complexity: High
> Theme: Technical hardening / persistence safety / runtime performance / architecture quality
> Reminder: Update status/understanding/confidence and references when you edit this doc.

# Needs
- The application exposes a set of structural risks that have no visible user-facing symptoms today but can cause silent data loss, UI freezes, or hard-to-debug regressions as the network size and user base grow.
- A systematic audit at v1.4.4 identified 12 concrete issues across four categories: persistence safety (critical), performance (high), architecture quality (high), and robustness/testing (medium).
- These issues must be addressed before they escalate into production incidents or block future feature development.

# Context
The audit was performed against v1.4.4 (req_091 baseline). The product is stable and feature-complete for current use cases, but the following structural gaps have been identified:

**Category 1 — Persistence safety (critical):**
The persistence layer handles user data exclusively through localStorage. Any unhandled parsing error or failed migration will result in silent data loss or a boot crash with no recovery path offered to the user. There is also no storage quota awareness, meaning large networks can silently fail to persist.

**Category 2 — Performance (high):**
The Dijkstra pathfinding implementation uses `Array.sort()` inside the main loop, making it O(E² log E) instead of the expected O(E log E). The routing graph is also reconstructed from scratch on every selector call, with no structural memoization. Both issues become visible as UI freezes on networks with 50+ nodes.

**Category 3 — Architecture quality (high):**
`AppController.tsx` has grown to 1 099 lines and acts as a God Component, accumulating 50+ hook calls and passing 100+ props through 4+ levels without memoization. The store also maintains a structural duplication between root-level entity state and `networkStates[NetworkId]`, kept in sync by a manual `syncCurrentScopeToNetworkMap()` call that is easy to miss in new reducers.

**Category 4 — Robustness and testing (medium):**
The 50+ controller hooks are tested only via UI integration tests and have no dedicated unit specs. The `migrations.ts` file (26 KB, critical path for all existing users) has no dedicated test file. Occupancy map writes are not universally guarded by the existing `isValidSlotIndex()` helper. The canvas viewport state lives outside the Redux store, making it invisible to the undo/redo history. Error reporting is limited to a single `ui.lastError: string | null` field with no structured context.

```mermaid
%% logics-kind: request
%% logics-signature: request|technical-debt-hardening-persistence-saf|the-application-exposes-a-set-of|ac1-a-corrupted-or-unparseable-localstor
flowchart TD
    Audit[v1.4.4 codebase audit] --> P1[Persistence safety]
    Audit --> P2[Performance]
    Audit --> P3[Architecture quality]
    Audit --> P4[Robustness and testing]

    P1 --> P1a[Unsafe JSON.parse on boot]
    P1 --> P1b[Migrations without rollback]
    P1 --> P1c[No localStorage quota check]

    P2 --> P2a[Pathfinding O(E² log E) queue.sort]
    P2 --> P2b[Graph rebuilt every render]

    P3 --> P3a[AppController God Component]
    P3 --> P3b[Duplicate global vs network state]

    P4 --> P4a[No hook unit tests]
    P4 --> P4b[No migration spec]
    P4 --> P4c[Occupancy index not guarded]
    P4 --> P4d[Canvas state outside store]
    P4 --> P4e[Monolithic error type]
```

# Objective
- Eliminate the three critical persistence risks that can cause silent data loss or boot crashes.
- Bring pathfinding and graph computation to the expected algorithmic complexity.
- Begin a safe, incremental refactor of `AppController.tsx` without breaking the existing test suite.
- Close the structural sync risk between global and network-scoped entity state.
- Raise the robustness floor: hook unit tests, migration spec, occupancy guards, structured errors.
- Integrate canvas viewport into the undo/redo history.

# Default decisions (V1)
- All 12 items are in scope for this request. Delivery may be staged across multiple tasks but all items belong to a single logical hardening wave.
- Persistence fixes (issues 1–3) are highest priority and should be delivered first.
- Pathfinding and graph memoization fixes (issues 4–5) are second priority.
- Architecture refactors (issues 6–7) must be delivered in safe, non-breaking increments validated by the full test suite at each step.
- Robustness items (issues 8–12) are medium priority and can be interleaved with the above.

# Functional scope

## A. Persistence safety (critical)

### A1 — Safe JSON.parse wrapper
- All `JSON.parse()` calls in the persistence layer must be wrapped in a typed `parseJsonSafe<T>()` utility that catches `SyntaxError` and returns a typed `Result<T, ParseError>`.
- On parse failure at boot, the app must display an explicit recovery UI (not a blank screen) with the option to reset to a clean state.
- Affected files: `src/adapters/persistence/localStorage.ts`, `src/adapters/persistence/migrations.ts`, `src/adapters/persistence/recentChanges.ts`.

### A2 — Migration rollback on failure
- Before any migration is applied, the current raw localStorage value must be written to a dated backup key (e.g., `APP_STATE_BACKUP_PRE_MIGRATION_vN`).
- If a migration step throws or returns an invalid state, the system must restore from the backup and present the user with an explicit error message rather than silently falling through to sample data.
- The backup key must be cleaned up after a successful migration.
- Affected file: `src/adapters/persistence/migrations.ts`.

### A3 — localStorage quota awareness
- Before each write, the adapter must estimate the size of the serialized payload and compare it to the available quota using `navigator.storage.estimate()` where available.
- If the estimated payload exceeds 80% of remaining quota, a non-blocking warning toast must be shown.
- If the write throws a `QuotaExceededError`, the error must be caught and surfaced to the user with a clear explanation, not silently swallowed.
- Affected file: `src/adapters/persistence/localStorage.ts`.

## B. Performance (high)

### B1 — Replace queue.sort() with a min-heap in pathfinding
- The Dijkstra implementation in `src/core/pathfinding.ts` must replace the `queue.sort(compareCandidates)` call inside the main loop with a `MinHeap<Candidate>` priority queue.
- The heap must preserve the existing deterministic tie-breaking semantics (`compareSegmentIdArrays`) so that route outputs remain identical for identical inputs.
- The existing `core.pathfinding.spec.ts` tests must pass without modification after the change.
- Affected file: `src/core/pathfinding.ts`. New file: `src/core/minHeap.ts` (or co-located utility).

### B2 — Memoize graph construction
- `buildRoutingGraphIndex()` in `src/core/graph.ts` must not be called more than once per unique `(segments, nodePositions)` combination within a render cycle.
- The selector `selectRoutingGraphIndex` in `src/store/selectors.ts` must use structural memoization (e.g., `createSelector` with stable input references) so that graph reconstruction is skipped when the relevant slices of state have not changed.
- Affected files: `src/store/selectors.ts`, `src/core/graph.ts`.

## C. Architecture quality (high)

### C1 — Begin AppController decomposition
- `src/app/AppController.tsx` must be refactored in at least two safe increments:
  1. Extract Context providers for the most-shared cross-cutting concerns (at minimum: store dispatch, and the connector, wire, and segment handler namespaces) so that deeply nested components can consume them without prop drilling.
  2. Extract a `ModelingController` sub-component that owns the modeling-screen state assembly, leaving `AppController` as a thin orchestrator.
- Each increment must leave all existing `app.ui.*.spec.tsx` tests passing.
- The derived state objects `selectionEntities`, `forms`, and `canvas` must be wrapped in `useMemo` with correct dependency arrays to prevent unnecessary re-renders.
- Affected file: `src/app/AppController.tsx`. New files as needed under `src/app/`.

### C2 — Resolve global vs. network-scoped state duplication
- The dual-level entity state (root `AppState` + `networkStates[NetworkId]`) and the associated `syncCurrentScopeToNetworkMap()` sync call must be documented with an explicit invariant comment in `src/store/reducer.ts` or a shared contract file.
- Any reducer that performs a domain mutation must be audited to confirm it calls the sync function; missing calls must be added.
- A lint or type-level guard (e.g., a wrapper function that enforces the sync call) is preferred over relying on convention alone.
- Long-term consolidation to a single source of truth is out of scope for V1 of this request but must be tracked as a follow-up.
- Affected files: `src/store/types.ts`, `src/store/reducer.ts`, all domain reducers in `src/store/reducer/`.

## D. Robustness and testing (medium)

### D1 — Unit tests for controller hooks
- At least the following controller hooks must have dedicated unit test files in `src/tests/`:
  - `useAppControllerSelectionHandlersDomainAssembly`
  - `useAppControllerWorkspaceHandlersDomainAssembly`
  - `useAppControllerModelingHandlersAssembly`
  - `useEntityFormsState`
  - `useCanvasState`
- Tests must run in isolation (renderHook with a minimal store provider) and not depend on full UI integration setup.

### D2 — Dedicated migration spec
- A new test file `src/tests/persistence.migrations.spec.ts` must cover:
  - Happy-path migration from each persisted schema version to the current version (v2 → v3, etc.).
  - Corrupt/invalid input at each migration step must not crash the app (error must be caught and handled).
  - Data that survives normalization must preserve all user-authored fields.
- Fixtures for each schema version must be stored as static JSON objects within the spec.

### D3 — Universal occupancy index validation
- All writes to `connectorCavityOccupancy` and `splicePortOccupancy` in the store reducers must call `isValidSlotIndex()` before writing.
- Any write that fails the check must be rejected with a logged warning and must not corrupt the occupancy map.
- A test must verify that out-of-bounds cavity/port indices are silently rejected rather than written.
- Affected files: all reducers in `src/store/reducer/` that write to occupancy maps; `src/store/reducer/shared.ts`.

### D4 — Canvas viewport in undo/redo history
- The canvas viewport state (scale, offset, snap settings) must be persisted to the Redux store rather than living exclusively in local hook state.
- The `useStoreHistory` hook must include canvas viewport snapshots in its history entries so that undo/redo restores both entity state and canvas position together.
- A settings toggle may be provided to disable viewport restoration on undo if the user prefers entity-only undo.
- Affected files: `src/store/types.ts`, `src/app/hooks/useStoreHistory.ts`, relevant canvas hooks.

### D5 — Structured error type
- `ui.lastError: string | null` must be replaced with a structured type: `ui.lastError: AppError | null` where `AppError = { code: string; message: string; context?: Record<string, unknown> }`.
- All reducer branches that currently set `lastError` as a raw string must be updated to produce a typed `AppError`.
- The UI component that displays `lastError` must be updated to render the structured fields (code for debugging, message for the user).
- Affected files: `src/store/types.ts`, all reducers in `src/store/reducer/`, the error display component in `src/app/`.

# Non-functional requirements
- All existing tests must continue to pass after each individual fix is merged.
- Persistence changes must not alter the on-disk schema version unless a schema migration is explicitly added.
- Performance improvements must not change the observable output of pathfinding for any input the existing test suite covers.
- Architecture refactors must be incremental: no single PR should break more than one screen's UI integration test at a time.

# Validation and regression safety
- Run after each category of fixes:
  - `npm run -s lint`
  - `npm run -s typecheck`
  - `npm run -s test:ci`
  - `npm run -s build`
- Run full E2E suite after the complete wave:
  - `npx playwright test`
- Specific regression checks:
  - Persistence: verify boot with a deliberately corrupted localStorage value → recovery UI shown, no crash.
  - Pathfinding: run `core.pathfinding.spec.ts` and confirm outputs are byte-identical before and after the min-heap change.
  - Architecture: run all `app.ui.*.spec.tsx` tests after each AppController increment.

# Acceptance criteria
- AC1: A corrupted or unparseable localStorage value at boot shows a recovery UI instead of a blank screen or unhandled exception.
- AC2: A failed migration step restores the pre-migration backup and shows an explicit error to the user; user data is not silently replaced by sample data.
- AC3: A localStorage write that would exceed the quota is caught, surfaced to the user with a clear message, and does not produce an unhandled `QuotaExceededError`.
- AC4: The pathfinding algorithm uses a min-heap priority queue; `core.pathfinding.spec.ts` passes without modification and produces identical outputs for all existing test inputs.
- AC5: `selectRoutingGraphIndex` does not call `buildRoutingGraphIndex()` more than once per render cycle when `segments` and `nodePositions` have not changed.
- AC6: `AppController.tsx` exposes Context providers for store dispatch and the main handler namespaces; at least one deeply nested consumer is updated to use them instead of props.
- AC6b: `selectionEntities`, `forms`, and `canvas` objects in `AppController.tsx` are wrapped in `useMemo` with correct dependency arrays.
- AC7: Every domain reducer that mutates entity state calls `syncCurrentScopeToNetworkMap()` (or a type-enforced equivalent); the audit list is documented in the implementation.
- AC8: Unit tests exist for the five listed controller hooks and run in isolation without full UI setup.
- AC9: `persistence.migrations.spec.ts` exists and covers happy-path migration from each persisted schema version and corrupt-input handling at each step.
- AC10: All writes to `connectorCavityOccupancy` and `splicePortOccupancy` are guarded by `isValidSlotIndex()`; out-of-bounds writes are rejected without corrupting the map.
- AC11: Canvas viewport state is stored in Redux and restored by undo/redo alongside entity state.
- AC12: `ui.lastError` is typed as `AppError | null`; all existing raw-string error assignments are updated; the error display component renders the structured fields.

# Out of scope
- Full consolidation of global vs. network-scoped state to a single representation (tracked as follow-up).
- Cloud sync, multi-user, or cross-device persistence.
- New product features; this request is exclusively a hardening wave.
- UI redesign of the error display component beyond adapting it to the structured error type.

# Definition of Ready (DoR)
- [x] All 12 audit issues have confirmed root causes in the v1.4.4 codebase.
- [x] Scope boundaries (in/out) are explicit per issue.
- [x] Acceptance criteria are testable and mapped 1:1 to audit issues.
- [x] Delivery priority order is defined.

# Companion docs
- Product brief(s): (none — this is a pure technical hardening request)
- Architecture decision(s): (none yet — C2 follow-up may warrant an ADR)

# AI Context
- Summary: Harden the v1.4.4 codebase across 12 identified structural risks in persistence, performance, architecture, and robustness; no new features.
- Keywords: JSON.parse, migration rollback, localStorage quota, Dijkstra min-heap, graph memoization, AppController refactor, state sync, hook unit tests, migration spec, occupancy validation, canvas undo, structured error
- Use when: Implementing or reviewing any of the 12 audit items; use the AC number to identify the specific sub-issue.
- Skip when: Working on product features unrelated to persistence, pathfinding, store architecture, or error handling.

# Backlog
- `logics/backlog/item_553_safe_json_parse_wrapper_and_boot_recovery_ui_for_corrupted_localstorage.md`
- `logics/backlog/item_554_migration_backup_and_rollback_on_failure_with_explicit_user_feedback.md`
- `logics/backlog/item_555_localstorage_quota_awareness_and_write_failure_surfacing.md`
- `logics/backlog/item_556_replace_pathfinding_queue_sort_with_min_heap_priority_queue.md`
- `logics/backlog/item_557_memoize_routing_graph_construction_in_selector.md`
- `logics/backlog/item_558_appcontroller_decomposition_context_providers_and_derived_state_memoization.md`
- `logics/backlog/item_559_audit_and_enforce_sync_invariant_between_global_and_network_scoped_state.md`
- `logics/backlog/item_560_unit_tests_for_controller_hooks_in_isolation.md`
- `logics/backlog/item_561_dedicated_migration_spec_with_version_fixtures_and_corrupt_input_coverage.md`
- `logics/backlog/item_562_universal_occupancy_index_validation_before_map_writes.md`
- `logics/backlog/item_563_canvas_viewport_state_in_store_and_undo_redo_history_integration.md`
- `logics/backlog/item_564_structured_app_error_type_replacing_monolithic_last_error_string.md`

# Orchestration task
- `logics/tasks/task_091_orchestration_delivery_execution_for_req_113_technical_debt_hardening.md`

# References
- `src/adapters/persistence/localStorage.ts`
- `src/adapters/persistence/migrations.ts`
- `src/adapters/persistence/recentChanges.ts`
- `src/core/pathfinding.ts`
- `src/core/graph.ts`
- `src/store/types.ts`
- `src/store/selectors.ts`
- `src/store/reducer.ts`
- `src/store/reducer/shared.ts`
- `src/store/reducer/connectorReducer.ts`
- `src/store/reducer/spliceReducer.ts`
- `src/store/reducer/wireReducer.ts`
- `src/store/reducer/networkReducer.ts`
- `src/app/AppController.tsx`
- `src/app/hooks/useStoreHistory.ts`
- `src/tests/persistence.localStorage.spec.ts`
- `src/tests/core.pathfinding.spec.ts`
- `src/tests/core.graph.spec.ts`
