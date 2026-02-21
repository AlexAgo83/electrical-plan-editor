## item_047_workspace_controller_history_and_import_export_hook_extraction - Workspace Controller, History and Import/Export Hook Extraction
> From version: 0.2.0
> Understanding: 99%
> Confidence: 96%
> Progress: 0%
> Complexity: High
> Theme: Workspace Orchestration Split
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
Undo/redo history, network lifecycle management, and import/export orchestration remain coupled inside `App.tsx`, making correctness changes risky and hard to reason about.

# Scope
- In:
  - Extract workspace orchestration logic into a dedicated controller hook.
  - Include history management (`dispatchAction`, undo/redo, replace-state flow).
  - Include network lifecycle actions (create/select/rename/duplicate/delete).
  - Include import/export flow handling and user feedback status handling.
- Out:
  - Entity form state controllers.
  - Canvas interaction logic.
  - Screen JSX decomposition.

# Acceptance criteria
- Workspace controller hook exposes explicit commands/state used by `App.tsx`.
- Undo/redo and history tracking behavior remains deterministic and equivalent.
- Import/export and network lifecycle flows preserve current UX behavior and outcomes.
- No regression in integration tests covering networks and import/export workflows.

# Priority
- Impact: Very high (critical state orchestration boundary).
- Urgency: High after baseline freeze.

# Notes
- Dependencies: item_045.
- Blocks: item_049.
- Related AC: AC2, AC3, AC6.
- References:
  - `logics/request/req_008_app_orchestration_shell_completion_and_final_line_budget.md`
  - `src/app/App.tsx`
  - `src/adapters/portability.ts`
  - `src/tests/app.ui.networks.spec.tsx`
  - `src/tests/app.ui.import-export.spec.tsx`
