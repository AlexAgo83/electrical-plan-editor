## item_402_csv_export_formula_injection_neutralization_contract - CSV export formula-injection neutralization contract
> From version: 0.9.16
> Understanding: 96%
> Confidence: 93%
> Progress: 0%
> Complexity: Medium
> Theme: Spreadsheet-export safety hardening
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
CSV export currently risks spreadsheet formula execution when cell values start with formula-trigger prefixes (`=`, `+`, `-`, `@`).

# Scope
- In:
  - Neutralize formula-leading values in CSV serialization.
  - Keep normal text/number readability and backward-compatible output.
  - Ensure neutralization policy is deterministic and covered by tests.
- Out:
  - CSV dialect redesign.
  - New export format work.

# Acceptance criteria
- Formula-leading values are neutralized in exported CSV.
- Regular non-formula values remain readable and unchanged in intent.
- Regression tests cover all targeted trigger prefixes.

# Priority
- Impact: Medium-High.
- Urgency: Medium.

# Notes
- Dependencies: `req_077`.
- Blocks: `item_404`.
- Related AC: AC5.
- References:
  - `logics/request/req_077_review_followups_persistence_version_sync_import_normalization_and_export_hardening.md`
  - `src/app/lib/csv.ts`
  - `src/tests/csv.export.spec.ts`

