## item_228_wire_endpoint_occupancy_and_prefill_regression_tests - Wire Endpoint Occupancy and Prefill Regression Tests
> From version: 0.7.3
> Understanding: 98%
> Confidence: 96%
> Progress: 0%
> Complexity: Medium
> Theme: Regression Coverage for Wire Endpoint Occupancy Indicators and Create-Prefill Guards
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
Wire endpoint occupancy indication and create-mode prefill touch interactive form behavior (A/B endpoint symmetry, edit-mode exclusion, touched guards). Without targeted regression tests, future form changes can reintroduce silent overwrites or false occupancy warnings.

# Scope
- In:
  - Add UI regression tests for wire form endpoint occupancy indicator:
    - occupied endpoint indication before submit
    - edit-mode occupancy indication with current-wire exclusion (no false positive)
  - Add UI regression tests for create-mode next-free slot prefill:
    - connector `way` prefill
    - splice `port` prefill
    - no-available-slot messaging/safe state
  - Add UI regression tests for manual-edit guard behavior:
    - manual index edit not overwritten in same endpoint context
    - touched-guard reset after endpoint type/target change
    - A/B endpoint symmetry where practical
  - Add unit tests for extracted slot-helper functions if introduced.
- Out:
  - Full E2E coverage for all wire-routing scenarios.
  - Large test harness refactors unrelated to this feature.

# Acceptance criteria
- Regression tests cover create-mode prefill, occupancy indicator behavior, edit-mode exclusion path, and manual-input preservation.
- Test coverage includes no-available-slot handling.
- Helper tests exist for shared next-free slot logic if helper extraction is implemented.

# Priority
- Impact: High.
- Urgency: High.

# Notes
- Dependencies: `req_037`, item_227, item_225, item_226.
- Blocks: item_229.
- Related AC: AC1, AC2, AC3, AC4, AC4a, AC5a, AC6.
- References:
  - `logics/request/req_037_wire_creation_endpoint_occupancy_validation_and_next_free_way_port_prefill.md`
  - `src/tests/app.ui.navigation-canvas.spec.tsx`
  - `src/tests/app.ui.creation-flow-ergonomics.spec.tsx`
  - `src/tests/store.reducer.entities.spec.ts`
  - `src/app/components/workspace/ModelingWireFormPanel.tsx`
  - `src/app/hooks/useWireHandlers.ts`

