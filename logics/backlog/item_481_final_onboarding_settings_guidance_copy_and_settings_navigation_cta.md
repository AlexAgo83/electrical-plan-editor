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
- request-AC1 -> This backlog slice. Evidence needed: Onboarding includes a new final step dedicated to key Settings guidance.
- request-AC2 -> This backlog slice. Evidence needed: The new Settings step is positioned after the current final step (`wires`).
- request-AC3 -> This backlog slice. Evidence needed: Full-flow progress/count reflects the added step accurately.
- request-AC4 -> This backlog slice. Evidence needed: The final step includes one primary CTA (`Open Settings`) that opens the `Settings` screen.
- request-AC5 -> This backlog slice. Evidence needed: Final-step content covers the fixed shortlist (`Language`, `Theme`, `Keyboard shortcuts`, `Canvas render preferences`, `Global preferences`) in concise onboarding wording.
- request-AC6 -> This backlog slice. Evidence needed: The Settings final slide is part of full flow only and has no contextual single-step entrypoint.
- request-AC7 -> This backlog slice. Evidence needed: Existing onboarding behaviors (auto-open/opt-out/contextual help/focus handling) remain non-regressed.
- request-AC8 -> This backlog slice. Evidence needed: Onboarding copy for this request remains English-only (FR handled by `req_098`).
- request-AC9 -> This backlog slice. Evidence needed: `logics_lint`, `lint`, `typecheck`, and relevant onboarding/UI tests pass.
- request-AC1 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC2 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC3 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC4 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC5 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC6 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC7 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC8 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC9 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`

# Priority
- Impact: High (user guidance and discoverability).
- Urgency: Medium-High (requested UX completion of onboarding flow).

# Notes
- Derived from `logics/request/req_099_onboarding_final_slide_for_key_settings_overview.md`.
- Orchestrated by `logics/tasks/task_077_super_orchestration_delivery_execution_for_req_097_and_req_098_with_validation_gates.md`.
