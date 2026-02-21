## item_010_v1_contextual_inspector_and_interaction_modes - V1 Contextual Inspector and Interaction Modes
> From version: 0.1.0
> Understanding: 99%
> Confidence: 97%
> Progress: 100%
> Complexity: High
> Theme: UX/UI Task Flow
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
Create/edit operations are spread across multiple panels and do not provide a clear interaction model on the canvas, increasing cognitive load and editing errors.

# Scope
- In:
  - Build a right-side contextual inspector used for all entity create/edit/read actions.
  - Move form flows for `Connector`, `Splice`, `Node`, `Segment`, and `Wire` to the inspector.
  - Add explicit canvas interaction modes: `Select`, `Add Node`, `Add Segment`, `Connect`, `Route`.
  - Add global `Undo` / `Redo` actions and autosave status indicator (`Saved`, `Unsaved`, `Error`).
- Out:
  - Advanced macro/automation editor.
  - Multi-step wizard flows beyond V1 operation needs.

# Acceptance criteria
- Selecting an entity updates the inspector with the correct editable context.
- Users can create and edit all core entities from the inspector without leaving the workspace.
- Interaction modes can be switched deterministically and drive canvas behavior accordingly.
- Undo/redo is available for modeling edits and autosave status is visible.

# Priority
- Impact: High (core operator efficiency and safety).
- Urgency: High after layout refactor.

# Notes
- Dependencies: item_009, item_005.
- Related AC: AC2, AC3, AC4.
- Status update:
  - Interaction mode toolbar is available (`Select`, `Add Node`, `Add Segment`, `Connect`, `Route`).
  - `Select` mode is wired for node/segment selection and node dragging.
  - Keyboard shortcuts are active for interaction modes (`Alt+V`, `Alt+N`, `Alt+G`, `Alt+C`, `Alt+R`) and workspace/entity navigation (`Alt+1..4`, `Alt+Shift+1..5`).
  - Contextual inspector panel is active with focused entity snapshot and quick actions (`Open in inspector`, `Edit selected`, `Clear selection`).
  - Undo/redo actions and autosave status (`Saved`, `Unsaved`, `Error`) are active across modeling actions.
- References:
  - `logics/request/req_001_v1_ux_ui_operator_workspace.md`
  - `src/app/App.tsx`
  - `src/store/reducer.ts`
