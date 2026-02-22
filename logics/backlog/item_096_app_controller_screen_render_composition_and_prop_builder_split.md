## item_096_app_controller_screen_render_composition_and_prop_builder_split - AppController Screen Render Composition and Prop Builder Split
> From version: 0.5.1
> Understanding: 98%
> Confidence: 95%
> Progress: 0%
> Complexity: Medium
> Theme: Screen Composition Readability and Prop Wiring Simplification
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
Even after hook extraction, `AppController.tsx` remains noisy because it still builds large child prop objects inline and renders multiple screen branches in a large JSX block.

# Scope
- In:
  - Split screen-specific render composition into local helpers/modules where appropriate.
  - Extract prop-builder groupings for heavyweight child components (modeling/analysis/network summary/workspace panels).
  - Preserve current lazy-loading boundaries and test-safe fallback behavior.
  - Preserve current screen rendering order and shell layout behavior.
- Out:
  - Visual redesign of screens.
  - New routing/navigation semantics.

# Acceptance criteria
- `AppController.tsx` screen composition becomes easier to scan (smaller render branches / prop wiring blocks).
- Prop-builder logic is extracted or clearly grouped without behavior drift.
- Lazy-loaded screen/workspace behavior remains stable in runtime and tests.
- UI integration + E2E smoke flows remain green.

# Priority
- Impact: Medium-high (reviewability and future velocity).
- Urgency: Medium-high (completes wave-3 controller decomposition).

# Notes
- Dependencies: item_094, item_095 (recommended sequencing).
- Blocks: item_099.
- Related AC: AC1, AC7, AC8.
- References:
  - `logics/request/req_016_app_controller_and_layout_engine_modularization_wave_3.md`
  - `src/app/AppController.tsx`
  - `src/app/components/screens/AnalysisScreen.tsx`
  - `src/app/components/screens/ModelingScreen.tsx`
  - `src/app/components/workspace/AnalysisWorkspaceContent.tsx`
  - `src/app/components/workspace/ModelingFormsColumn.tsx`
  - `src/app/components/NetworkSummaryPanel.tsx`
  - `tests/e2e/smoke.spec.ts`

