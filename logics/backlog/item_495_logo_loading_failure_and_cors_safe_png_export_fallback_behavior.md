## item_495_logo_loading_failure_and_cors_safe_png_export_fallback_behavior - Logo loading failure and CORS-safe PNG export fallback behavior
> From version: 1.3.0
> Status: Done
> Understanding: 97% (fallback copy and allowed logo source schemes clarified)
> Confidence: 95%
> Progress: 100%
> Complexity: High
> Theme: Export robustness
> Reminder: Update status/understanding/confidence/progress and linked task references when you edit this doc.

# Problem
Remote logo URLs can fail or trigger cross-origin restrictions in PNG rendering, which can break export if fallback behavior is not explicit.

# Scope
- In:
  - implement deterministic fallback path when logo URL is invalid/unreachable/CORS-restricted;
  - support `http`, `https`, and `data:image/*` logo sources under the same fallback rules;
  - ensure export never fails because of logo loading issues;
  - show explicit placeholder text (`Logo indisponible`) in cartouche fallback;
  - preserve all non-logo cartouche data in fallback cases.
- Out:
  - hosted image proxy service;
  - local file upload flow.

# Acceptance criteria
- AC1: SVG export succeeds when logo URL fails, with `Logo indisponible` fallback behavior.
- AC2: PNG export succeeds when logo URL fails or is CORS-blocked, with `Logo indisponible` fallback behavior.
- AC3: Export errors caused only by logo loading are eliminated.
- AC4: Non-logo cartouche metadata remains present in fallback outputs.

# AC Traceability
- AC1 -> SVG fallback is robust.
- AC2 -> PNG fallback is robust under cross-origin constraints.
- AC3 -> Failure domain is reduced.
- AC4 -> Document content remains usable.

# Priority
- Impact: High.
- Urgency: High.

# Notes
- Derived from `logics/request/req_102_export_frame_and_network_identity_cartouche_for_svg_png.md`.
- Orchestrated by `logics/tasks/task_078_req_102_export_frame_and_network_identity_cartouche_for_svg_png_orchestration_and_delivery_control.md`.
- Implemented:
  - `src/app/components/NetworkSummaryPanel.tsx` logo resolution path with URL normalization/validation + safe fetch to data URL;
  - fallback placeholder text `Logo indisponible` on invalid URL, fetch failure, non-image payload, or CORS/network error;
  - export flow keeps succeeding for both SVG and PNG even when logo cannot be loaded;
  - regression tests in `src/tests/app.ui.network-summary-bom-export.spec.tsx` covering fallback rendering contract.
