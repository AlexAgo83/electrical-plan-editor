## item_111_app_controller_lazy_import_registry_and_component_wiring_compaction - AppController Lazy Import Registry and Component Wiring Compaction
> From version: 0.5.3
> Understanding: 97%
> Confidence: 93%
> Progress: 100%
> Complexity: Medium
> Theme: Import and Lazy/Eager Wiring Noise Reduction
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
`AppController.tsx` has a large import block and repeated eager/lazy component wiring patterns, which inflate LOC and reduce scanability even when runtime behavior is correct.

# Scope
- In:
  - Compact eager/lazy component wiring through explicit registries/facades/helpers where it preserves chunk boundaries and test-safe eager behavior.
  - Reduce import and component binding noise in `AppController`.
  - Keep lazy-loading behavior observable and non-magical.
- Out:
  - Dynamic import indirection that obscures chunk ownership.
  - Changes to lazy-loading semantics that break tests or build output expectations.

# Acceptance criteria
- Import/lazy wiring footprint in `AppController` is materially reduced.
- Test-safe eager behavior and production lazy-loading remain intact.
- Build chunking and PWA artifact health remain green.
- Refactor remains explicit enough for review/debugging.

# Priority
- Impact: Medium (LOC and scanability improvement).
- Urgency: Medium (best after larger structural reductions land).

# Notes
- Dependencies: item_107-item_110 recommended first.
- Blocks: item_112, item_113.
- Related AC: AC1, AC6, AC7, AC8.
- References:
  - `logics/request/req_018_app_controller_decomposition_wave_5_real_loc_reduction_and_composition_root_slimming.md`
  - `src/app/AppController.tsx`
  - `src/app/components/NetworkSummaryPanel.tsx`
  - `src/app/components/screens/ModelingScreen.tsx`
  - `src/app/components/screens/AnalysisScreen.tsx`
  - `src/app/components/screens/ValidationScreen.tsx`
  - `src/app/components/screens/SettingsScreen.tsx`
  - `src/app/components/screens/NetworkScopeScreen.tsx`
  - `package.json`
  - `scripts/quality/check-pwa-build-artifacts.mjs`

