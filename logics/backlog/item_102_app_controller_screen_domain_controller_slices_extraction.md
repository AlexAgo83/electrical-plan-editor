## item_102_app_controller_screen_domain_controller_slices_extraction - AppController Screen/Domain Controller Slices Extraction
> From version: 0.5.2
> Understanding: 98%
> Confidence: 95%
> Progress: 0%
> Complexity: High
> Theme: Explicit Screen Contracts and Behavior Localization
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
`AppController.tsx` still assembles large behavior/config objects for multiple hooks and screens, mixing unrelated responsibilities and making ownership boundaries unclear even after screen containers are introduced.

# Scope
- In:
  - Introduce explicit screen/domain controller slices (or equivalent modules) that localize screen-specific orchestration and data contracts.
  - Define narrow slice interfaces consumed by screen containers.
  - Keep dependency injection explicit and traceable.
  - Preserve behavior and current public child component contracts where practical.
- Out:
  - One mega-hook (`useAppControllerLogic`) that simply moves complexity to another file.
  - Store architecture changes.

# Acceptance criteria
- Screen/domain controller slices exist with explicit inputs/outputs and are used by screen containers and/or `AppController`.
- `AppController` no longer directly owns large unrelated behavior bundles for all screens.
- No regressions in modeling/canvas/inspector/validation interactions.
- Code reviewability improves through clearer ownership boundaries.

# Priority
- Impact: Very high (key structural reduction beyond JSX extraction).
- Urgency: High (core wave-4 design objective).

# Notes
- Dependencies: item_100 and item_101 recommended before/alongside slice extraction.
- Blocks: item_103, item_104, item_105, item_106.
- Related AC: AC1, AC3, AC4, AC6, AC7.
- References:
  - `logics/request/req_017_app_controller_decomposition_wave_4_screen_containers_and_controller_slices.md`
  - `src/app/AppController.tsx`
  - `src/app/hooks/useCanvasInteractionHandlers.ts`
  - `src/app/hooks/useWorkspaceHandlers.ts`
  - `src/app/hooks/useSelectionHandlers.ts`
  - `src/app/hooks/useValidationModel.ts`
  - `src/tests/app.ui.navigation-canvas.spec.tsx`
  - `src/tests/app.ui.validation.spec.tsx`
  - `src/tests/app.ui.workspace-shell-regression.spec.tsx`

