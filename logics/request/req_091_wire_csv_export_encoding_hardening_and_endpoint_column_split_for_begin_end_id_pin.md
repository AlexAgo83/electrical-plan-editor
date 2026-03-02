## req_091_wire_csv_export_encoding_hardening_and_endpoint_column_split_for_begin_end_id_pin - Wire CSV export encoding hardening and endpoint column split for begin/end ID + pin
> From version: 0.9.18
> Status: Draft
> Understanding: 100%
> Confidence: 97%
> Complexity: Medium
> Theme: UI
> Reminder: Update status/understanding/confidence and references when you edit this doc.

# Needs
- Fix CSV export encoding issues on wire lists so accented characters are preserved (for example `é`, `è`, `à`).
- Remove the aggregated `Endpoints` column from wire CSV exports.
- Split begin/end endpoint details into explicit columns with ID and pin information.

# Context
- Users report garbled accented characters in wire CSV export output (example symptom: `Ã©pissure`).
- Current wire CSV exports include a dense `Endpoints` string plus `Begin` and `End`, which remains ambiguous for downstream usage and filtering.
- Users need clearer, machine-friendly wire endpoint columns for `Begin` and `End`.

# Objective
- Make wire CSV exports robust for accented text in common spreadsheet tooling.
- Improve endpoint readability and data usability by replacing packed endpoint strings with explicit begin/end columns.
- Keep wire CSV export behavior deterministic across Modeling and Analysis surfaces.

# Scope
- In:
  - apply encoding hardening for wire CSV export to preserve accented characters in target clients;
  - remove `Endpoints` column from wire CSV exports;
  - replace current begin/end fields with explicit split columns for both sides:
    - begin ID + begin pin,
    - end ID + end pin;
  - align changes across both wire CSV export entry points (`Modeling` and `Analysis`);
  - update regression tests for CSV content shape and encoding behavior.
- Out:
  - redesign of wire tables UI columns in the app viewport;
  - changes to wire domain endpoint model;
  - non-wire CSV export schema redesign.

# Locked execution decisions
- Decision 1: The request targets wire CSV exports specifically (Modeling + Analysis wire list exports).
- Decision 2: Accented-character compatibility must be explicitly handled at CSV download generation level.
- Decision 3: `Endpoints` aggregated CSV column is removed from wire exports.
- Decision 4: Begin/end endpoint data is exported as split ID/pin columns (structured and sortable).
- Decision 5: Column schema must stay consistent between Modeling and Analysis wire CSV exports.
- Decision 6: `Begin pin` / `End pin` values follow current endpoint slot convention (`C{index}` for connector cavity, `P{index}` for splice port).

# Functional behavior contract
- Encoding:
  - wire CSV exports preserve accented strings without mojibake in common CSV consumers.
  - export payload declares/encodes UTF-8 compatibility robustly (including spreadsheet compatibility path where required).
- Columns:
  - old `Endpoints` combined column is removed;
  - wire CSV includes explicit begin/end columns:
    - `Begin ID`,
    - `Begin pin`,
    - `End ID`,
    - `End pin`;
  - pin values use the endpoint slot convention:
    - connector cavity -> `C{index}`,
    - splice port -> `P{index}`;
  - other existing wire CSV columns remain as-is unless required for this split.
- Consistency:
  - same column contract is used in both `modeling-wires` and `analysis-wires` CSV exports.

# Acceptance criteria
- AC1: Accented characters in wire CSV export are preserved correctly (no `Ã©`-style corruption).
- AC2: `Endpoints` column is no longer present in wire CSV exports.
- AC3: Wire CSV exports include explicit `Begin ID`, `Begin pin`, `End ID`, `End pin` columns.
- AC4: Begin/end split values are populated deterministically from wire endpoint A/B metadata, with `pin` values using `C{index}` / `P{index}` convention.
- AC5: Modeling and Analysis wire CSV exports share the same endpoint column schema.
- AC6: Existing CSV formula-injection neutralization remains non-regressed.
- AC7: `lint`, `typecheck`, and relevant tests pass after the change.

# Validation and regression safety
- `npm run -s lint`
- `npm run -s typecheck`
- `npm run -s test:ci`
- targeted checks around:
  - wire CSV column headers and row content (modeling + analysis)
  - accented text export behavior
  - CSV formula neutralization non-regression
- `python3 logics/skills/logics-doc-linter/scripts/logics_lint.py`

# Definition of Ready (DoR)
- [x] Problem statement is explicit and user impact is clear.
- [x] Scope boundaries (in/out) are explicit.
- [x] Acceptance criteria are testable.
- [x] Dependencies and known risks are listed.

# Risks
- Spreadsheet-client behavior for encoding can vary; compatibility may require explicit BOM strategy in addition to charset.
- Renaming/splitting columns can affect downstream scripts relying on prior `Endpoints`/`Begin`/`End` shape.
- Partial rollout across one export surface only would create schema drift and confusion.

# Backlog
- To create from this request:
  - `item_457_wire_csv_export_utf8_accent_compatibility_hardening_and_download_contract.md`
  - `item_458_wire_csv_remove_endpoints_column_and_define_begin_end_id_pin_schema.md`
  - `item_459_modeling_analysis_wire_csv_schema_alignment_and_regression_tests.md`
  - `item_460_req_091_wire_csv_export_validation_matrix_and_closure_traceability.md`

# References
- `src/app/components/workspace/AnalysisWireWorkspacePanels.tsx`
- `src/app/components/workspace/ModelingSecondaryTables.tsx`
- `src/app/hooks/useWireEndpointDescriptions.ts`
- `src/app/lib/csv.ts`
- `src/tests/csv.export.spec.ts`
- `src/tests/app.ui.list-ergonomics.spec.tsx`
- `logics/request/req_047_table_readability_endpoint_column_split_analysis_wire_name_subrows_and_filtered_entry_count_footers.md`
