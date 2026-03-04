## item_507_callout_text_measurement_dom_lifecycle_cleanup_and_regression_coverage - Callout text measurement DOM lifecycle cleanup and regression coverage
> From version: 1.3.1
> Status: Draft
> Understanding: 97%
> Confidence: 94%
> Progress: 0%
> Complexity: Medium
> Theme: Runtime / UI infrastructure
> Reminder: Update status/understanding/confidence/progress and linked task references when you edit this doc.

# Problem
Callout text measurement currently relies on hidden SVG nodes attached to `document.body` without explicit lifecycle teardown, risking DOM artifact accumulation.

# Scope
- In:
  - extract/encapsulate measurement node management with explicit init/dispose contract;
  - guarantee cleanup on unmount/test teardown;
  - keep measurement precision parity for callout layout;
  - add regression tests for repeated mount/unmount cycles.
- Out:
  - redesign of callout visual style.

# Acceptance criteria
- AC1: Hidden measurement nodes are created via explicit lifecycle utility.
- AC2: Teardown removes measurement nodes deterministically.
- AC3: Repeated mount/unmount cycles do not accumulate hidden SVG artifacts.
- AC4: Callout layout metrics remain visually equivalent after refactor.

# AC Traceability
- AC1 -> Lifecycle ownership is explicit.
- AC2 -> Cleanup is deterministic.
- AC3 -> Runtime leak risk is mitigated.
- AC4 -> Functional rendering parity is preserved.

# Priority
- Impact: Medium-High.
- Urgency: High.

# Notes
- Derived from `logics/request/req_104_post_release_architecture_and_runtime_hardening_for_preferences_measurement_and_controller_split.md`.
- Orchestrated by `logics/tasks/task_080_req_104_post_release_architecture_and_runtime_hardening_orchestration_and_delivery_control.md`.
