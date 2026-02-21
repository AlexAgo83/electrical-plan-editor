## item_019_multi_network_test_matrix_and_regression_coverage - Multi-Network Test Matrix and Regression Coverage
> From version: 0.1.0
> Understanding: 99%
> Confidence: 96%
> Progress: 0%
> Complexity: Medium
> Theme: Quality Assurance
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
Multi-network behavior introduces state partitioning, migration, and lifecycle edge cases. Without explicit regression coverage, changes can silently reintroduce cross-network leaks and data-loss bugs.

# Scope
- In:
  - Extend unit/integration tests for network ownership, active-scope selectors, and lifecycle reducers.
  - Add migration tests for legacy single-network snapshots.
  - Add E2E scenarios for create/switch/duplicate/delete network workflows.
  - Build AC traceability for AC1..AC7 from request `req_002`.
- Out:
  - Performance benchmarking framework.
  - Visual diff testing infrastructure.

# Acceptance criteria
- Tests cover multi-network create/switch/edit isolation and no cross-network data leakage.
- Migration tests validate single-network to multi-network conversion and active network restoration.
- E2E covers deterministic fallback on active network deletion.
- CI pipeline passes with updated coverage and no regression on prior routing/occupancy guarantees.

# Priority
- Impact: Very high (release confidence and regression protection).
- Urgency: High before closing orchestration task.

# Notes
- Dependencies: item_014, item_016, item_017, item_018.
- Related AC: AC1, AC2, AC3, AC4, AC5, AC6, AC7.
- References:
  - `logics/request/req_002_multi_network_management_and_navigation.md`
  - `.github/workflows/ci.yml`
  - `src/tests/store.reducer.spec.ts`
  - `src/tests/app.ui.spec.tsx`
  - `tests/e2e/smoke.spec.ts`

