## item_361_workspace_history_snapshot_contract_and_domain_mutation_tracking_for_undo_redo - Workspace history snapshot contract and domain mutation tracking for undo/redo
> From version: 0.9.8
> Status: Done
> Understanding: 97%
> Confidence: 93%
> Progress: 100%
> Complexity: High
> Theme: State history foundation for global undo/redo
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
Global undo/redo requires a reliable history foundation that captures workspace-domain mutations without coupling to transient UI state.

# Scope
- In:
  - Define and implement V1 history stack data structures (`past/present/future` or equivalent).
  - Track workspace-domain mutations (modeling + catalog) in the history mechanism.
  - Ensure undo/redo transitions are deterministic and preserve state integrity.
  - Clear redo stack after a new mutation following undo.
  - Exclude UI-only state from tracked history payloads.
- Out:
  - UI buttons/shortcut wiring (handled in `item_362`)
  - Grouping/reset/no-op policies hardening (handled in `item_363`)
  - Regression test suite additions (handled in `item_364`)

# Acceptance criteria
- History foundation supports deterministic undo/redo for tracked workspace mutations.
- Redo is cleared correctly after branching from an undone state.
- UI-only state is not included in the tracked history payload.

# Priority
- Impact: High.
- Urgency: High.

# Notes
- Dependencies: `req_066`.
- Blocks: `item_362`, `item_363`, `item_364`, `task_063`.
- Related AC: AC1, AC3, AC4, AC6.
- References:
  - `logics/request/req_066_global_undo_redo_history_for_modeling_and_catalog_mutations.md`
  - `src/store/index.ts`
  - `src/app/AppController.tsx`
  - `src/app/hooks/useStoreHistory.ts`

# AC Traceability
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
