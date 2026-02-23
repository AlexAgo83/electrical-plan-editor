## req_036_node_id_editability_via_atomic_node_rename_and_reference_remap - Node ID Editability via Atomic Node Rename and Reference Remap
> From version: 0.7.3
> Understanding: 99%
> Confidence: 97%
> Complexity: High
> Theme: Safe Node Identifier Editability with Store-Level Referential Integrity
> Reminder: Update Understanding/Confidence and dependencies/references when you edit this doc.

# Needs
- Allow editing `Node ID` in the Node form while in edit mode.
- Preserve graph integrity when a node ID changes (no broken segment endpoints, layout positions, or selection references).
- Keep undo/redo behavior predictable by treating node ID rename as a single logical domain action.
- Avoid a broad domain-model refactor (no immediate migration to immutable internal node IDs + separate editable technical IDs).

# Context
`node.id` is currently used as the primary identifier across the app state and graph-related logic:
- `nodes.byId` / `nodes.allIds`
- `segments.nodeA` / `segments.nodeB`
- `nodePositions`
- `ui.selected` when a node is selected

The Node form currently blocks `Node ID` editing in UI (`Node ID is immutable in edit mode`) and `useNodeHandlers` ignores the edited input while in edit mode, forcing `editingNodeId`.

This request introduces safe `Node ID` editability without destabilizing existing reducers, history behavior, and graph validation by implementing a dedicated atomic `node/rename` action in the store.

## Implementation decisions (confirmed)
- `Node ID` editability means a real rename of `node.id` (primary identifier), not an alias field and not a display-only label change.
- Collision/validation errors during rename must be user-visible in the Node form (`inline` error UX) while keeping store-level error guards (`ui.lastError`) intact.
- Local UI states holding raw node IDs outside the store (e.g. route preview start/end node selections) should be remapped automatically to the renamed ID to preserve user context.
- Scope is intentionally limited to `nodeId` editability only for this request (no connector/splice/segment/wire ID rename support).

## Objectives
- Make `Node ID` editable in the Node edit form.
- Implement a store-level atomic node rename flow that updates all state references in one reducer action.
- Preserve existing validation rules for node kind/link constraints and segment/wire graph consistency.
- Maintain deterministic `allIds` ordering and stable undo/redo semantics.
- Add regression coverage for rename integrity and collision handling.

## Functional Scope
### A. Store action and reducer support for atomic node rename (high priority)
- Add a dedicated domain action (recommended: `node/rename`) with payload containing:
  - `fromId`
  - `toId`
- Handle the action in `nodeReducer` (or equivalent store reducer module) as a single atomic state transition.
- Reducer behavior requirements:
  - validate `fromId` exists
  - trim and validate `toId` is non-empty
  - reject rename when `toId` already exists (unless same as `fromId`, treated as no-op)
  - move the node entity from `fromId` to `toId` and update the entity's `id`
  - remap every segment endpoint (`nodeA`, `nodeB`) referencing `fromId`
  - move `nodePositions[fromId]` to `nodePositions[toId]` when present
  - remap `ui.selected` when selected node matches `fromId`
  - keep deterministic `nodes.allIds` ordering after rename
  - bump revision exactly once

### B. App reducer routing / domain finalization wiring (high priority)
- Wire `node/rename` into the root app reducer switch with the same domain finalization path as other node actions.
- Ensure the existing network-scoped synchronization flow still applies after rename (same treatment as `node/upsert` / `node/remove`).

### C. Node form UI editability in edit mode (high priority)
- Enable the `Node ID` input in `Edit Node` mode.
- Replace the current immutable helper text with copy explaining rename behavior and constraints (uniqueness / referenced graph update).
- Preserve current create-mode behavior (suggested ID, required input, duplicate check).

### D. Node form submit orchestration for rename + upsert (high priority)
- Update `useNodeHandlers` submit logic so edit mode can:
  - detect `Node ID` change (`editingNodeId` vs trimmed `nodeIdInput`)
  - dispatch atomic `node/rename` before the node content update (`node/upsert`) when needed
  - continue to support kind/label/link updates in the same edit submit flow
- Post-submit UI state requirements:
  - update local `editingNodeId` to the renamed ID on success
  - keep node selection focused on the renamed node
  - keep form mode behavior coherent with existing create/edit transitions
- Error handling:
  - surface reducer collision/validation failures in Node form inline error UX
  - keep existing global store error guard behavior (`ui.lastError`) as reducer-level source of truth / fallback

### E. Local UI states that store node IDs (medium-high priority)
- Audit and handle local UI states that may hold raw node IDs outside store state (for example route preview start/end node selection).
- Required behavior:
  - remap renamed IDs to preserve user context (recommended and confirmed for this request)
- If a remap cannot be applied safely for a specific local UI state, the implementation must document the exception and use an explicit safe reset with regression coverage.

### F. Regression tests for reducer and UI behavior (high priority)
- Add reducer tests covering atomic node rename integrity:
  - successful rename updates node entity key and `id`
  - segment endpoint remap
  - node position remap
  - selected node remap
  - duplicate target ID rejection
  - no-op rename (`fromId === toId`) safety
- Add UI/handler regression coverage for Node form edit mode rename path (minimum targeted test scope, depending on architecture touched).

## Non-functional requirements
- Preserve referential integrity of graph state during rename (no intermediate invalid state exposed through multi-action sequences).
- Keep history semantics predictable (rename should be one logical undoable domain change, not multiple fragmented history entries).
- Avoid changes to persistence schema format unless strictly necessary.
- Keep implementation localized to existing store/UI architecture patterns.

## Validation and regression safety
- Targeted tests (minimum, depending on implementation):
  - `src/tests/store.reducer.entities.spec.ts` (node rename integrity / collision)
  - Node form edit-mode submit regression test(s) in relevant UI spec files (including inline error behavior on collision/failure)
  - Local UI node-ID state remap regression coverage where practical (at minimum route preview state if touched)
- Closure validation (recommended):
  - `python3 logics/skills/logics-doc-linter/scripts/logics_lint.py`
  - `npm run lint`
  - `npm run typecheck`
  - `npm run test:ci`
  - `npm run build`

## Acceptance criteria
- AC1: The Node form allows editing `Node ID` while in `Edit Node` mode.
- AC2: Submitting a node edit with a changed `Node ID` performs a safe rename without breaking segment endpoint references.
- AC3: Node layout position (`nodePositions`) is preserved across node ID rename.
- AC4: If the renamed node is selected, selection follows the new node ID after rename.
- AC5: Renaming to an existing node ID is rejected with a user-visible error and no partial state updates.
- AC5a: The user-visible error is surfaced in the Node form inline error area (while reducer/store global error guards remain intact).
- AC6: Node rename is implemented as a single atomic store action (no intermediate multi-dispatch graph breakage).
- AC7: Undo/redo treats node rename as one logical change in history.
- AC8: Local UI states that store node IDs (at minimum route preview start/end selections if active) are remapped to the new node ID or explicitly/reset safely with documented rationale.
- AC9: Reducer and UI regression tests cover successful rename, local-state remap behavior, and collision/failure paths.

## Out of scope
- Refactoring the node domain model to introduce a permanent immutable internal node identifier plus separate editable node technical ID.
- Renaming IDs for connectors, splices, segments, or wires as part of this request (scope remains `nodeId` only).
- Persistence schema migration solely for this feature, unless implementation proves it is required.

# Backlog
- `logics/backlog/item_220_atomic_node_rename_store_action_and_reducer_reference_remap_for_node_ids.md`
- `logics/backlog/item_221_node_edit_form_enables_node_id_input_and_rename_submit_orchestration.md`
- `logics/backlog/item_222_local_ui_node_id_state_sync_or_safe_reset_after_node_rename.md`
- `logics/backlog/item_223_node_id_rename_regression_tests_for_reducer_and_ui_edit_mode_flow.md`
- `logics/backlog/item_224_req_036_node_id_editability_closure_ci_build_and_ac_traceability.md`

# References
- `src/app/components/workspace/ModelingNodeFormPanel.tsx`
- `src/app/hooks/useNodeHandlers.ts`
- `src/store/actions.ts`
- `src/store/reducer.ts`
- `src/store/reducer/nodeReducer.ts`
- `src/store/reducer/segmentReducer.ts`
- `src/store/reducer/layoutReducer.ts`
- `src/store/types.ts`
- `src/tests/store.reducer.entities.spec.ts`
- `src/app/components/network-summary/NetworkRoutePreviewPanel.tsx`
- `src/app/hooks/useAppControllerCanvasDisplayState.ts`
