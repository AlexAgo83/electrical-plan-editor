## item_131_async_safe_viewport_mutation_test_helper_contract_hardening - Async-Safe Viewport Mutation Test Helper Contract Hardening
> From version: 0.5.7
> Understanding: 99%
> Confidence: 97%
> Progress: 0%
> Complexity: Low
> Theme: Guarantee Viewport Restoration Even for Awaited Test Flows
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
`withViewportWidth(...)` currently takes a synchronous callback and restores viewport state immediately in `finally`. If used with an async callback in the future, cleanup could run before awaited assertions/DOM work completes, creating subtle flaky tests and false confidence.

# Scope
- In:
  - Harden the helper contract to safely support async callbacks while preserving sync usage ergonomics.
  - Update touched tests/utilities to the hardened contract as needed.
  - Keep cleanup guarantees explicit and easy to reason about.
- Out:
  - Broad testing utility rewrites unrelated to viewport mutation.
  - Framework-level async helper abstractions.

# Acceptance criteria
- Viewport helper supports async callbacks (or explicitly rejects them) without early restoration.
- Synchronous callers remain ergonomic and passing.
- Touched tests retain reliable cleanup guarantees and readability.

# Priority
- Impact: Medium (test reliability and future-proofing).
- Urgency: Medium (preventive hardening).

# Notes
- Dependencies: none strict.
- Blocks: item_133.
- Related AC: AC4, AC6, AC7.
- References:
  - `logics/request/req_022_post_req_021_review_followup_real_lazy_chunking_no_active_network_compute_scoping_and_test_helper_contract_hardening.md`
  - `src/tests/helpers/app-ui-test-utils.tsx`
  - `src/tests/app.ui.workspace-shell-regression.spec.tsx`
  - `src/tests/app.ui.inspector-shell.spec.tsx`
  - `src/tests/app.ui.lazy-loading-regression.spec.tsx`
