## req_008_app_orchestration_shell_completion_and_final_line_budget - App Orchestration Shell Completion and Final Line Budget
> From version: 0.2.0
> Understanding: 99%
> Confidence: 97%
> Complexity: High
> Theme: UI Modularization Completion
> Reminder: Update Understanding/Confidence and dependencies/references when you edit this doc.

# Needs
- Complete the final decomposition of `src/app/App.tsx` to remove monolithic ownership and enforce a sustainable line budget.
- Replace the current documented oversize exception with explicit modular boundaries (hooks + screen components + helpers).
- Execute the split through small, reversible PRs to minimize regressions.

# Context
The UI modularization program already extracted multiple modules (`components/`, `hooks/`, and split styles/tests), but `src/app/App.tsx` remains oversized (~5000+ lines) and still carries the documented exception in:
- `scripts/quality/check-ui-modularization.mjs`

Current `App.tsx` still contains concentrated responsibilities:
- large local UI state surface
- validation model computation and issue navigation
- network import/export and workspace orchestration (history + undo/redo)
- entity form orchestration (connector/splice/node/segment/wire)
- network canvas interaction controller (pan/zoom/drag/focus)
- full multi-screen JSX rendering

Architecture and modularization references to preserve:
- `logics/architecture/target_reference_v1_frontend_local_first.md`
- `logics/request/req_005_large_ui_files_split_and_hook_extraction.md`

## Objectives
- Reduce `App.tsx` to a thin composition shell.
- Keep functional parity for modeling, analysis, validation, settings, import/export, and canvas workflows.
- Remove the `App.tsx` oversize exception from the UI modularization quality gate.

## Functional Scope
### Incremental delivery plan (7 PRs)
1. PR0 baseline and safety net
- Freeze baseline metrics and quality gates before refactor (`typecheck`, `test:ci`, `quality:ui-modularization`).

2. PR1 helper/type extraction
- Move pure helpers and local app UI types out of `App.tsx` into dedicated modules.

3. PR2 validation model extraction
- Extract validation issue generation, filtering, counters, and cursor logic into a dedicated hook.

4. PR3 workspace controller extraction
- Extract store orchestration concerns (history, undo/redo, network lifecycle, import/export) into a dedicated hook.

5. PR4 entity form controller extraction
- Extract connector/splice/node/segment/wire form state + submit/reset/edit handlers into dedicated form hooks.

6. PR5 canvas controller extraction
- Extract zoom/pan/drag/focus/coordinate transformations and interaction-mode behavior into a dedicated canvas hook.

7. PR6 screen rendering split + quality gate closure
- Split large JSX sections into screen components (`Modeling`, `Analysis`, `Validation`, `Settings`).
- Keep `App.tsx` as orchestration/composition entrypoint.
- Remove `App.tsx` from allowed oversize exceptions in the UI modularization quality script.

### Guardrails
- No behavior drift for store actions and existing UI workflows.
- Each PR must remain reviewable and independently verifiable.
- Keep all existing scripts/commands and CI expectations unchanged.

## Acceptance criteria
- AC1: `src/app/App.tsx` is reduced below 500 lines and acts as a composition shell.
- AC2: UI behavior remains equivalent across modeling, analysis, validation, settings, import/export, and canvas workflows.
- AC3: Validation, workspace orchestration, entity forms, and canvas interactions are isolated in dedicated modules/hooks with explicit APIs.
- AC4: `npm run quality:ui-modularization` passes without `App.tsx` oversize exception.
- AC5: `npm run typecheck` and `npm run test:ci` pass after the split.
- AC6: Refactor is delivered through the planned incremental PR sequence with traceable scope.

## Non-functional requirements
- Preserve deterministic local-first behavior and data integrity expectations.
- Improve readability and ownership boundaries for UI orchestration code.
- Maintain debuggability and test diagnosability during/after split.

## Out of scope
- Domain model redesign.
- Store action contract redesign.
- UX redesign unrelated to modularization completion.

# Backlog
- To create from this request:
  - `item_045_app_refactor_baseline_and_quality_gate_snapshot.md`
  - `item_046_app_helpers_types_and_validation_hook_extraction.md`
  - `item_047_workspace_controller_history_and_import_export_hook_extraction.md`
  - `item_048_entity_form_controllers_and_canvas_interaction_hook_extraction.md`
  - `item_049_screen_component_split_and_app_line_budget_enforcement.md`

# References
- `logics/request/req_005_large_ui_files_split_and_hook_extraction.md`
- `logics/tasks/task_005_ui_store_large_file_modularization_orchestration_and_delivery_control.md`
- `scripts/quality/check-ui-modularization.mjs`
- `src/app/App.tsx`
- `src/app/components/NetworkSummaryPanel.tsx`
- `src/app/components/InspectorContextPanel.tsx`
- `src/app/hooks/useKeyboardShortcuts.ts`
- `src/app/hooks/useUiPreferences.ts`
- `src/app/hooks/useWorkspaceNavigation.ts`
