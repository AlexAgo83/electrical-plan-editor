## req_002_multi_network_traceability - Acceptance Criteria Traceability
> Request: `req_002_multi_network_management_and_navigation`
> Last updated: 2026-02-21

# Traceability Matrix
- AC1: Users can create at least two networks and switch without leakage.
  - Evidence:
    - `src/store/actions.ts`
    - `src/store/reducer/networkReducer.ts`
    - `src/app/App.tsx`
    - `src/tests/store.reducer.networks.spec.ts`
    - `src/tests/app.ui.networks.spec.tsx`

- AC2: Editing entities in network A never changes network B.
  - Evidence:
    - `src/store/networking.ts`
    - `src/store/reducer.ts`
    - `src/tests/store.reducer.networks.spec.ts`

- AC3: Routing and occupancy remain active-network scoped.
  - Evidence:
    - `src/store/reducer/wireReducer.ts`
    - `src/store/reducer/segmentReducer.ts`
    - `src/store/networking.ts`
    - `src/tests/store.reducer.wires.spec.ts`

- AC4: Active-network deletion applies deterministic fallback.
  - Evidence:
    - `src/store/networking.ts` (`buildNetworkDeletionFallback`)
    - `src/store/reducer/networkReducer.ts`
    - `src/tests/store.reducer.networks.spec.ts`

- AC5: Legacy single-network payload migrates safely to multi-network.
  - Evidence:
    - `src/adapters/persistence/migrations.ts`
    - `src/tests/persistence.localStorage.spec.ts`
    - `src/tests/sample-network.compat.spec.ts`

- AC6: Reload restores previously active network when still present.
  - Evidence:
    - `src/adapters/persistence/localStorage.ts`
    - `src/adapters/persistence/migrations.ts`
    - `src/tests/persistence.localStorage.spec.ts`

- AC7: Validation and UI scope remain isolated to active network.
  - Evidence:
    - `src/store/selectors.ts`
    - `src/app/App.tsx`
    - `src/tests/app.ui.networks.spec.tsx`
