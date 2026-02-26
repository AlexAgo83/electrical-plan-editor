## item_361_workspace_history_snapshot_contract_and_domain_mutation_tracking_for_undo_redo - Workspace history snapshot contract and domain mutation tracking for undo/redo
> From version: 0.9.8
> Understanding: 97%
> Confidence: 93%
> Progress: 0%
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

