## item_363_undo_redo_history_grouping_no_op_filtering_and_reset_boundaries - Undo/redo history grouping, no-op filtering, and reset boundaries
> From version: 0.9.8
> Status: Done
> Understanding: 96%
> Confidence: 91%
> Progress: 100%
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
  - `src/app/hooks/useStoreHistory.ts`
  - `src/app/AppController.tsx`

# AC Traceability
- request-AC1 -> This backlog slice. Evidence needed: The Catalog screen exposes a CSV export action in the list header tools row, positioned **before `Help`**.
- request-AC2 -> This backlog slice. Evidence needed: The Catalog screen exposes a CSV import action in the bottom action row, positioned **between `Edit` and `Delete`**.
- request-AC3 -> This backlog slice. Evidence needed: Catalog CSV export downloads a deterministic CSV of active-network catalog items with stable columns and safe escaping.
- request-AC4 -> This backlog slice. Evidence needed: Catalog CSV import parses supported CSV rows and creates/updates catalog items using a documented deterministic conflict policy.
- request-AC5 -> This backlog slice. Evidence needed: Invalid CSV rows (including invalid URL / invalid numeric fields) do not crash import and are strictly skipped/rejected with deterministic error reporting and user-visible feedback.
- request-AC6 -> This backlog slice. Evidence needed: Existing Catalog CRUD/help interactions remain functional and visually coherent after adding the new actions.
- request-AC7 -> This backlog slice. Evidence needed: Regression coverage exists for action placement, export schema/escaping, import parsing/conflicts, and a round-trip smoke path.
- request-AC1 -> This backlog slice. Evidence needed: Users can trigger global `Undo` and `Redo` for supported workspace mutations via visible UI actions.
- request-AC2 -> This backlog slice. Evidence needed: Keyboard shortcuts (`Cmd/Ctrl+Z`, `Shift+Cmd/Ctrl+Z`, and optionally `Ctrl+Y`) perform undo/redo correctly.
- request-AC3 -> This backlog slice. Evidence needed: Undo/redo applies to representative modeling and catalog mutations without corrupting workspace state.
- request-AC4 -> This backlog slice. Evidence needed: Redo stack clears when a new mutation occurs after one or more undo operations.
- request-AC5 -> This backlog slice. Evidence needed: Bulk mutations covered in V1 are undoable atomically as a single step.
- request-AC6 -> This backlog slice. Evidence needed: UI-only state (theme/preferences/navigation/selection/viewport) is not affected by undo/redo in V1.
- request-AC7 -> This backlog slice. Evidence needed: Existing form `Save`/`Cancel edit` semantics remain non-regressed.
- request-AC1 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC2 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC3 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC4 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC5 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC6 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC7 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
