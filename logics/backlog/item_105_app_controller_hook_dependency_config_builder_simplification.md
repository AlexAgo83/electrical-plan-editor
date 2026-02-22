## item_105_app_controller_hook_dependency_config_builder_simplification - AppController Hook Dependency Config Builder Simplification
> From version: 0.5.2
> Understanding: 97%
> Confidence: 94%
> Progress: 0%
> Complexity: Medium
> Theme: Dependency Assembly Simplification Without Hidden Coupling
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
`AppController.tsx` still contains large inline dependency/config objects passed to heavy hooks, which adds noise and makes dependency intent difficult to audit.

# Scope
- In:
  - Simplify large hook dependency assembly using explicit builders and/or intermediate hooks.
  - Preserve explicit dependency flow and testability.
  - Reduce inline object noise in `AppController`.
  - Avoid abstraction layers that obscure ownership.
- Out:
  - Implicit global state/context indirection solely to avoid prop passing.
  - Behavioral changes to existing hooks.

# Acceptance criteria
- Large inline hook config objects in `AppController` are reduced or replaced with clearer assembly modules.
- Dependency flow remains explicit and traceable.
- No behavior regressions introduced by dependency-assembly refactor.
- `AppController` readability improves without introducing opaque abstractions.

# Priority
- Impact: Medium (clarity improvement after structural reductions).
- Urgency: Medium (best after containers/slices/derived-state boundaries are established).

# Notes
- Dependencies: item_102, item_103, item_104 recommended sequencing.
- Blocks: item_106.
- Related AC: AC1, AC3, AC4, AC7.
- References:
  - `logics/request/req_017_app_controller_decomposition_wave_4_screen_containers_and_controller_slices.md`
  - `src/app/AppController.tsx`
  - `src/app/hooks/useCanvasInteractionHandlers.ts`
  - `src/app/hooks/useWorkspaceHandlers.ts`
  - `src/app/hooks/useSelectionHandlers.ts`
  - `src/tests/app.ui.navigation-canvas.spec.tsx`
  - `src/tests/app.ui.workspace-shell-regression.spec.tsx`

