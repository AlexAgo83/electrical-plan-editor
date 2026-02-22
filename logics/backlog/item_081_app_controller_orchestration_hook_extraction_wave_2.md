## item_081_app_controller_orchestration_hook_extraction_wave_2 - App Controller Orchestration Hook Extraction (Wave 2)
> From version: 0.5.0
> Understanding: 98%
> Confidence: 95%
> Progress: 0%
> Complexity: High
> Theme: App Orchestration Decoupling
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
`src/app/AppController.tsx` centralizes too many responsibilities (shell, navigation, forms, selection sync, canvas orchestration, PWA hooks), making change review and regression isolation difficult.

# Scope
- In:
  - Split `AppController` responsibility clusters into dedicated orchestration hooks/modules.
  - Keep `AppController` as composition entrypoint and wiring layer.
  - Preserve current UI behavior and event flow ordering.
  - Extract logic with explicit interfaces (inputs/outputs) to avoid hidden coupling.
- Out:
  - Visual redesign of shell, panels, or forms.
  - State-management architecture migration.

# Acceptance criteria
- `AppController.tsx` is significantly reduced and primarily composes hooks/components.
- Extracted orchestration modules have focused responsibilities and explicit dependencies.
- Existing UX behavior (drawer/ops/inspector/forms/canvas interactions) remains unchanged.
- Lint/typecheck/tests remain green after extraction.

# Priority
- Impact: Very high (largest maintainability hotspot).
- Urgency: High (foundation for safe future feature work).

# Notes
- Blocks: item_088.
- Dependencies: item_082 (recommended, for utility cleanup during extraction).
- Related AC: AC1, AC8, AC9.
- References:
  - `logics/request/req_014_ui_modularization_wave_2_controller_analysis_canvas_and_bundle_optimization.md`
  - `src/app/AppController.tsx`
  - `src/app/hooks/useWorkspaceNavigation.ts`
  - `src/app/hooks/useUiPreferences.ts`
  - `src/app/hooks/useKeyboardShortcuts.ts`
  - `src/tests/app.ui.navigation-canvas.spec.tsx`
  - `src/tests/app.ui.workspace-shell-regression.spec.tsx`

