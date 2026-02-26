## item_363_undo_redo_history_grouping_no_op_filtering_and_reset_boundaries - Undo/redo history grouping, no-op filtering, and reset boundaries
> From version: 0.9.8
> Understanding: 96%
> Confidence: 91%
> Progress: 0%
> Complexity: High
> Theme: Undo/redo behavior consistency and history hygiene
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
Undo/redo becomes unreliable or noisy without explicit rules for grouping bulk mutations, filtering no-op changes, and resetting history on workspace replacement boundaries.

# Scope
- In:
  - Define V1 grouping policy for single mutations vs bulk operations (sample recreation, catalog CSV import when available).
  - Ensure bulk operations are recorded as single atomic undoable steps.
  - Filter no-op history entries when state is unchanged after a mutation path.
  - Define reset/clear boundaries for history when the workspace is replaced/loaded/reinitialized.
  - Keep V1 history non-persistent across browser reloads unless already supported incidentally.
- Out:
  - UI shortcut/button integration (handled in `item_362`)
  - Full regression coverage additions (handled in `item_364`)

# Acceptance criteria
- Bulk operations covered in V1 are undoable atomically as one step.
- No-op actions do not pollute the history stack.
- History reset behavior is deterministic for workspace replacement/reinitialization flows.

# Priority
- Impact: High.
- Urgency: Medium-High.

# Notes
- Dependencies: `req_066`, `item_361`.
- Blocks: `item_364`, `task_063`.
- Related AC: AC4, AC5, AC6.
- References:
  - `logics/request/req_066_global_undo_redo_history_for_modeling_and_catalog_mutations.md`
  - `logics/request/req_062_catalog_csv_import_export_actions_and_round_trip_support.md`
  - `src/store/index.ts`

