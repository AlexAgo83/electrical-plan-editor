## item_101_app_controller_analysis_validation_settings_networkscope_screen_containers_extraction - AppController Remaining Screen Containers Extraction (Analysis / Validation / Settings / Network Scope)
> From version: 0.5.2
> Understanding: 98%
> Confidence: 96%
> Progress: 0%
> Complexity: High
> Theme: Multi-Screen Composition Decoupling
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
Even after modeling-screen extraction, `AppController.tsx` will still hold significant JSX and prop wiring for analysis, validation, settings, and network-scope screens, keeping screen-specific responsibilities centralized.

# Scope
- In:
  - Extract screen composition and prop wiring for analysis, validation, settings, and network-scope into dedicated container modules.
  - Preserve current shell behavior, screen order, and conditional rendering semantics (`no active network` fallback, etc.).
  - Preserve lazy-loaded screen boundaries and runtime chunking behavior.
  - Keep explicit container contracts and avoid implicit cross-screen state coupling.
- Out:
  - Screen visual redesign.
  - Navigation/routing semantic changes.

# Acceptance criteria
- Analysis, validation, settings, and network-scope screen wiring is no longer inlined in `AppController.tsx`.
- `AppController` screen render block is reduced to container mounting and coarse conditional gating.
- Integration + E2E smoke flows across the extracted screens remain green.
- Build chunking/PWA behavior remains intact.

# Priority
- Impact: High (major residual controller composition noise).
- Urgency: High (completes screen-container extraction foundation).

# Notes
- Dependencies: item_100 recommended first (establishes extraction pattern for largest branch).
- Blocks: item_106.
- Related AC: AC1, AC2, AC5, AC6, AC8.
- References:
  - `logics/request/req_017_app_controller_decomposition_wave_4_screen_containers_and_controller_slices.md`
  - `src/app/AppController.tsx`
  - `src/app/components/screens/AnalysisScreen.tsx`
  - `src/app/components/screens/ValidationScreen.tsx`
  - `src/app/components/screens/SettingsScreen.tsx`
  - `src/app/components/screens/NetworkScopeScreen.tsx`
  - `src/app/components/workspace/AnalysisWorkspaceContent.tsx`
  - `src/app/components/workspace/ValidationWorkspaceContent.tsx`
  - `src/app/components/workspace/SettingsWorkspaceContent.tsx`
  - `src/app/components/workspace/NetworkScopeWorkspaceContent.tsx`
  - `src/tests/app.ui.workspace-shell-regression.spec.tsx`
  - `src/tests/app.ui.inspector-shell.spec.tsx`
  - `tests/e2e/smoke.spec.ts`

