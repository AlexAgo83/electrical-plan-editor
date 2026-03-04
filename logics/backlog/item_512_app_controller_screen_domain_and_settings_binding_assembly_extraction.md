## item_512_app_controller_screen_domain_and_settings_binding_assembly_extraction - AppController screen-domain and settings-binding assembly extraction
> From version: 1.3.1
> Status: Draft
> Understanding: 97%
> Confidence: 94%
> Progress: 0%
> Complexity: High
> Theme: Controller / Modularity
> Reminder: Update status/understanding/confidence/progress and linked task references when you edit this doc.

# Problem
`AppController.tsx` contains large inline assembly blocks for screen content and settings/canvas binding maps, generating high cognitive load and high edit risk.

# Scope
- In:
  - extract screen-domain content assembly into dedicated hook/module;
  - extract settings/canvas binding bundles into typed helper modules;
  - keep downstream component contracts unchanged;
  - reduce controller file size toward phase-1 line budget.
- Out:
  - major redesign of screen composition architecture.

# Acceptance criteria
- AC1: Screen-domain assembly moves out of `AppController.tsx` into dedicated module(s).
- AC2: Settings/canvas binding maps are extracted into typed reusable bundles.
- AC3: `AppController.tsx` line count decreases strongly toward `<= 1100` target.
- AC4: Existing screens/settings behavior remains equivalent under test.

# AC Traceability
- AC1 -> Composition concern is separated.
- AC2 -> Binding noise is reduced and typed.
- AC3 -> Size-reduction objective is measurable.
- AC4 -> Behavior parity remains protected.

# Priority
- Impact: High.
- Urgency: High.

# Notes
- Derived from `logics/request/req_104_post_release_architecture_and_runtime_hardening_for_preferences_measurement_and_controller_split.md`.
- Orchestrated by `logics/tasks/task_080_req_104_post_release_architecture_and_runtime_hardening_orchestration_and_delivery_control.md`.
