## req_108_bom_wire_termination_reference_aggregation_by_reference_text_across_connection_and_seal - BOM wire-termination aggregation by reference text across connection and seal
> From version: 1.4.1
> Status: Draft
> Understanding: 100%
> Confidence: 98%
> Complexity: Medium
> Theme: Export / BOM / wire terminations
> Reminder: Update status/understanding/confidence and references when you edit this doc.

# Needs
- The current BOM `Wire terminations` contract distinguishes `Connection` and `Seal` rows, which does not match the clarified user expectation.
- Users want one BOM line per reference text, aggregated by quantity, regardless of whether the occurrence came from a connection field or a seal field.
- The exported result must still count both connection-side and seal-side occurrences from wires.

# Context
- Wire entities store four independent termination-reference inputs:
  - `endpointAConnectionReference`
  - `endpointASealReference`
  - `endpointBConnectionReference`
  - `endpointBSealReference`
- `req_106` introduced BOM coverage for wire terminations and locked a `Type + Reference + Quantity` section with separate `Connection` and `Seal` rows.
- User clarification now changes that business rule:
  - count both `Connection` and `Seal` occurrences;
  - aggregate by reference text only;
  - if the same text appears in a connection field and in a seal field, merge them into one quantity.
- Terminology clarification:
  - `fil a fil` means the CSV export of the `Wires` list;
  - this request is about the `Network summary` BOM export aggregation contract, not about renaming that wire CSV feature.

# Objective
- Replace the current BOM wire-termination aggregation rule with a single aggregation key based on normalized reference text only.
- Keep BOM export as a single CSV file with the existing catalog-backed section unchanged.
- Make the `Wire terminations` section directly usable as a quantity summary for procurement/review without forcing users to reconcile `Connection` and `Seal` duplicates manually.

# Scope
- In:
  - update BOM wire-termination aggregation from `type + reference` to `reference` only;
  - continue counting occurrences from all four wire-side reference fields;
  - revise exported `Wire terminations` section headers to match the merged aggregation model;
  - add/update regression coverage for merged connection/seal cases.
- Out:
  - pricing of wire terminations;
  - redesign of catalog export;
  - changes to wire entity storage fields;
  - changes to the meaning of `fil a fil` / wire CSV export beyond terminology alignment.

# Locked execution decisions
- Decision 1: The `Network summary` BOM export remains a single CSV export.
- Decision 2: The existing catalog-backed BOM section remains unchanged.
- Decision 3: The BOM `Wire terminations` section must count non-empty occurrences from:
  - endpoint A connection reference;
  - endpoint A seal reference;
  - endpoint B connection reference;
  - endpoint B seal reference.
- Decision 4: Aggregation key is normalized reference text only.
- Decision 5: `Connection` and `Seal` are not exported as separate rows when the normalized text is the same.
- Decision 6: If the same reference text appears in both connection and seal fields, all occurrences are merged into one quantity.
- Decision 7: Empty or whitespace-only values are ignored.
- Decision 8: Sorting remains deterministic by reference text.
- Decision 9: This request supersedes the `req_106` decisions that required separation by `Type` and aggregation by `type + reference`.

# Functional behavior contract
## A. Aggregation semantics
- Each non-empty wire-side termination reference contributes `+1` to its normalized reference text.
- Source field does not matter for grouping:
  - connection fields count;
  - seal fields count;
  - both feed the same aggregate bucket when the text matches.
- Example:
  - wire 1: `Begin connection ref = 1108503`
  - wire 2: `End seal ref = 1108503`
  - wire 3: `End connection ref = 1108503`
  - exported BOM row: `1108503 / 3`

## B. CSV section shape
- The BOM file still appends a dedicated `Wire terminations` section after the existing BOM totals/context rows.
- The section now represents one line per reference text.
- Recommended headers:
  - `Reference`
  - `Quantity`
- The previous `Type` column must be removed from this section because it no longer reflects the grouping model.

## C. Normalization rules
- Trim leading/trailing whitespace before aggregation.
- Empty strings after trim do not create rows.
- Matching is text-based after normalization; no catalog lookup or semantic typing is introduced in V1.

# Acceptance criteria
- AC1: The BOM `Wire terminations` section counts occurrences from all four wire-side termination fields.
- AC2: Occurrences with identical normalized reference text are merged into a single exported row even when some came from `Connection` fields and others from `Seal` fields.
- AC3: The `Wire terminations` section exports one row per normalized reference text with a deterministic quantity.
- AC4: The `Type` column is removed from the `Wire terminations` section and replaced by a schema aligned with merged aggregation.
- AC5: Empty/whitespace-only termination references remain ignored.
- AC6: Existing catalog-backed BOM rows and pricing context rows remain non-regressed.
- AC7: Regression tests cover:
  - connection-only duplicates;
  - seal-only duplicates;
  - mixed connection/seal duplicates collapsing into one row;
  - empty-value ignoring behavior.

# Validation and regression safety
- `python3 logics/skills/logics-doc-linter/scripts/logics_lint.py`
- `npm run -s lint`
- `npm run -s typecheck`
- `npm test -- --run src/tests/network-summary-bom-csv.spec.ts src/tests/app.ui.network-summary-bom-export.spec.tsx`
- targeted checks around:
  - one-row-per-reference export semantics;
  - mixed connection/seal duplicate aggregation;
  - BOM CSV section header contract.

# Definition of Ready (DoR)
- [x] User clarification is translated into an explicit export contract.
- [x] Conflict with the previous `req_106` contract is called out explicitly.
- [x] Acceptance criteria are testable.
- [x] Scope boundaries are explicit.

# Risks
- Downstream consumers expecting the previous `Type` column will need to adapt to the new BOM section schema.
- Historical screenshots/tests based on separate `Connection` / `Seal` rows will need coordinated updates.
- If users later need source provenance again, a merged BOM section may need a richer follow-up design than V1 quantity-only output.

# Backlog
- To create from this request:
  - `item_530_bom_wire_termination_aggregation_key_change_from_type_plus_reference_to_reference_only.md`
  - `item_531_bom_wire_termination_section_schema_alignment_without_type_column.md`
  - `item_532_regression_coverage_for_mixed_connection_and_seal_reference_aggregation.md`
  - `item_533_req_108_validation_matrix_and_closure_traceability.md`

# References
- `logics/request/req_041_wire_endpoint_connection_reference_and_seal_reference_per_side.md`
- `logics/request/req_106_bom_export_wire_termination_coverage_wire_csv_termination_columns_and_horizontal_label_offset_harmonization.md`
- `src/core/entities.ts`
- `src/app/lib/networkSummaryBomCsv.ts`
- `src/tests/network-summary-bom-csv.spec.ts`
- `src/tests/app.ui.network-summary-bom-export.spec.tsx`
