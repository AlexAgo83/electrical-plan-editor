## item_410_ui_timeout_debt_governance_and_rationale_enforcement - UI timeout debt governance and rationale enforcement
> From version: 0.9.17
> Status: Ready
> Understanding: 90%
> Confidence: 85%
> Progress: 0%
> Complexity: Medium
> Theme: Quality
> Reminder: Update status/understanding/confidence/progress and linked task references when you edit this doc.

# Problem
UI tests currently rely on targeted `10_000ms` timeout exceptions as temporary debt. Without explicit governance, timeout inflation can spread and hide real reliability defects, reducing trust in CI outcomes.

# Scope
- In:
  - define and enforce a clear rationale policy for any UI timeout > default budget;
  - inventory current `10_000ms` exceptions and classify them (`remove`, `keep-with-rationale`, `rework-needed`);
  - document where/why an exception remains and how it will be retired.
- Out:
  - blanket timeout reduction campaign disconnected from root-cause stabilization;
  - introducing additional timeout debt without written justification.

# Acceptance criteria
- AC1: A timeout governance rule is documented and applied to UI test changes in this scope.
- AC2: Existing targeted timeout exceptions are inventoried with explicit status (`remove`/`keep`) and rationale.
- AC3: No new timeout increase lands in scope without a written technical rationale.
- AC4: Any remaining timeout exception includes both a technical rationale and a retirement/exit plan.
- AC5: Governance evidence is linked in task/report notes for auditability.

# AC Traceability
- AC1 -> Governance rule and usage notes are documented. Proof: pending.
- AC2 -> Exception inventory and classification are tracked. Proof: pending.
- AC3 -> Diffs show no untracked timeout increases. Proof: pending.
- AC4 -> Exception list includes rationale + exit plan per remaining exception. Proof: pending.
- AC5 -> Task/report references include rationale links. Proof: pending.

# Priority
- Impact:
  - High (CI signal quality and reliability debt control).
- Urgency:
  - High (must prevent debt growth during ongoing implementation work).

# Notes
- Derived from `logics/request/req_079_ui_reliability_debt_reduction_and_app_controller_decomposition_continuation.md`.
- Blocks: `task_072`.
- Related ACs: `AC2`, `AC3`, `AC6` from `req_079`.
