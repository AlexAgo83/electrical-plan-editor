## req_066_global_undo_redo_history_for_modeling_and_catalog_mutations - Global undo/redo history for modeling and catalog mutations
> From version: 0.9.8
> Understanding: 97% (user asks for a new `logics` request for an `Undo / Redo` feature; V1 is framed as global history for workspace modeling and catalog mutations)
> Confidence: 93% (high value but broader cross-cutting scope; needs careful state-boundary and history-grouping decisions during implementation)
> Complexity: High
> Theme: Editing safety / productivity / mutation history ergonomics
> Reminder: Update Understanding/Confidence and dependencies/references when you edit this doc.

# Needs
- Users need a fast and reliable way to revert mistakes while editing the workspace.
- Current workflows (modeling, catalog edits, deletes, swaps, imports) require manual recovery when a change is incorrect.
- A global `Undo / Redo` feature would materially improve confidence and speed during iterative editing.

# Context
The app already supports many mutating workflows across a shared workspace state, including:
- modeling entities (nodes/connectors/splices/segments/wires)
- catalog item management
- sample recreation/import-like operations
- edit/save/cancel flows in forms

As the feature set grows (pricing settings, catalog CSV import/export, endpoint/node swap actions), lack of undo/redo increases recovery cost and regression risk for editing ergonomics.

# Objective
- Introduce a V1 global undo/redo capability for workspace mutations with deterministic behavior and clear scope boundaries.
- Support both UI actions and keyboard shortcuts for common undo/redo workflows.
- Preserve existing save/cancel semantics while adding mutation-history recovery.

# Functional scope
## A. History stack contract (high priority)
- Add a workspace history mechanism supporting:
  - `undo`
  - `redo`
- V1 should track mutating changes to the workspace data model, including at minimum:
  - modeling entity create/edit/delete actions (nodes/connectors/splices/segments/wires)
  - catalog item create/edit/delete actions
  - catalog bulk mutations introduced by CSV import (when req_062 is implemented)
  - sample-recreation actions that replace/mutate workspace content
- History behavior must be deterministic:
  - undo steps revert the latest applied mutation snapshot/action
  - redo reapplies the reverted step
  - performing a new mutation after undo clears the redo stack

## B. Scope boundaries and exclusions (high priority)
- V1 undo/redo is for workspace/domain mutations only.
- Explicitly out of V1 history scope:
  - UI preferences (`theme`, `currency`, tax settings, etc.)
  - panel visibility / screen navigation
  - selection-only state
  - zoom/pan/canvas viewport-only state
  - transient modal open/close state
- `Save`/`Cancel edit` flows remain functional and should compose safely with undo/redo (no semantic replacement of form-local cancel behavior).

## C. UI actions and shortcuts (high priority)
- Add visible `Undo` / `Redo` actions in the UI (placement to be finalized during implementation based on existing workspace action patterns).
- Buttons must expose disabled states when no undo/redo step is available.
- Add keyboard shortcuts (V1):
  - `Cmd/Ctrl+Z` => Undo
  - `Shift+Cmd/Ctrl+Z` => Redo
  - optional alias support for `Ctrl+Y` => Redo (recommended for Windows ergonomics)
- Shortcuts should not fire while typing in text inputs/textareas/contenteditable fields unless explicitly intended and safe.

## D. History grouping and reset policies (medium-high priority)
- Define clear V1 grouping behavior:
  - single user-triggered mutations should create one history step
  - bulk operations (ex: catalog CSV import, sample recreation) should be recorded atomically as one undoable step
- Define reset/initialization behavior:
  - history may reset when loading/replacing the entire workspace/session (V1 recommended)
  - history is not required to persist across browser reloads in V1
- Avoid no-op history entries when a mutation results in no effective state change.

## E. UX feedback and semantics (medium priority)
- Undo/redo actions should be discoverable and keyboard-friendly.
- Optional V1 enhancement (recommended if low-cost):
  - tooltip labels with shortcut hints (`Undo (Ctrl/Cmd+Z)`, `Redo (Shift+Ctrl/Cmd+Z)`)
- Action semantics must remain predictable across recent features:
  - swap endpoint/node actions should be undoable after save/apply mutation
  - catalog import (req_062) should be undoable atomically when implemented

## F. Regression coverage (high priority)
- Add regression coverage for:
  - undo/redo button enabled/disabled states
  - keyboard shortcut behavior
  - redo stack clearing after new mutation post-undo
  - representative create/edit/delete mutation undo/redo flows
  - bulk mutation atomic undo (sample recreation and/or catalog import once available)
  - non-domain UI state exclusion (undo should not affect theme/panel-only changes)

# Non-functional requirements
- Undo/redo must be deterministic and performant for normal editing workloads.
- History implementation should minimize accidental coupling with transient UI state.
- V1 may use snapshot-based history if simpler/safer than fine-grained reversible commands.

# Validation and regression safety
- Add/extend tests for undo/redo across representative domains and shortcut interactions.
- Run full validation pipeline after implementation (`lint`, `typecheck`, `quality:*`, `build`, `test:ci`, `test:e2e`, `logics_lint`).

# Acceptance criteria
- AC1: Users can trigger global `Undo` and `Redo` for supported workspace mutations via visible UI actions.
- AC2: Keyboard shortcuts (`Cmd/Ctrl+Z`, `Shift+Cmd/Ctrl+Z`, and optionally `Ctrl+Y`) perform undo/redo correctly.
- AC3: Undo/redo applies to representative modeling and catalog mutations without corrupting workspace state.
- AC4: Redo stack clears when a new mutation occurs after one or more undo operations.
- AC5: Bulk mutations covered in V1 are undoable atomically as a single step.
- AC6: UI-only state (theme/preferences/navigation/selection/viewport) is not affected by undo/redo in V1.
- AC7: Existing form `Save`/`Cancel edit` semantics remain non-regressed.

# Out of scope
- Persisting undo/redo history across page reloads or app restarts.
- Visual timeline/history browser UI.
- Per-entity custom reversible command descriptions (human-readable history labels) in V1.
- Collaborative/multi-user undo semantics.

# Backlog
- `logics/backlog/item_361_workspace_history_snapshot_contract_and_domain_mutation_tracking_for_undo_redo.md`
- `logics/backlog/item_362_undo_redo_ui_actions_shortcuts_and_input_focus_guard_integration.md`
- `logics/backlog/item_363_undo_redo_history_grouping_no_op_filtering_and_reset_boundaries.md`
- `logics/backlog/item_364_regression_coverage_for_global_undo_redo_mutations_shortcuts_and_scope_exclusions.md`

# Orchestration task
- `logics/tasks/task_063_req_066_global_undo_redo_history_orchestration_and_delivery_control.md`

# References
- `src/app/AppController.tsx`
- `src/store/index.ts`
- `src/app/hooks/useWorkspaceHandlers.ts`
- `src/tests/app.ui.creation-flow-ergonomics.spec.tsx`
- `src/tests/app.ui.navigation-canvas.spec.tsx`
- `logics/request/req_062_catalog_csv_import_export_actions_and_round_trip_support.md`
- `logics/request/req_063_wire_edit_swap_endpoint_a_b_action_between_save_and_cancel.md`
- `logics/request/req_064_segment_edit_swap_node_a_b_action_between_save_and_cancel.md`

