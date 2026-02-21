## item_038_store_reducer_test_suite_modularization - Store Reducer Test Suite Modularization
> From version: 0.1.0
> Understanding: 99%
> Confidence: 96%
> Progress: 100%
> Complexity: Medium
> Theme: Test Architecture
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
`src/tests/store.reducer.spec.ts` aggregates many concerns in one file, making failures harder to triage and slowing focused test evolution.

# Scope
- In:
  - Split reducer tests by concern (entity lifecycle, occupancy, wire routing/lock, integrity guards).
  - Extract reusable fixtures/builders for baseline states and action sequences.
  - Align tests with new reducer module boundaries.
  - Maintain current behavior coverage.
- Out:
  - E2E scenario redesign.
  - Non-reducer test architecture changes outside scope.

# Acceptance criteria
- Reducer tests are organized into focused modules with shared test utilities.
- Existing critical scenarios remain covered after split.
- Failures are easier to map to a domain concern.
- CI test execution remains stable.

# Priority
- Impact: High (quality and maintainability).
- Urgency: High after reducer split.

# Notes
- Dependencies: item_037.
- Blocks: item_039.
- Related AC: AC3, AC4.
- References:
  - `logics/request/req_006_large_store_files_split_and_reducer_modularization.md`
  - `src/tests/store.reducer.spec.ts`
  - `src/store/reducer.ts`

