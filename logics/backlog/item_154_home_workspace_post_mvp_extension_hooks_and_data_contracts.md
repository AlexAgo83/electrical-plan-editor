## item_154_home_workspace_post_mvp_extension_hooks_and_data_contracts - Home Workspace Post-MVP Extension Hooks and Data Contracts
> From version: 0.5.11
> Understanding: 98%
> Confidence: 95%
> Progress: 100%
> Complexity: Medium
> Theme: Prepare Home Screen Architecture for Incremental Post-MVP Modules
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
If the home screen MVP is implemented as a one-off layout without extension boundaries, future additions (history, session summary, health snapshot, validation CTA, what's new) will require rework and increase AppController/UI wiring complexity.

# Scope
- In:
  - Define extension-friendly home screen composition boundaries (modules/sections/props).
  - Define lightweight data contracts or placeholders for post-MVP modules (history/session/health/what's-new) without fully implementing all modules.
  - Document insertion points/layout strategy to avoid structural rewrite later.
  - Keep home screen composition aligned with ongoing AppController modularization direction.
- Out:
  - Full implementation of all post-MVP home modules.
  - Storage/analytics infrastructure for activity history if not already available.

# Acceptance criteria
- Home screen MVP structure exposes clear extension points for post-MVP modules.
- Data/prop contracts for deferred modules are documented or scaffolded in a maintainable way.
- Adding a future module does not require major home layout rewrites.
- Approach is documented in Logics artifacts and reflects request guidance.

# Priority
- Impact: Medium (maintainability and roadmap fit).
- Urgency: Medium.

# Notes
- Dependencies: item_150.
- Blocks: item_155.
- Related AC: AC5, AC6.
- Resolution: Closed with extension-ready Home composition and optional/scaffolded post-MVP module hooks (without making post-MVP modules part of MVP delivery).
- References:
  - `logics/request/req_026_home_workspace_landing_screen_start_resume_quick_preferences_and_post_mvp_hub.md`
  - `src/app/AppController.tsx`
  - `src/app/components/layout/AppShellLayout.tsx`
  - `src/app/components/workspace/HomeWorkspaceContent.tsx`
  - `src/app/components/containers/HomeWorkspaceContainer.tsx`
  - `src/app/hooks/controller/useAppControllerScreenContentSlices.tsx`
