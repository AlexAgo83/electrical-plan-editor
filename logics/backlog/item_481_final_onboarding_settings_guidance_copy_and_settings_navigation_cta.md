## item_481_final_onboarding_settings_guidance_copy_and_settings_navigation_cta - Final onboarding settings guidance copy and settings navigation CTA
> From version: 1.2.1
> Status: Done
> Understanding: 100%
> Confidence: 96%
> Progress: 100%
> Complexity: Medium
> Theme: Onboarding / UX guidance
> Reminder: Update status/understanding/confidence/progress and linked task references when you edit this doc.

# Problem
The onboarding flow lacks a final practical step that tells users which Settings to configure first and provides a direct navigation action to Settings.
Without concise guidance and direct CTA, users can miss high-value preferences during initial setup.

# Scope
- In:
  - author concise final-step onboarding copy in English;
  - ensure the content explicitly covers:
    - `Language`
    - `Theme`
    - `Keyboard shortcuts`
    - `Canvas render preferences`
    - `Global preferences`
  - add one primary CTA only: `Open Settings`;
  - wire CTA navigation to open Settings workspace using existing onboarding action behavior.
- Out:
  - additional CTA buttons beyond `Open Settings`;
  - contextual single-step help entrypoint for this slide;
  - FR translation of this specific step in this item.

# Acceptance criteria
- AC1: Final onboarding step copy is concise, practical, and English-only.
- AC2: Final onboarding step mentions the fixed shortlist of key settings areas.
- AC3: Final onboarding step exposes a single primary CTA (`Open Settings`).
- AC4: CTA opens Settings workspace reliably with best-effort non-blocking behavior.

# AC Traceability
- AC1 -> Content contract and language constraints are applied.
- AC2 -> Required settings shortlist is explicitly surfaced.
- AC3 -> Single-CTA contract is enforced.
- AC4 -> Navigation behavior is covered by tests/proof.

# Priority
- Impact: High (user guidance and discoverability).
- Urgency: Medium-High (requested UX completion of onboarding flow).

# Notes
- Derived from `logics/request/req_099_onboarding_final_slide_for_key_settings_overview.md`.
- Orchestrated by `logics/tasks/task_077_super_orchestration_delivery_execution_for_req_097_and_req_098_with_validation_gates.md`.
