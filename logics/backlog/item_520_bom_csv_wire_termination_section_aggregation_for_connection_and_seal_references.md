## item_520_bom_csv_wire_termination_section_aggregation_for_connection_and_seal_references - BOM CSV wire-termination section aggregation for connection and seal references
> From version: 1.3.3
> Status: Ready
> Understanding: 99%
> Confidence: 96%
> Progress: 0%
> Complexity: High
> Theme: BOM / Export / Data aggregation
> Reminder: Update status/understanding/confidence/progress and linked task references when you edit this doc.

# Problem
The current `Network summary` BOM export counts only catalog-backed connectors/splices and omits termination references entered directly on wire endpoints, so the BOM does not reflect all modeled consumables.

# Scope
- In:
  - keep the current catalog-backed BOM section intact;
  - append a blank separator row plus a second section named `Wire terminations`;
  - aggregate non-empty endpoint-side termination references by `Type + Reference`;
  - keep `Connection` and `Seal` counts separate even when the raw value is identical;
  - export `Type`, `Reference`, `Quantity` columns for the second section;
  - ignore empty/whitespace-only values;
  - sort rows deterministically.
- Out:
  - pricing for termination rows in V1;
  - catalog-link redesign for wire termination references;
  - per-wire (non-aggregated) BOM rows.

# Acceptance criteria
- AC1: The same BOM CSV export includes a second `Wire terminations` section after the existing BOM content.
- AC2: The `Wire terminations` section exports `Type`, `Reference`, `Quantity` columns.
- AC3: Rows are aggregated by `Type + Reference`, with `Connection` and `Seal` kept distinct.
- AC4: Empty/whitespace-only wire-side termination values do not generate rows.
- AC5: Repeated begin/end occurrences increment quantity independently and deterministically.
- AC6: Existing catalog-backed BOM section remains non-regressed.

# AC Traceability
- AC1/AC2/AC3/AC4/AC5 -> `src/app/lib/networkSummaryBomCsv.ts`.
- AC6 -> `src/tests/network-summary-bom-csv.spec.ts` and `src/tests/app.ui.network-summary-bom-export.spec.tsx`.

# Priority
- Impact: High (core user-reported BOM completeness gap).
- Urgency: High.

# Notes
- Derived from `logics/request/req_106_bom_export_wire_termination_coverage_wire_csv_termination_columns_and_horizontal_label_offset_harmonization.md`.
- Orchestrated by `logics/tasks/task_085_req_106_export_analysis_navigation_and_render_readability_orchestration_and_delivery_control.md`.
- Real-data example from supplied debug JSON:
  - `Connection / 1108500 -> 6`
  - `Connection / 1107900 -> 4`
  - `Connection / 1108503 -> 4`
  - `Connection / 1708245 -> 2`
  - `Connection / 1108501 -> 2`
- Risks:
  - downstream consumers expecting a single rectangular BOM table may need adjustment for the second section;
  - future pricing expectations for termination references will require a separate catalog contract.
- References:
  - `src/app/lib/networkSummaryBomCsv.ts`
  - `src/core/entities.ts`
  - `src/tests/network-summary-bom-csv.spec.ts`
  - `src/tests/app.ui.network-summary-bom-export.spec.tsx`
