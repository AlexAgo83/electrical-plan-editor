## item_146_legacy_interaction_mode_runtime_cleanup_or_explicit_deactivation_contract - Legacy InteractionMode Runtime Cleanup or Explicit Deactivation Contract
> From version: 0.5.10
> Understanding: 99%
> Confidence: 97%
> Progress: 100%
> Complexity: Medium
> Theme: Align Runtime/Types with Select-Only Product Decision
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
`useCanvasInteractionHandlers` still contains legacy `interactionMode` branches (`addSegment`, `route`, `connect`) even though only `select` is product-supported. This creates maintenance ambiguity and can trigger false positives during reviews.

# Scope
- In:
  - Clean up unsupported legacy branches where safe, or explicitly document/deactivate them.
  - Align types/comments/contracts with the select-only product decision.
  - Preserve current supported behavior.
- Out:
  - Reintroducing removed modes.
  - Broad canvas subsystem redesign.

# Acceptance criteria
- Legacy unsupported mode status is clearer (cleanup or explicit deactivation/documentation).
- Supported `select` behavior remains unchanged.
- Touched tests/types remain consistent and pass.

# Priority
- Impact: Low-medium (maintainability / clarity).
- Urgency: Medium.

# Notes
- Dependencies: product decision confirmed (`select` only).
- Blocks: item_149.
- Related AC: AC2, AC5, AC6.
- References:
  - `src/app/hooks/useCanvasInteractionHandlers.ts`
  - `src/app/types/app-controller` 
  - `src/app/AppController.tsx`
  - `logics/request/req_025_post_req_024_review_followup_network_summary_2d_accessibility_legacy_interaction_mode_cleanup_test_reset_contract_clarity_and_perf_guardrail_strategy.md`
