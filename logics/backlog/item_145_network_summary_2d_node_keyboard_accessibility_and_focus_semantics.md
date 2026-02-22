## item_145_network_summary_2d_node_keyboard_accessibility_and_focus_semantics - Network Summary 2D Node Keyboard Accessibility and Focus Semantics
> From version: 0.5.10
> Understanding: 99%
> Confidence: 97%
> Progress: 100%
> Complexity: Medium
> Theme: Improve Keyboard Accessibility for Interactive 2D Network Nodes
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
Interactive 2D nodes in `NetworkSummaryPanel` are mouse-only (`<g>` handlers) with no keyboard focus/activation semantics, creating an accessibility gap for keyboard users.

# Scope
- In:
  - Add keyboard/focus semantics (or equivalent accessible affordance) for interactive 2D node selection.
  - Preserve mouse interaction behavior and recent click dedup fixes.
  - Add/update regression coverage.
- Out:
  - Full SVG/canvas accessibility redesign.
  - New interaction modes.

# Acceptance criteria
- 2D node interactions are keyboard-reachable/activatable (or an explicitly documented alternative with tests).
- Mouse behavior remains stable.
- Touched tests pass.

# Priority
- Impact: Medium (a11y / UX).
- Urgency: Medium.

# Notes
- Dependencies: `req_024` canvas interaction baseline.
- Blocks: item_149.
- Related AC: AC1, AC5, AC6.
- References:
  - `src/app/components/NetworkSummaryPanel.tsx`
  - `src/app/hooks/useCanvasInteractionHandlers.ts`
  - `src/tests/app.ui.navigation-canvas.spec.tsx`
  - `logics/request/req_025_post_req_024_review_followup_network_summary_2d_accessibility_legacy_interaction_mode_cleanup_test_reset_contract_clarity_and_perf_guardrail_strategy.md`
