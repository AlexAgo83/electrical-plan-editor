## item_087_safe_code_splitting_for_heavy_workspaces_and_chunk_regression_checks - Safe Code Splitting for Heavy Workspaces and Chunk Regression Checks
> From version: 0.5.0
> Understanding: 96%
> Confidence: 92%
> Progress: 100%
> Complexity: Medium
> Theme: Runtime Delivery Optimization
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
The app has a relatively large initial bundle and multiple heavyweight workspaces; without safe code splitting, startup cost may grow as UI surfaces continue to expand.

# Scope
- In:
  - Introduce `React.lazy`/`Suspense` for selected heavy screens/components where safe.
  - Validate routing/navigation UX remains deterministic with loading boundaries.
  - Verify static hosting/PWA build remains correct after chunking changes.
  - Document any chunking tradeoffs or fallback UX decisions.
- Out:
  - Premature micro-optimization of small components.
  - New caching strategies beyond existing PWA behavior.

# Acceptance criteria
- At least one heavy workspace/component is lazily loaded with stable UX.
- Build output remains valid for static hosting and PWA generation.
- No regression in navigation, focus, or major workflows due to loading boundaries.
- Tests/build pipeline remain green.

# Priority
- Impact: Medium-high (delivery efficiency and scalability).
- Urgency: Medium (can follow structural modularization safely).

# Notes
- Dependencies: item_081, item_083, item_084 (recommended sequencing before chunking).
- Blocks: item_088 (final regression verification includes code-split paths).
- Related AC: AC7, AC8.
- References:
  - `logics/request/req_014_ui_modularization_wave_2_controller_analysis_canvas_and_bundle_optimization.md`
  - `src/app/App.tsx`
  - `src/app/AppController.tsx`
  - `src/app/components/screens/AnalysisScreen.tsx`
  - `src/app/components/screens/ModelingScreen.tsx`
  - `src/app/components/screens/NetworkScopeScreen.tsx`
  - `src/app/components/screens/SettingsScreen.tsx`
  - `src/app/components/screens/ValidationScreen.tsx`
  - `vite.config.ts`
  - `package.json`
  - `src/app/pwa/registerServiceWorker.ts`
