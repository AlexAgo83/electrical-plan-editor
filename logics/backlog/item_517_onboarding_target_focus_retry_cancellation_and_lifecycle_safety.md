## item_517_onboarding_target_focus_retry_cancellation_and_lifecycle_safety - Onboarding target-focus retry cancellation and lifecycle safety
> From version: 1.3.3
> Status: Draft
> Understanding: 98%
> Confidence: 94%
> Progress: 0%
> Complexity: Medium
> Theme: UX stability / Lifecycle safety
> Reminder: Update status/understanding/confidence/progress and linked task references when you edit this doc.

# Problem
RAF-based onboarding target-focus retries can continue after close/unmount and trigger late focus jumps, causing UX inconsistency and flaky behavior.

# Scope
- In:
  - add explicit cancellation token/ref for onboarding focus retry scheduling;
  - cancel pending retries on close, unmount, and before starting a new target-focus sequence;
  - preserve onboarding step progression and target-focus success behavior while open;
  - add targeted regression tests for close-during-retry scenarios.
- Out:
  - redesign of onboarding step content or navigation UX.

# Acceptance criteria
- AC1: Pending target-focus retries are canceled when onboarding closes.
- AC2: Unmount path leaves no pending retry that can refocus targets later.
- AC3: Opening a new target-focus action cancels any previous pending retry sequence.
- AC4: Regression test validates no delayed focus jump occurs after close.

# AC Traceability
- AC1 -> Modal close is side-effect safe.
- AC2 -> Lifecycle cleanup is deterministic.
- AC3 -> Retry ownership is singular and conflict-free.
- AC4 -> Focus-jump regression stays covered.

# Priority
- Impact: Medium-High.
- Urgency: Medium-High.

# Notes
- Derived from `logics/request/req_105_post_req_104_review_followup_ci_budget_guard_csv_import_atomicity_i18n_runtime_completeness_onboarding_focus_cancellation_and_targeted_regression_coverage.md`.
- Orchestrated by `logics/tasks/task_081_req_105_post_req_104_review_followup_orchestration_and_delivery_control.md`.
