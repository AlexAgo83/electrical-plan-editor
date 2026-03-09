## item_519_bom_csv_utf8_compatibility_hardening_for_network_summary_export - BOM CSV UTF-8 compatibility hardening for Network summary export
> From version: 1.3.3
> Status: Ready
> Understanding: 98%
> Confidence: 96%
> Progress: 0%
> Complexity: Medium
> Theme: Export / BOM / Compatibility
> Reminder: Update status/understanding/confidence/progress and linked task references when you edit this doc.

# Problem
`Network summary` BOM export does not explicitly use the UTF-8 BOM download contract already applied to wire CSV exports, which creates risk of accented/special-character corruption in spreadsheet consumers.

# Scope
- In:
  - harden `Network summary` BOM CSV download path with explicit UTF-8 BOM compatibility behavior;
  - preserve existing BOM CSV escaping and formula-neutralization behavior;
  - add focused coverage proving accented/special characters remain readable in the exported BOM flow.
- Out:
  - BOM schema redesign;
  - non-BOM CSV export changes beyond shared utility reuse already required by this item.

# Acceptance criteria
- AC1: `Network summary` BOM CSV export preserves accented/special characters without mojibake.
- AC2: BOM export uses an explicit UTF-8-compatible browser download payload.
- AC3: Existing CSV escaping/formula-neutralization behavior remains unchanged.
- AC4: Regression tests cover BOM export encoding behavior.

# AC Traceability
- AC1/AC2 -> `src/app/AppController.tsx` and `src/app/lib/csv.ts`.
- AC3/AC4 -> `src/tests/csv.export.spec.ts` and/or `src/tests/app.ui.network-summary-bom-export.spec.tsx`.

# Priority
- Impact: High (data readability and trust).
- Urgency: High.

# Notes
- Derived from `logics/request/req_106_bom_export_wire_termination_coverage_wire_csv_termination_columns_and_horizontal_label_offset_harmonization.md`.
- Orchestrated by `logics/tasks/task_085_req_106_export_analysis_navigation_and_render_readability_orchestration_and_delivery_control.md`.
- Risks:
  - spreadsheet-client behavior may still differ if users bypass UTF-8-aware import paths;
  - touching shared CSV download behavior requires non-regression validation for existing exports.
- References:
  - `src/app/AppController.tsx`
  - `src/app/lib/csv.ts`
  - `src/tests/csv.export.spec.ts`
  - `src/tests/app.ui.network-summary-bom-export.spec.tsx`
