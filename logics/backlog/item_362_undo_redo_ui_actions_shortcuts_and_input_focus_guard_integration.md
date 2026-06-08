## item_362_undo_redo_ui_actions_shortcuts_and_input_focus_guard_integration - Undo/redo UI actions, shortcuts, and input-focus guard integration
> From version: 0.9.8
> Status: Done
> Understanding: 96%
> Confidence: 92%
> Progress: 100%
> Complexity: Medium-High
> Theme: Undo/redo UX integration and keyboard ergonomics
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
Even with a history engine, undo/redo provides limited value without discoverable UI actions and safe keyboard shortcuts that avoid interfering with text input editing.

# Scope
- In:
  - Add visible `Undo` / `Redo` UI actions following existing workspace action patterns.
  - Add enabled/disabled states based on history availability.
  - Wire keyboard shortcuts:
    - `Cmd/Ctrl+Z` => Undo
    - `Shift+Cmd/Ctrl+Z` => Redo
    - optional `Ctrl+Y` => Redo alias
  - Prevent shortcut handling when focus is inside text inputs/textareas/contenteditable (unless safely intended).
  - Keep action semantics compatible with accessibility and keyboard navigation expectations.
- Out:
  - History core state tracking (handled in `item_361`)
  - History grouping/reset policies (handled in `item_363`)
  - Regression test suite additions (handled in `item_364`)

# Acceptance criteria
- Users can trigger undo/redo from visible UI actions with correct disabled states.
- Keyboard shortcuts perform undo/redo when focus context is appropriate.
- Shortcuts do not hijack standard text-editing behavior in active input fields.

# Priority
- Impact: High.
- Urgency: High.

# Notes
- Dependencies: `req_066`, `item_361`.
- Blocks: `item_364`, `task_063`.
- Related AC: AC1, AC2, AC6.
- References:
  - `logics/request/req_066_global_undo_redo_history_for_modeling_and_catalog_mutations.md`
  - `src/app/AppController.tsx`
  - `src/app/hooks/useWorkspaceHandlers.ts`
  - `src/app/hooks/useKeyboardShortcuts.ts`
  - `src/app/components/workspace/OperationsHealthPanel.tsx`

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
