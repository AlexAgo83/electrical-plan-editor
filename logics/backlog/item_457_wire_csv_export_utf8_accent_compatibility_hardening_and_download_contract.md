## item_457_wire_csv_export_utf8_accent_compatibility_hardening_and_download_contract - wire csv export utf8 accent compatibility hardening and download contract
> From version: 0.9.18
> Status: Done
> Understanding: 100%
> Confidence: 95%
> Progress: 100%
> Complexity: Medium
> Theme: UI
> Reminder: Update status/understanding/confidence/progress and linked task references when you edit this doc.

# Problem
Users report accented-character corruption (`Ã©pissure`) in wire CSV exports. Current download contract needs explicit compatibility hardening for common spreadsheet consumers.

# Scope
- In:
  - harden CSV download encoding contract for UTF-8 accent compatibility.
  - ensure wire CSV exports preserve accented characters in common clients.
  - keep existing CSV escaping and formula-injection neutralization behavior.
  - add focused tests for encoding behavior.
- Out:
  - non-wire export schema modifications.

# Acceptance criteria
- AC1: Wire CSV export preserves accented strings without mojibake.
- AC2: Export download contract explicitly supports UTF-8-compatible consumption path.
- AC3: CSV formula-neutralization behavior remains unchanged and tested.
- AC4: Regression tests cover accent and safety behavior.

# AC Traceability
- AC1/AC2 -> `src/app/lib/csv.ts` blob/content generation contract.
- AC3/AC4 -> `src/tests/csv.export.spec.ts`.

# Priority
- Impact: High (data correctness and trust).
- Urgency: High (user-visible defect).

# Notes
- Risks:
  - client differences (Excel/Sheets/LibreOffice) may require explicit BOM strategy.
  - touching CSV utility affects all exports, not only wires.
- References:
  - `logics/request/req_091_wire_csv_export_encoding_hardening_and_endpoint_column_split_for_begin_end_id_pin.md`
  - `src/app/lib/csv.ts`
  - `src/tests/csv.export.spec.ts`
