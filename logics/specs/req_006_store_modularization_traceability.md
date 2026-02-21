## req_006_store_modularization_traceability - Acceptance Criteria Traceability
> Request: `req_006_large_store_files_split_and_reducer_modularization`
> Last updated: 2026-02-21

# Traceability Matrix
- AC1: Reducer responsibilities are split into modular files with a stable composed entry point.
  - Evidence:
    - `src/store/reducer.ts`
    - `src/store/reducer/connectorReducer.ts`
    - `src/store/reducer/spliceReducer.ts`
    - `src/store/reducer/nodeReducer.ts`
    - `src/store/reducer/segmentReducer.ts`
    - `src/store/reducer/wireReducer.ts`
    - `src/store/reducer/uiReducer.ts`

- AC2: Existing domain invariants remain unchanged (occupancy, routing, lock semantics, integrity checks).
  - Evidence:
    - `src/tests/store.reducer.entities.spec.ts`
    - `src/tests/store.reducer.wires.spec.ts`
    - `src/tests/persistence.localStorage.spec.ts`

- AC3: Extracted pure helpers are covered by targeted tests.
  - Evidence:
    - `src/store/reducer/helpers/occupancy.ts`
    - `src/store/reducer/helpers/wireTransitions.ts`
    - `src/tests/store.reducer.helpers.spec.ts`

- AC4: Store reducer tests are split by concern.
  - Evidence:
    - `src/tests/store.reducer.entities.spec.ts`
    - `src/tests/store.reducer.wires.spec.ts`
    - `src/tests/store.reducer.helpers.spec.ts`
    - `src/tests/store.create-store.spec.ts`

- AC5: No scoped store file remains above 500 lines without exception.
  - Evidence:
    - `scripts/quality/check-store-modularization.mjs`
    - `npm run quality:store-modularization`

- AC6: Lint/typecheck/unit/e2e gates pass after modularization.
  - Evidence commands:
    - `npm run lint`
    - `npm run typecheck`
    - `npm run quality:store-modularization`
    - `npm run test:ci`
    - `npm run test:e2e`
  - CI enforcement:
    - `.github/workflows/ci.yml`
