## item_124_app_controller_active_screen_domain_content_assembly_scoping_and_inactive_compute_reduction - AppController Active-Screen Domain Content Assembly Scoping and Inactive Compute Reduction
> From version: 0.5.6
> Understanding: 99%
> Confidence: 96%
> Progress: 100%
> Complexity: Medium
> Theme: Reduce Inactive Screen Composition Work Upstream of Workspace Suspense
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
`req_020` scoped workspace `Suspense` to the active screen branch in `AppShellLayout`, but `AppController` still constructs domain screen content for multiple inactive screens via `useAppControllerModelingAnalysisScreenDomains(...)` and `useAppControllerAuxScreenContentDomains(...)`. This preserves unnecessary compute/allocations on each render and limits the practical performance gains of active-screen rendering.

# Scope
- In:
  - Reduce or defer inactive-screen content assembly in `AppController`.
  - Refactor domain content hooks/call-sites so only active (or minimally required) content is built per render.
  - Preserve current screen behavior and avoid regressions in modeling/analysis/validation/settings/network scope content.
  - Document measurable reduction approach (qualitative and/or instrumentation) if direct LOC changes are small.
- Out:
  - Broad AppController decomposition wave unrelated to this compute scoping issue.
  - Rewriting all screen-content slices from scratch.

# Acceptance criteria
- Inactive screen content is no longer broadly assembled on every render in the common path.
- Active-screen behavior remains correct across all main screens.
- Resulting composition remains readable and reviewable (no opaque mega-hook regression).
- Changes integrate cleanly with `AppShellLayout` active-workspace `Suspense` scoping.

# Priority
- Impact: High (runtime compute discipline + refactor quality).
- Urgency: High (direct follow-up to `req_020` review finding).

# Notes
- Dependencies: `req_020` active-screen workspace rendering baseline.
- Blocks: item_128.
- Related AC: AC1, AC2, AC7.
- References:
  - `logics/request/req_021_app_controller_post_req_020_review_followup_inactive_screen_computation_lazy_test_path_and_shell_test_guardrails.md`
  - `src/app/AppController.tsx`
  - `src/app/hooks/controller/useAppControllerModelingAnalysisScreenDomains.tsx`
  - `src/app/hooks/controller/useAppControllerAuxScreenContentDomains.tsx`
  - `src/app/components/layout/AppShellLayout.tsx`
  - `src/app/components/appUiModules.tsx`
  - `src/tests/app.ui.workspace-shell-regression.spec.tsx`
