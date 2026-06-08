## item_530_bom_wire_termination_aggregation_key_change_from_type_plus_reference_to_reference_only - BOM wire-termination aggregation key change from type plus reference to reference only
> From version: 1.4.1
> Status: Done
> Understanding: 100%
> Confidence: 98%
> Progress: 100%
> Complexity: Medium
> Theme: BOM / Export / Data aggregation
> Reminder: Update status/understanding/confidence/progress and linked task references when you edit this doc.

# Problem
The current BOM `Wire terminations` aggregation key is `Type + Reference`, which splits rows that the clarified business rule now wants merged into one quantity by reference text alone.

# Scope
- In:
  - change aggregation from `type + reference` to normalized `reference` only;
  - count occurrences from connection and seal fields together;
  - preserve quantity increments per endpoint-side occurrence;
  - keep deterministic sorting by reference text.
- Out:
  - pricing for wire terminations;
  - changes to wire data storage;
  - catalog export changes.

# Acceptance criteria
- AC1: Each non-empty termination field occurrence contributes `+1` to its normalized reference text.
- AC2: Identical reference text from connection and seal fields collapses into one aggregate row.
- AC3: Begin/end repeated occurrences increment quantity independently.
- AC4: Empty/whitespace-only values remain ignored.
- AC5: Row ordering is deterministic.

# AC Traceability
- AC1/AC2/AC3/AC4/AC5 -> `src/app/lib/networkSummaryBomCsv.ts`.
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

# Priority
- Impact: High.
- Urgency: High.

# Notes
- Derived from `logics/request/req_108_bom_wire_termination_reference_aggregation_by_reference_text_across_connection_and_seal.md`.
- Orchestrated by `logics/tasks/task_087_req_108_bom_wire_termination_reference_only_aggregation_orchestration_and_delivery_control.md`.
- This item explicitly supersedes the delivered `type + reference` aggregation contract from item `520`.
- References:
  - `src/app/lib/networkSummaryBomCsv.ts`
  - `src/core/entities.ts`
  - `src/tests/network-summary-bom-csv.spec.ts`

# Delivery
- Wire termination aggregation now uses normalized reference text as the sole grouping key.
- Connection and seal occurrences with identical text now contribute to the same quantity row.
- Begin/end occurrences continue to count independently.

# Validation
- `npm test -- --run src/tests/network-summary-bom-csv.spec.ts src/tests/app.ui.network-summary-bom-export.spec.tsx`
- `npm run -s lint`
- `npm run -s typecheck`
