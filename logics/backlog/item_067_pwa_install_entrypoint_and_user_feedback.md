## item_067_pwa_install_entrypoint_and_user_feedback - PWA Install Entrypoint and User Feedback
> From version: 0.3.0
> Understanding: 98%
> Confidence: 96%
> Progress: 0%
> Complexity: Medium
> Theme: Installability UX
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
Even with PWA technical support enabled, users may not discover install/update capabilities without a clear and non-intrusive UI entrypoint.

# Scope
- In:
  - Add user-facing install entrypoint when browser install prompt is supported.
  - Provide minimal update feedback when a new version is available (aligned with chosen update strategy).
  - Keep UI unobtrusive and consistent with current workspace shell conventions.
  - Handle unsupported browsers gracefully (no broken controls).
- Out:
  - Marketing/onboarding redesign.
  - Push notification preference center.

# Acceptance criteria
- Install entrypoint appears only when install capability is available.
- Install flow triggers native/browser-compatible prompt path.
- Update feedback is displayed according to update strategy and does not block core workflows.
- Unsupported environments degrade gracefully without console/runtime errors.

# Priority
- Impact: Medium-high (adoption and usability of PWA capability).
- Urgency: Medium once baseline + SW lifecycle are delivered.

# Notes
- Dependencies: item_064, item_065.
- Blocks: item_068.
- Related AC: AC1, AC4, AC7.
- References:
  - `logics/request/req_011_pwa_enablement_installability_and_offline_reliability.md`
  - `src/app/components/workspace/AppHeaderAndStats.tsx`
  - `src/app/AppController.tsx`
  - `src/tests/app.ui.navigation-canvas.spec.tsx`

