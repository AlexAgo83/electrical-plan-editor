## item_509_network_summary_panel_callout_model_layout_render_extraction_and_parity_tests - NetworkSummaryPanel callout model/layout/render extraction and parity tests
> From version: 1.3.1
> Status: Draft
> Understanding: 98%
> Confidence: 95%
> Progress: 0%
> Complexity: High
> Theme: Architecture / Callouts
> Reminder: Update status/understanding/confidence/progress and linked task references when you edit this doc.

# Problem
Callout model, layout metrics, text measurement, and rendering are tightly coupled in `NetworkSummaryPanel.tsx`, making changes risky and costly.

# Scope
- In:
  - extract callout row/group/view-model builders;
  - extract callout layout metrics/cache utilities;
  - extract callout rendering layer/component;
  - keep selected-row highlight, color swatches, and i18n label behavior intact;
  - add parity tests for rendered output and interaction semantics.
- Out:
  - new callout features not in current contract.

# Acceptance criteria
- AC1: Callout model and layout logic are moved into dedicated modules.
- AC2: Callout rendering layer is isolated from panel orchestration.
- AC3: Existing callout behavior (content, styles, selection states) remains equivalent.
- AC4: Parity tests protect extraction regressions.

# AC Traceability
- AC1 -> Business/model logic separation is explicit.
- AC2 -> Rendering separation is explicit.
- AC3 -> User-visible behavior is preserved.
- AC4 -> Regression protection is formalized.

# Priority
- Impact: High.
- Urgency: High.

# Notes
- Derived from `logics/request/req_104_post_release_architecture_and_runtime_hardening_for_preferences_measurement_and_controller_split.md`.
- Orchestrated by `logics/tasks/task_080_req_104_post_release_architecture_and_runtime_hardening_orchestration_and_delivery_control.md`.
