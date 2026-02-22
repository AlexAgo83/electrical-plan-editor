## item_130_app_controller_no_active_network_compute_scoping_alignment - AppController No-Active-Network Compute Scoping Alignment
> From version: 0.5.7
> Understanding: 99%
> Confidence: 97%
> Progress: 0%
> Complexity: Medium
> Theme: Complete Compute Scoping by Respecting Empty-State Short-Circuit Paths
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
`req_021` reduced inactive-screen content assembly, but `AppController` still may assemble content for modeling/analysis/validation/settings based on screen flags even when `AppShellLayout` renders the `!hasActiveNetwork` empty state instead. This leaves avoidable compute on an important path.

# Scope
- In:
  - Align include flags / assembly conditions with `no active network` short-circuit behavior.
  - Avoid building screen/domain content that cannot be rendered under the empty-state branch.
  - Preserve empty-state behavior and screen transitions.
- Out:
  - Broader AppController decomposition/refactor unrelated to this path.
  - Empty-state UX redesign.

# Acceptance criteria
- No-active-network path does not trigger unnecessary screen/domain content assembly.
- Empty-state behavior remains correct.
- Changes remain explicit and reviewable.
- Existing screen behavior with active networks remains intact.

# Priority
- Impact: Medium-high (compute discipline on common UX branch).
- Urgency: High (direct follow-up to recent compute scoping work).

# Notes
- Dependencies: `req_021` active/inactive screen assembly scoping baseline.
- Blocks: item_133.
- Related AC: AC3, AC7.
- References:
  - `logics/request/req_022_post_req_021_review_followup_real_lazy_chunking_no_active_network_compute_scoping_and_test_helper_contract_hardening.md`
  - `src/app/AppController.tsx`
  - `src/app/components/layout/AppShellLayout.tsx`
  - `src/app/hooks/controller/useAppControllerModelingAnalysisScreenDomains.tsx`
  - `src/app/hooks/controller/useAppControllerAuxScreenContentDomains.tsx`
