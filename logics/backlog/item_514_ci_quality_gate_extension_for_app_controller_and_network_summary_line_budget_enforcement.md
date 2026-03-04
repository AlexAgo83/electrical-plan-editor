## item_514_ci_quality_gate_extension_for_app_controller_and_network_summary_line_budget_enforcement - CI quality-gate extension for AppController and NetworkSummaryPanel line-budget enforcement
> From version: 1.3.3
> Status: Draft
> Understanding: 97%
> Confidence: 94%
> Progress: 0%
> Complexity: Medium
> Theme: CI / Quality gates
> Reminder: Update status/understanding/confidence/progress and linked task references when you edit this doc.

# Problem
Req_104 reduced `AppController.tsx` and `NetworkSummaryPanel.tsx`, but no hard CI threshold prevents silent growth regressions in future increments.

# Scope
- In:
  - extend machine-enforced line-budget checks for:
    - `src/app/AppController.tsx <= 1100`,
    - `src/app/components/NetworkSummaryPanel.tsx <= 1000`;
  - integrate checks in `ci:local` execution path;
  - provide deterministic failure output when thresholds are exceeded;
  - add/adjust targeted automated coverage for pass/fail paths.
- Out:
  - broad static-analysis redesign;
  - file-size policy for files outside req_105 scope.

# Acceptance criteria
- AC1: Quality script enforces both locked thresholds with deterministic exit code.
- AC2: `npm run -s ci:local` fails when a threshold is exceeded and passes when respected.
- AC3: Failure output names the violating file, observed line count, and allowed maximum.
- AC4: Regression coverage protects script behavior against accidental threshold removal.

# AC Traceability
- AC1 -> Budget enforcement is machine-checkable.
- AC2 -> CI gate guarantees release discipline.
- AC3 -> Triage path is immediate for developers.
- AC4 -> Guardrail remains durable over refactors.

# Priority
- Impact: High.
- Urgency: High.

# Notes
- Derived from `logics/request/req_105_post_req_104_review_followup_ci_budget_guard_csv_import_atomicity_i18n_runtime_completeness_onboarding_focus_cancellation_and_targeted_regression_coverage.md`.
- Orchestrated by `logics/tasks/task_081_req_105_post_req_104_review_followup_orchestration_and_delivery_control.md`.
