## item_411_app_controller_decomposition_continuation_by_orchestration_slice_extraction - App controller decomposition continuation by orchestration slice extraction
> From version: 0.9.17
> Status: Ready
> Understanding: 90%
> Confidence: 85%
> Progress: 0%
> Complexity: High
> Theme: Architecture
> Reminder: Update status/understanding/confidence/progress and linked task references when you edit this doc.

# Problem
`src/app/AppController.tsx` remains large and multi-responsibility, which increases review cost, slows debugging, and raises regression risk when adding or changing UI orchestration behavior.

# Scope
- In:
  - extract at least one cohesive orchestration slice/hook from `AppController` with stable boundaries;
  - prioritize `modals + save/export actions` as the first extraction slice;
  - keep behavior parity for shortcuts, modal flow, export/save interactions, and current user contracts;
  - reduce controller responsibility surface in a measurable way (LOC or responsibility split).
- Out:
  - redesign of feature behavior;
  - domain/store architecture rewrite beyond the selected orchestration slice.

# Acceptance criteria
- AC1: One or more cohesive orchestration responsibilities are extracted from `AppController` into dedicated module(s)/hook(s), starting with `modals + save/export actions`.
- AC2: `AppController` size/concern surface is measurably reduced without behavior change.
- AC3: Existing UI contracts for impacted flows remain unchanged and validated by tests/checks.
- AC4: Lint/typecheck/UI CI pass after decomposition changes.

# AC Traceability
- AC1 -> New orchestration module/hook files introduced and integrated. Proof: pending.
- AC2 -> `AppController` diff shows responsibility reduction. Proof: pending.
- AC3 -> Impacted flows validated via targeted tests/manual checks. Proof: pending.
- AC4 -> `lint`, `typecheck`, `test:ci:ui` evidence captured. Proof: pending.

# Priority
- Impact:
  - High (maintainability and regression risk reduction in core controller).
- Urgency:
  - Medium-high (continuation work should track current delivery wave).

# Notes
- Derived from `logics/request/req_079_ui_reliability_debt_reduction_and_app_controller_decomposition_continuation.md`.
- Blocks: `task_072`.
- Related ACs: `AC4`, `AC5`, `AC6` from `req_079`.
