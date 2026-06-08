## item_533_req_108_validation_matrix_and_closure_traceability - Req 108 validation matrix and closure traceability
> From version: 1.4.1
> Status: Done
> Understanding: 100%
> Confidence: 96%
> Progress: 100%
> Complexity: Low-Medium
> Theme: Quality / Validation / Traceability
> Reminder: Update status/understanding/confidence/progress and linked task references when you edit this doc.

# Problem
Req_108 changes a previously delivered BOM export contract. Without an explicit closure item, the supersession of `req_106` semantics and the updated validation evidence may remain fragmented.

# Scope
- In:
  - define the req_108 validation matrix;
  - capture proof that merged-by-reference aggregation is delivered and documented;
  - synchronize request, backlog, task, and changelog references at closure;
  - record residual compatibility assumptions around the removed `Type` column.
- Out:
  - new feature work beyond req_108 closure.

# Acceptance criteria
- AC1: Validation matrix explicitly covers req_108 acceptance criteria.
- AC2: Request/backlog/task traceability is coherent and auditable.
- AC3: Validation commands are executed and recorded at closure.
- AC4: Closure notes call out the supersession of the prior `req_106` `Type + Reference` contract.

# AC Traceability
- AC1 -> Functional guarantees are validated.
- AC2 -> Documentation chain is complete.
- AC3 -> Confidence is reproducible.
- AC4 -> Contract supersession is explicit.
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
- request-AC1 -> This backlog slice. Evidence needed: The BOM `Wire terminations` section counts occurrences from all four wire-side termination fields.
- request-AC2 -> This backlog slice. Evidence needed: Occurrences with identical normalized reference text are merged into a single exported row even when some came from `Connection` fields and others from `Seal` fields.
- request-AC3 -> This backlog slice. Evidence needed: The `Wire terminations` section exports one row per normalized reference text with a deterministic quantity.
- request-AC4 -> This backlog slice. Evidence needed: The `Type` column is removed from the `Wire terminations` section and replaced by a schema aligned with merged aggregation.
- request-AC5 -> This backlog slice. Evidence needed: Empty/whitespace-only termination references remain ignored.
- request-AC6 -> This backlog slice. Evidence needed: Existing catalog-backed BOM rows and pricing context rows remain non-regressed.
- request-AC7 -> This backlog slice. Evidence needed: Regression tests cover:
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
- Impact: Medium-High.
- Urgency: High.

# Notes
- Derived from `logics/request/req_108_bom_wire_termination_reference_aggregation_by_reference_text_across_connection_and_seal.md`.
- Orchestrated by `logics/tasks/task_087_req_108_bom_wire_termination_reference_only_aggregation_orchestration_and_delivery_control.md`.
- References:
  - `logics/backlog/item_530_bom_wire_termination_aggregation_key_change_from_type_plus_reference_to_reference_only.md`
  - `logics/backlog/item_531_bom_wire_termination_section_schema_alignment_without_type_column.md`
  - `logics/backlog/item_532_regression_coverage_for_mixed_connection_and_seal_reference_aggregation.md`
  - `logics/request/req_106_bom_export_wire_termination_coverage_wire_csv_termination_columns_and_horizontal_label_offset_harmonization.md`

# Delivery
- Req_108 validation and traceability are now closed across items `530` to `532`.
- The documentation chain explicitly records that req_108 supersedes the prior req_106 `Type + Reference` aggregation rule.

# Validation
- `npm test -- --run src/tests/network-summary-bom-csv.spec.ts src/tests/app.ui.network-summary-bom-export.spec.tsx`
- `npm run -s lint`
- `npm run -s typecheck`
