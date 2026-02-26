## item_362_undo_redo_ui_actions_shortcuts_and_input_focus_guard_integration - Undo/redo UI actions, shortcuts, and input-focus guard integration
> From version: 0.9.8
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
