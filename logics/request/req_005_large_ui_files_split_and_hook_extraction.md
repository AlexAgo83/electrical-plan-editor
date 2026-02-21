## req_005_large_ui_files_split_and_hook_extraction - Large UI Files Split and Hook Extraction
> From version: 0.1.0
> Understanding: 99%
> Confidence: 97%
> Complexity: High
> Theme: Frontend Modularization
> Reminder: Update Understanding/Confidence and dependencies/references when you edit this doc.

# Needs
- Reduce maintenance risk by splitting oversized UI files and extracting reusable hooks/components.
- Remove monolithic responsibilities from `src/app/App.tsx` and centralize logic in explicit modules.
- Keep runtime behavior unchanged while improving readability, testability, and delivery speed.

# Context
Current UI layer includes several files above 500 lines:
- `src/app/App.tsx` (~4977 lines)
- `src/app/styles.css` (~855 lines)
- `src/tests/app.ui.spec.tsx` (~699 lines)

These files mix multiple responsibilities (state orchestration, canvas interactions, workspace rendering, preferences, validation UX, styling, integration tests), increasing coupling and regression risk.

Architecture reference to preserve:
- `logics/architecture/target_reference_v1_frontend_local_first.md`

## Objectives
- Split `App.tsx` into domain-focused React components and hooks.
- Split large CSS into structured style modules with clear ownership.
- Split UI integration test suite into focused test files by workflow area.
- Keep functional parity and deterministic UI behavior.

## Functional Scope
### App decomposition
- Extract workspace shell, navigation, canvas panel, inspector panel, modeling/analysis/validation/settings blocks into separate components.
- Keep `App.tsx` as thin orchestration/composition entry point.
- Extract cross-cutting UI logic into hooks (examples):
  - canvas interactions (zoom/pan/drag/select)
  - preferences persistence
  - keyboard shortcuts
  - validation issue navigation/filtering
  - screen/sub-screen routing state

### Hook extraction rules
- Hooks must be pure UI orchestration hooks (no hidden domain mutations outside existing store actions).
- Hook APIs must be explicit (input params + returned commands/state) and easily unit-testable.
- Avoid circular imports between hooks/components.

### Style split
- Split `src/app/styles.css` into thematic files (shell/navigation, canvas, panels/forms, tables, validation, settings).
- Keep visual behavior unchanged for current modes and states.
- Maintain consistent token usage and class naming conventions.

### UI test split
- Split `src/tests/app.ui.spec.tsx` by feature slices (navigation, canvas, validation, settings, list ergonomics).
- Centralize shared test helpers/builders to avoid duplication.
- Preserve current test intent and coverage expectations.

## Acceptance criteria
- AC1: `App.tsx` no longer contains the current monolithic logic and is reduced to composition/orchestration role.
- AC2: UI behavior remains functionally equivalent for modeling, analysis, validation, and settings workflows.
- AC3: Canvas, shortcuts, and validation navigation logic are extracted into dedicated hooks with clear APIs.
- AC4: `styles.css` responsibilities are split into modular stylesheet files with no visual regressions on core screens.
- AC5: UI integration tests are split by feature area while preserving or increasing current coverage.
- AC6: In targeted UI scope, no file remains above 500 lines without explicit justified exception.

## Non-functional requirements
- No regression on existing local-first and deterministic domain behavior.
- Keep build/lint/typecheck/test commands unchanged and passing.
- Maintain readability and explicit module boundaries.

## Out of scope
- Domain model redesign.
- Routing algorithm changes.
- UX feature redesign unrelated to modularization.

# Backlog
- To create from this request:
  - `item_030_app_component_composition_split.md`
  - `item_031_canvas_preferences_and_navigation_hook_extraction.md`
  - `item_032_ui_stylesheet_modularization.md`
  - `item_033_app_ui_test_suite_split_and_shared_helpers.md`
  - `item_034_ui_modularization_regression_and_coverage_gate.md`

# References
- `logics/request/req_001_v1_ux_ui_operator_workspace.md`
- `logics/request/req_003_theme_mode_switch_normal_dark.md`
- `logics/request/req_004_network_import_export_file_workflow.md`
- `logics/tasks/task_005_ui_store_large_file_modularization_orchestration_and_delivery_control.md`
- `src/app/App.tsx`
- `src/app/styles.css`
- `src/tests/app.ui.spec.tsx`
