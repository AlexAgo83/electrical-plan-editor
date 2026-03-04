## item_511_app_controller_onboarding_controller_extraction_and_callbacks_stabilization - AppController onboarding controller extraction and callbacks stabilization
> From version: 1.3.1
> Status: Draft
> Understanding: 95%
> Confidence: 92%
> Progress: 0%
> Complexity: Medium-High
> Theme: Controller / UX orchestration
> Reminder: Update status/understanding/confidence/progress and linked task references when you edit this doc.

# Problem
Onboarding orchestration (open/next/target/focus) is embedded in `AppController.tsx`, increasing callback sprawl and coupling with unrelated screen logic.

# Scope
- In:
  - extract onboarding behavior into dedicated controller hook/module;
  - stabilize callback boundaries passed to modal/shell layers;
  - keep onboarding feature contract unchanged (full flow + targeted open behavior);
  - add parity checks for opening targets and navigation transitions.
- Out:
  - onboarding content rewrite.

# Acceptance criteria
- AC1: Onboarding orchestration callbacks are extracted from `AppController.tsx`.
- AC2: Existing onboarding flows remain functionally equivalent.
- AC3: Callback wiring to UI surfaces remains deterministic and type-safe.
- AC4: Regression checks cover key onboarding navigation paths.

# AC Traceability
- AC1 -> Controller responsibilities are reduced.
- AC2 -> Behavior parity is retained.
- AC3 -> Integration safety is maintained.
- AC4 -> Non-regression is evidenced.

# Priority
- Impact: Medium-High.
- Urgency: Medium-High.

# Notes
- Derived from `logics/request/req_104_post_release_architecture_and_runtime_hardening_for_preferences_measurement_and_controller_split.md`.
- Orchestrated by `logics/tasks/task_080_req_104_post_release_architecture_and_runtime_hardening_orchestration_and_delivery_control.md`.
