## item_120_workspace_suspense_active_screen_scoping_and_inactive_lazy_isolation - Workspace Suspense Active-Screen Scoping and Inactive Lazy Isolation
> From version: 0.5.5
> Understanding: 99%
> Confidence: 96%
> Progress: 100%
> Complexity: Medium
> Theme: Prevent Inactive Lazy Screens from Blocking Active Workspace
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
The workspace-level `Suspense` boundary (introduced in `task_018`) preserves shell visibility, but it still wraps all screen containers. Inactive lazy screen modules may suspend and blank the active workspace area even though they are not the selected screen.

# Scope
- In:
  - Narrow `Suspense` scoping and/or conditional mounting so only active screen/content can trigger workspace fallback.
  - Preserve shell-level resilience (no root-level full-app blanking regression).
  - Preserve lazy/eager registry behavior and chunking.
- Out:
  - Replacing the lazy/eager registry with a different loading architecture.
  - Large screen/container API redesign unless required.

# Acceptance criteria
- Inactive lazy screens no longer suspend the active workspace area.
- Workspace loading fallback is triggered only by active screen/content loading.
- Shell remains visible during lazy loading.
- Build chunking and PWA quality checks remain healthy.

# Priority
- Impact: High (loading UX correctness and responsiveness).
- Urgency: High (follow-up to `req_019` suspense hardening).

# Notes
- Dependencies: `task_018` workspace `Suspense` baseline.
- Blocks: item_123.
- Related AC: AC3, AC4, AC7.
- References:
  - `logics/request/req_020_app_shell_desktop_overlay_hardening_alignment_and_workspace_suspense_scoping.md`
  - `src/app/components/layout/AppShellLayout.tsx`
  - `src/app/components/appUiModules.tsx`
  - `src/app/components/containers/NetworkScopeWorkspaceContainer.tsx`
  - `src/app/components/containers/ModelingWorkspaceContainer.tsx`
  - `src/app/components/containers/AnalysisWorkspaceContainer.tsx`
  - `src/app/components/containers/ValidationWorkspaceContainer.tsx`
  - `src/app/components/containers/SettingsWorkspaceContainer.tsx`
  - `src/app/components/screens/ModelingScreen.tsx`
  - `src/app/components/screens/AnalysisScreen.tsx`
  - `src/app/components/screens/ValidationScreen.tsx`
  - `src/app/components/screens/SettingsScreen.tsx`
  - `src/tests/app.ui.workspace-shell-regression.spec.tsx`
