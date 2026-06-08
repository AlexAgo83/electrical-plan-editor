## item_520_bom_csv_wire_termination_section_aggregation_for_connection_and_seal_references - BOM CSV wire-termination section aggregation for connection and seal references
> From version: 1.3.3
> Status: Done
> Understanding: 100%
> Confidence: 97%
> Progress: 100%
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
- request-AC1 -> This backlog slice. Evidence needed: `Network summary` BOM CSV export uses a UTF-8-compatible download payload and preserves accented/special characters in common spreadsheet clients.
- request-AC2 -> This backlog slice. Evidence needed: Existing catalog-backed BOM rows remain exported in the same CSV without regression to current grouping/pricing behavior.
- request-AC3 -> This backlog slice. Evidence needed: The same BOM CSV export includes a second `Wire terminations` section after the existing BOM content.
- request-AC4 -> This backlog slice. Evidence needed: The `Wire terminations` section exports aggregated rows with headers `Type`, `Reference`, `Quantity`.
- request-AC5 -> This backlog slice. Evidence needed: `Connection` and `Seal` references are counted separately and aggregated by `type + reference`.
- request-AC6 -> This backlog slice. Evidence needed: Empty/whitespace-only wire-side termination references are ignored and do not create rows.
- request-AC7 -> This backlog slice. Evidence needed: Modeling wire CSV export includes `Begin connection ref`, `Begin seal ref`, `End connection ref`, `End seal ref`.
- request-AC8 -> This backlog slice. Evidence needed: Analysis wire CSV export includes the same four columns in the same schema order.
- request-AC9 -> This backlog slice. Evidence needed: Current wire CSV UTF-8 and CSV-safety behavior remains non-regressed.
- request-AC10 -> This backlog slice. Evidence needed: `Node analysis` associated-segment rows expose a `Go to` action for each segment.
- request-AC11 -> This backlog slice. Evidence needed: Activating `Go to` from an associated-segment row opens the `Segment` analysis sub-screen and selects the targeted segment.
- request-AC12 -> This backlog slice. Evidence needed: Missing-segment edge cases disable the `Go to` action safely instead of failing at runtime.
- request-AC13 -> This backlog slice. Evidence needed: `Segment analysis` traversing-wire rows expose a `Go to` action for each wire.
- request-AC14 -> This backlog slice. Evidence needed: Activating `Go to` from a traversing-wire row opens the `Wire` analysis sub-screen and selects the targeted wire.
- request-AC15 -> This backlog slice. Evidence needed: Missing-wire edge cases disable the `Go to` action safely instead of failing at runtime.
- request-AC16 -> This backlog slice. Evidence needed: Export cartouche identity metadata is no longer unnecessarily truncated for ordinary-length values such as medium-length author names when export size allows readable layout.
- request-AC17 -> This backlog slice. Evidence needed: SVG and PNG exports follow the same cartouche metadata readability behavior.
- request-AC18 -> This backlog slice. Evidence needed: Both new navigation tables use the existing `Actions` column + iconized `Go to` button pattern already used in `Catalog analysis`.
- request-AC19 -> This backlog slice. Evidence needed: On-screen plan rendering increases label distance from the stroke for horizontal and near-horizontal segments.
- request-AC20 -> This backlog slice. Evidence needed: Exported SVG follows the same horizontal/near-horizontal label-offset behavior as the on-screen plan.
- request-AC21 -> This backlog slice. Evidence needed: `logics_lint`, `lint`, `typecheck`, and relevant export/UI tests pass after implementation.
- request-AC1 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC2 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC3 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC4 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC5 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC6 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC7 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC8 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC9 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC10 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC11 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC12 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC13 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC14 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC15 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC16 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC17 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC18 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC19 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC20 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC21 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`

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

# Delivery
- The BOM CSV now appends a `Wire terminations` section in the same export file.
- `Connection` and `Seal` references are aggregated independently by `Type + Reference`.
- Empty endpoint-side termination values are ignored and repeated begin/end occurrences increment quantity independently.

# Validation
- `npm test -- --run src/tests/network-summary-bom-csv.spec.ts src/tests/app.ui.network-summary-bom-export.spec.tsx`
- `npm run lint`
- `npm run typecheck`
