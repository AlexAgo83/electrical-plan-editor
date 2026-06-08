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
- request-AC1 -> This backlog slice. Evidence needed: Accented characters in wire CSV export are preserved correctly (no `Ã©`-style corruption).
- request-AC2 -> This backlog slice. Evidence needed: `Endpoints` column is no longer present in wire CSV exports.
- request-AC3 -> This backlog slice. Evidence needed: Wire CSV exports include explicit `Begin ID`, `Begin pin`, `End ID`, `End pin` columns.
- request-AC4 -> This backlog slice. Evidence needed: Begin/end split values are populated deterministically from wire endpoint A/B metadata, with `pin` values using `C{index}` / `P{index}` convention.
- request-AC5 -> This backlog slice. Evidence needed: Modeling and Analysis wire CSV exports share the same endpoint column schema.
- request-AC6 -> This backlog slice. Evidence needed: Existing CSV formula-injection neutralization remains non-regressed.
- request-AC7 -> This backlog slice. Evidence needed: `lint`, `typecheck`, and relevant tests pass after the change.
- request-AC1 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC2 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC3 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC4 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC5 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC6 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC7 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`

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
