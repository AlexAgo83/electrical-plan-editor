## item_223_node_id_rename_regression_tests_for_reducer_and_ui_edit_mode_flow - Node ID Rename Regression Tests for Reducer and UI Edit-Mode Flow
> From version: 0.7.3
> Understanding: 98%
> Confidence: 96%
> Progress: 0%
> Complexity: Medium
> Theme: Regression Safety Net for Atomic Node Rename and UI Rename Flow
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
Node ID rename touches graph referential integrity, form orchestration, and local UI state remap behavior. Without targeted regression tests, future changes can silently reintroduce partial-state or stale-reference bugs.

# Scope
- In:
  - Add reducer tests for `node/rename` success and failure paths:
    - entity key + embedded `id` update
    - segment endpoint remap
    - `nodePositions` remap
    - selected node remap
    - collision rejection
    - no-op safety
  - Add UI/handler regression coverage for Node edit-form rename submit flow:
    - editable `Node ID` in edit mode
    - successful submit applies rename and preserves selection/form coherence
    - collision/failure surfaces inline form error
  - Add targeted coverage for local UI node-ID state remap (at minimum route preview if touched).
- Out:
  - Full end-to-end coverage for all modeling workflows.
  - Large test-suite refactors unrelated to node rename.

# Acceptance criteria
- Reducer regression tests cover atomic rename integrity and collision/no-op paths.
- UI regression tests cover edit-mode rename submit and inline error behavior.
- Local UI remap/reset behavior after rename is covered where implemented.

# Priority
- Impact: High.
- Urgency: High.

# Notes
- Dependencies: `req_036`, item_220, item_221, item_222.
- Blocks: item_224.
- Related AC: AC3, AC4, AC5, AC5a, AC8, AC9.
- References:
  - `logics/request/req_036_node_id_editability_via_atomic_node_rename_and_reference_remap.md`
  - `src/tests/store.reducer.entities.spec.ts`
  - `src/tests/app.ui.navigation-canvas.spec.tsx`
  - `src/tests/app.ui.creation-flow-ergonomics.spec.tsx`
  - `src/app/hooks/useNodeHandlers.ts`
  - `src/app/components/workspace/ModelingNodeFormPanel.tsx`

