## item_115_app_shell_suspense_boundary_and_lazy_loading_blank_screen_resilience - App Shell Suspense Boundary and Lazy Loading Blank-Screen Resilience
> From version: 0.5.4
> Understanding: 99%
> Confidence: 96%
> Progress: 100%
> Complexity: Medium
> Theme: Preserve Shell While Lazy Chunks Resolve
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
Wave-5 introduced `appUiModules` lazy/eager registry compaction while `AppController` still wraps the full shell in a root `Suspense` with `fallback={null}`. On cold lazy chunk loads, the entire shell can blank temporarily instead of keeping core UI visible.

# Scope
- In:
  - Adjust `Suspense` boundary placement and/or fallback strategy to keep header/navigation/critical shell visible during lazy screen/content loads.
  - Preserve lazy chunk boundaries and test-safe eager loading path (`import.meta.env.VITEST`).
  - Maintain behavior parity for screen rendering and shell interactions.
- Out:
  - Replacing lazy loading with eager imports in production.
  - Broad UI redesign for loading states.

# Acceptance criteria
- Lazy loading no longer blanks the entire shell UI during screen/content chunk resolution.
- Production build still produces expected lazy chunks and `quality:pwa` remains green.
- Test environment behavior remains stable (eager path or equivalent deterministic path preserved).
- No regressions in screen switching or shell interactions.

# Priority
- Impact: High (loading UX resilience in production).
- Urgency: High (introduced risk after wave-5 lazy registry compaction).

# Notes
- Dependencies: wave-5 `appUiModules` registry and shell extraction.
- Blocks: item_118.
- Related AC: AC3, AC4, AC6, AC7.
- References:
  - `logics/request/req_019_app_controller_post_wave_5_hardening_accessibility_loading_and_contract_clarity.md`
  - `src/app/AppController.tsx`
  - `src/app/components/appUiModules.tsx`
  - `src/app/components/layout/AppShellLayout.tsx`
  - `src/tests/app.ui.workspace-shell-regression.spec.tsx`
  - `tests/e2e/smoke.spec.ts`
  - `package.json`
