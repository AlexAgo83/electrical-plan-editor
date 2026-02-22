## item_143_layout_responsiveness_test_guardrail_reliability_followup - Layout Responsiveness Test Guardrail Reliability Follow-up
> From version: 0.5.9
> Understanding: 99%
> Confidence: 97%
> Progress: 0%
> Complexity: Low
> Theme: Keep Perf Guardrail Useful Without Excess CI Noise
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
The layout responsiveness test remains wall-clock based (`performance.now()`), which can be noisy under CI load even after threshold adjustment. The guardrail should remain meaningful while minimizing false negatives.

# Scope
- In:
  - Review and harden the layout responsiveness test guardrail strategy or documentation.
  - Preserve a pragmatic performance signal that can still catch major regressions.
- Out:
  - Full benchmarking infrastructure.
  - Algorithm rewrite work unrelated to guardrail reliability.

# Acceptance criteria
- Responsiveness guardrail remains explicit and meaningful.
- CI flakiness risk is reduced/documented with a defensible strategy.
- Touched tests pass.

# Priority
- Impact: Low-medium (CI reliability / signal quality).
- Urgency: Medium.

# Notes
- Dependencies: recent threshold relax patch baseline.
- Blocks: item_144.
- Related AC: AC5, AC6, AC7.
- References:
  - `src/tests/core.layout.spec.ts`
  - `logics/request/req_024_post_req_023_review_followup_canvas_node_click_event_dedup_mouse_button_guards_empty_state_coverage_and_test_isolation_guardrails.md`
