## req_106_bom_export_wire_termination_coverage_wire_csv_termination_columns_and_horizontal_label_offset_harmonization - BOM export wire-termination coverage, wire CSV termination columns, and horizontal label-offset harmonization
> From version: 1.3.3
> Understanding: 100% (scope and post-delivery regression closure are now fully reflected)
> Confidence: 97%
> Complexity: High
> Theme: Export / BOM / UI
> Reminder: Update status/understanding/confidence and references when you edit this doc.

# Needs
- The `Network summary` BOM export currently does not count all user-entered termination data.
- Users report accented/special characters still causing issues in BOM export consumers.
- The wire CSV (`fil a fil`) export is missing explicit per-side termination metadata columns.
- In `Node analysis`, associated segments are visible but there is no direct `Go to` action from the table to open the corresponding segment in `Segment analysis`.
- In `Segment analysis`, traversing wires are visible but there is no direct `Go to` action from the table to open the corresponding wire in `Wire analysis`.
- In export cartouche metadata, identity fields such as `Author` can be truncated with ellipsis, reducing readability of the exported document.
- On-screen plan labels for horizontal and near-horizontal wires/segments sit too close to the wire stroke compared with the desired visual result.
- The on-screen plan and SVG/export output should follow the same spacing behavior instead of diverging.
- Export cartouche readability must also remain stable when the source SVG has no visible `.network-callout-frame`, avoiding dark/black fallback fills.

# Context
- Current BOM export aggregates only catalog-backed `connectors` and `splices`.
- Wire entities already persist per-side termination metadata:
  - `endpointAConnectionReference`
  - `endpointASealReference`
  - `endpointBConnectionReference`
  - `endpointBSealReference`
- Current wire CSV exports already use UTF-8 BOM hardening and explicit `Begin ID` / `Begin pin` / `End ID` / `End pin` columns, but they do not export the four termination-reference fields.
- BOM export still downloads through a path that does not explicitly opt into the same UTF-8 BOM compatibility contract used by wire CSV exports.
- The current segment label offset logic is fixed and minimal, which is acceptable in some cases but remains visually too tight for horizontal and near-horizontal segments in the plan.
- User-supplied debugging assets confirm the gaps with real project data:
  - supplied wire export workbook header currently ends at `Route mode` and does not include any begin/end connection or seal reference columns;
  - supplied SVG export truncates `Author: Paul Mondou` to `Author: Paul Mond...` in the cartouche;
  - supplied project JSON contains `15` wires with termination references, `18` non-empty connection-reference occurrences, and `0` non-empty seal-reference occurrences in that dataset;
  - the same dataset yields repeated connection references such as `1108500`, `1107900`, `1108503`, `1708245`, and `1108501`, which are suitable concrete aggregation examples;
  - the workbook named `BOM ex.xlsx` may correspond to a catalog export sheet (`catalog-export-*`) rather than the `Network summary` BOM export; treat it as contextual debugging material only, not as a locked scope input for this request.

# Objective
- Extend the existing BOM CSV export so it remains a single export but also counts wire termination references entered on wires.
- Harden BOM CSV download compatibility for accented/special characters in common spreadsheet consumers.
- Extend wire CSV exports with explicit begin/end connection/seal reference columns.
- Add a `Go to` action in `Node analysis` so users can open and select an associated segment directly in `Segment analysis`.
- Add a `Go to` action in `Segment analysis` so users can open and select a traversing wire directly in `Wire analysis`.
- Improve export cartouche metadata layout so ordinary identity values are not unnecessarily truncated in SVG/PNG output.
- Harmonize plan and SVG/export label-offset behavior so horizontal and near-horizontal segments render with slightly more distance from the stroke.

# Scope
- In:
  - BOM CSV UTF-8 compatibility hardening for accented/special characters;
  - BOM CSV extension with a second section for wire terminations inside the same exported file;
  - aggregation of non-empty wire-side `connection` and `seal` references;
  - wire CSV schema extension in both Modeling and Analysis wire exports;
  - `Node analysis` associated-segment table action to navigate to the corresponding segment analysis record;
  - `Segment analysis` traversing-wire table action to navigate to the corresponding wire analysis record;
  - export cartouche metadata readability/layout adjustment to reduce avoidable truncation on identity fields;
  - plan/SVG shared offset heuristic for horizontal and near-horizontal segment labels.
- Out:
  - pricing for wire termination references in V1;
  - catalog-link redesign for connection/seal references;
  - new export formats beyond the current CSV outputs;
  - free manual positioning UI for segment length labels.

# Locked execution decisions
- Decision 1: The existing `Network summary` BOM export remains a single CSV export and is not split into a second file.
- Decision 2: BOM export must use an explicit UTF-8-compatible download contract so accented/special characters remain readable in common spreadsheet tools.
- Decision 3: Wire termination references are exported in a dedicated second BOM section named `Wire terminations`.
- Decision 4: `Connection` and `Seal` references are counted separately even if the raw reference text is identical.
- Decision 5: Wire termination rows are aggregated by `type + reference`, not one row per wire instance.
- Decision 6: Only non-empty normalized references are counted in the `Wire terminations` section.
- Decision 7: V1 of the `Wire terminations` section exports quantity only and does not introduce pricing columns.
- Decision 8: Wire CSV exports must add four explicit columns:
  - `Begin connection ref`
  - `Begin seal ref`
  - `End connection ref`
  - `End seal ref`
- Decision 9: The same wire CSV column contract must apply in both Modeling and Analysis surfaces.
- Decision 10: `Node analysis` must expose a per-row `Go to` action for associated segments.
- Decision 11: Activating `Go to` from `Node analysis` switches to the `Segment` analysis sub-screen and selects the targeted segment.
- Decision 12: `Segment analysis` must expose a per-row `Go to` action for traversing wires.
- Decision 13: Activating `Go to` from `Segment analysis` switches to the `Wire` analysis sub-screen and selects the targeted wire.
- Decision 14: New analysis-table navigation actions must reuse the existing visual/action pattern already used by `Catalog analysis`:
  - dedicated `Actions` column,
  - `Go to` button,
  - open/navigation icon,
  - existing button classes/styles where applicable.
- Decision 15: Export cartouche identity metadata (`Network`, `Author`, `Code`, `Created`) should prefer readable full values over premature ellipsis when the export canvas has enough room.
- Decision 16: Adaptive cartouche layout (for example wider cartouche and/or controlled metadata wrapping) is preferred over default single-line truncation where feasible.
- Decision 17: Ellipsis remains an allowed fallback only for genuinely overlong values or constrained export sizes.
- Decision 18: Label spacing improvements must be shared by on-screen plan rendering and SVG/export output, with stronger offset for horizontal and near-horizontal segments.
- Decision 19: Near-horizontal detection must be explicit and deterministic (recommended tolerance: within `15` degrees of horizontal).

# Recommended implementation by problem slice
## Slice 1 - BOM export encoding hardening
- Reuse the CSV download compatibility path already applied to wire CSV exports.
- Ensure `Network summary` BOM export includes UTF-8 BOM in its browser download payload.
- Keep existing CSV escaping and formula-neutralization behavior unchanged.

## Slice 2 - BOM wire-termination section
- Keep the current catalog-backed BOM section unchanged as section 1.
- Append one blank separator row after the existing BOM totals/context rows.
- Append a second section marker row for `Wire terminations`.
- Append stable headers for the second section:
  - `Type`
  - `Reference`
  - `Quantity`
- Count occurrences from all active-network wires:
  - endpoint A connection reference
  - endpoint A seal reference
  - endpoint B connection reference
  - endpoint B seal reference
- Normalize empty/whitespace-only values as absent and skip them.
- Sort deterministically by `Type`, then `Reference`.

## Slice 3 - Wire CSV schema extension
- Add the four termination-reference columns to both wire CSV export entry points.
- Preserve current begin/end endpoint columns and current route-mode conditional column behavior.
- Export empty cells when a given wire side has no value.
- Keep UTF-8 BOM compatibility and current CSV safety behavior unchanged.

## Slice 4 - Horizontal label-offset harmonization
- Extract or centralize the segment-label offset heuristic so the same geometry rules apply to plan and SVG/export.
- Increase distance between the segment stroke and length/name labels when the segment is horizontal or near-horizontal.
- Keep deterministic rendering for non-horizontal segments and avoid introducing large jumps at neighboring angles.

## Slice 5 - Node analysis navigation to segment analysis
- Extend the `Node analysis` associated-segment table with an `Actions` column containing a `Go to` button.
- Reuse the existing analysis navigation contract already used by other `Go to` actions where possible.
- Reuse the existing visual pattern from `Catalog analysis` and other `Go to` buttons:
  - `validation-actions-cell`
  - `validation-row-go-to-button button-with-icon`
  - `<span className="action-button-icon is-open" aria-hidden="true" />`
- On activation, switch analysis sub-screen focus to `Segment` and select the targeted segment so its detailed `Segment analysis` panel opens immediately.
- Keep row sorting/filtering semantics unchanged apart from the new action column.
- If an associated-segment row somehow references a missing segment record, the action should be disabled rather than fail at runtime.

## Slice 6 - Segment analysis navigation to wire analysis
- Extend the `Segment analysis` traversing-wire table with an `Actions` column containing a `Go to` button.
- Reuse the existing analysis navigation contract already used by connector/splice occupancy actions where possible.
- Reuse the same visual pattern as `Catalog analysis` and other existing `Go to` actions:
  - `validation-actions-cell`
  - `validation-row-go-to-button button-with-icon`
  - `<span className="action-button-icon is-open" aria-hidden="true" />`
- On activation, switch analysis sub-screen focus to `Wire` and select the targeted wire so its detailed `Wire analysis` panel opens immediately.
- Keep row sorting/filtering semantics unchanged apart from the new action column.
- If a traversing-wire row somehow references a missing wire record, the action should be disabled rather than fail at runtime.

## Slice 7 - Export cartouche metadata readability
- Adjust export cartouche sizing/layout so identity metadata fields remain readable in ordinary real-world cases such as medium-length author names.
- Preferred behavior order:
  - widen cartouche within safe bounds when metadata requires it;
  - support controlled metadata wrapping if widening alone is insufficient;
  - use ellipsis only as a fallback when the export viewport is genuinely too constrained.
- Apply the same metadata readability rules to both SVG and PNG exports, since PNG is rendered from the prepared SVG content.
- Preserve current cartouche placement safety and keep the cartouche inside export bounds.
- Preserve a readable export cartouche palette even when the source SVG does not contain visible callout frames; fallback color sourcing must not degrade to an unreadable dark/black cartouche.

# Functional behavior contract
## A. BOM export compatibility
- BOM CSV export preserves accented/special characters without mojibake in common spreadsheet consumers.
- Existing BOM CSV structure for catalog-backed rows remains valid and deterministic.

## B. BOM wire-termination section
- The same BOM file contains:
  - existing catalog-backed BOM rows;
  - pricing/tax context rows that already belong to the current contract;
  - a separate `Wire terminations` section after a blank separator row.
- The `Wire terminations` section aggregates:
  - `Connection`
  - `Seal`
- Quantity counts each non-empty endpoint-side occurrence independently.
- Example:
  - if one wire has both `Begin connection ref = TERM-A` and `End connection ref = TERM-A`, quantity for `Connection / TERM-A` increases by `2`.
- Real-data example from the supplied dataset:
  - `Connection / 1108500 -> 6`
  - `Connection / 1107900 -> 4`
  - `Connection / 1108503 -> 4`
  - `Connection / 1708245 -> 2`
  - `Connection / 1108501 -> 2`

## C. Wire CSV schema
- Modeling and Analysis wire CSV exports include:
  - existing columns,
  - `Begin connection ref`,
  - `Begin seal ref`,
  - `End connection ref`,
  - `End seal ref`.
- Column ordering should remain stable and machine-friendly.
- Empty values export as blank cells.

## D. Label-offset rendering
- Horizontal and near-horizontal segment labels render slightly farther away from the wire stroke than today.
- The same spacing rule applies to the interactive plan and exported SVG path.
- Behavior remains deterministic and does not depend on viewport zoom artifacts alone.

## E. Export cartouche metadata readability
- Export cartouche identity fields such as `Network`, `Author`, `Code`, and `Created` remain readable without unnecessary truncation in normal export sizes.
- SVG and PNG exports follow the same cartouche metadata readability behavior.
- Ellipsis remains allowed only as a constrained fallback for genuinely overlong values or very small export sizes.
- Export cartouche background/text contrast remains readable even if export is triggered from a plan state without visible callout frames.

## F. Node analysis navigation
- `Node analysis` continues to show the list/table of associated segments for the selected node.
- Each associated-segment row exposes a `Go to` action in an `Actions` column.
- Activating `Go to` opens the `Segment` analysis sub-screen and selects the corresponding segment.
- The target segment becomes the active segment shown in `Segment analysis`.

## G. Segment analysis navigation
- `Segment analysis` continues to show the list/table of traversing wires for the selected segment.
- Each traversing-wire row exposes a `Go to` action in an `Actions` column.
- Activating `Go to` opens the `Wire` analysis sub-screen and selects the corresponding wire.
- The target wire becomes the active wire shown in `Wire analysis`.

# Acceptance criteria
- AC1: `Network summary` BOM CSV export uses a UTF-8-compatible download payload and preserves accented/special characters in common spreadsheet clients.
- AC2: Existing catalog-backed BOM rows remain exported in the same CSV without regression to current grouping/pricing behavior.
- AC3: The same BOM CSV export includes a second `Wire terminations` section after the existing BOM content.
- AC4: The `Wire terminations` section exports aggregated rows with headers `Type`, `Reference`, `Quantity`.
- AC5: `Connection` and `Seal` references are counted separately and aggregated by `type + reference`.
- AC6: Empty/whitespace-only wire-side termination references are ignored and do not create rows.
- AC7: Modeling wire CSV export includes `Begin connection ref`, `Begin seal ref`, `End connection ref`, `End seal ref`.
- AC8: Analysis wire CSV export includes the same four columns in the same schema order.
- AC9: Current wire CSV UTF-8 and CSV-safety behavior remains non-regressed.
- AC10: `Node analysis` associated-segment rows expose a `Go to` action for each segment.
- AC11: Activating `Go to` from an associated-segment row opens the `Segment` analysis sub-screen and selects the targeted segment.
- AC12: Missing-segment edge cases disable the `Go to` action safely instead of failing at runtime.
- AC13: `Segment analysis` traversing-wire rows expose a `Go to` action for each wire.
- AC14: Activating `Go to` from a traversing-wire row opens the `Wire` analysis sub-screen and selects the targeted wire.
- AC15: Missing-wire edge cases disable the `Go to` action safely instead of failing at runtime.
- AC16: Export cartouche identity metadata is no longer unnecessarily truncated for ordinary-length values such as medium-length author names when export size allows readable layout.
- AC17: SVG and PNG exports follow the same cartouche metadata readability behavior.
- AC17b: Export cartouche color fallback remains readable when no `.network-callout-frame` exists in the source SVG.
- AC18: Both new navigation tables use the existing `Actions` column + iconized `Go to` button pattern already used in `Catalog analysis`.
- AC19: On-screen plan rendering increases label distance from the stroke for horizontal and near-horizontal segments.
- AC20: Exported SVG follows the same horizontal/near-horizontal label-offset behavior as the on-screen plan.
- AC21: `logics_lint`, `lint`, `typecheck`, and relevant export/UI tests pass after implementation.

# Validation and regression safety
- `python3 logics/skills/logics-doc-linter/scripts/logics_lint.py`
- `npm run -s lint`
- `npm run -s typecheck`
- `npm run -s test:ci`
- targeted checks around:
  - BOM export accented/special character preservation;
  - BOM wire-termination aggregation with repeated begin/end values;
  - empty-value omission in `Wire terminations`;
  - Modeling wire CSV schema extension;
  - Analysis wire CSV schema extension;
  - export cartouche metadata readability with non-truncated identity rows where space allows;
  - export cartouche readable fallback colors when source callout frames are absent;
  - `Node analysis` row-level `Go to` navigation to `Segment analysis`;
  - disabled `Go to` behavior when a row references a missing segment;
  - `Segment analysis` row-level `Go to` navigation to `Wire analysis`;
  - disabled `Go to` behavior when a row references a missing wire;
  - plan/SVG label-offset parity for horizontal and near-horizontal segments.

# Definition of Ready (DoR)
- [x] Problem statement is explicit and user impact is clear.
- [x] Scope boundaries are explicit.
- [x] Acceptance criteria are testable.
- [x] Known schema and rendering decisions are locked for backlog promotion.

# Risks
- Mixing a second section into the same BOM CSV can surprise downstream tools that assume a single rectangular table.
- Future pricing of wire terminations will require a clearer catalog contract if quantity-only V1 becomes insufficient.
- Label-offset tuning can create visual regressions on diagonal segments if the angular transition is not smoothed carefully.

# Post-delivery closure note
- A late regression was identified after initial req_106 delivery: SVG export cartouche fill could degrade to a dark/black fallback when export was generated without visible source callout frames.
- Closure was completed by hardening the export style fallback in `src/app/components/network-summary/export/networkSummaryExport.ts` and adding dedicated regression coverage in `src/tests/app.ui.network-summary-bom-export.spec.tsx`.

# Backlog
- To create from this request:
  - `item_519_bom_csv_utf8_compatibility_hardening_for_network_summary_export.md`
  - `item_520_bom_csv_wire_termination_section_aggregation_for_connection_and_seal_references.md`
  - `item_521_wire_csv_begin_end_connection_and_seal_reference_columns_alignment.md`
  - `item_522_analysis_node_and_segment_go_to_action_navigation_alignment.md`
  - `item_523_network_summary_export_readability_hardening_for_cartouche_metadata_and_segment_label_offsets.md`
  - `item_524_req_106_export_analysis_navigation_and_render_regression_matrix_and_traceability_closure.md`

# Orchestration task
- `logics/tasks/task_085_req_106_export_analysis_navigation_and_render_readability_orchestration_and_delivery_control.md`

# References
- `src/app/lib/networkSummaryBomCsv.ts`
- `src/app/AppController.tsx`
- `src/app/lib/csv.ts`
- `src/app/components/workspace/ModelingSecondaryTables.tsx`
- `src/app/components/workspace/AnalysisWireWorkspacePanels.tsx`
- `src/app/components/workspace/AnalysisNodeSegmentWorkspacePanels.tsx`
- `src/app/components/workspace/CatalogAnalysisWorkspaceContent.tsx`
- `src/app/components/network-summary/export/networkSummaryExport.ts`
- `src/tests/app.ui.analysis-go-to-wire.spec.tsx`
- `src/tests/app.ui.analysis-go-to-segment.spec.tsx`
- `src/app/components/network-summary/graph/networkSummaryGraphModel.ts`
- `src/tests/network-summary-bom-csv.spec.ts`
- `src/tests/app.ui.network-summary-bom-export.spec.tsx`
- `src/tests/app.ui.list-ergonomics.spec.tsx`
- `src/tests/csv.export.spec.ts`
- `logics/request/req_056_bom_csv_export_from_network_summary_header_for_rendered_catalog_backed_components.md`
- `logics/request/req_091_wire_csv_export_encoding_hardening_and_endpoint_column_split_for_begin_end_id_pin.md`
- `logics/request/req_088_network_summary_export_quality_with_svg_default_and_png_switch_in_canvas_tools.md`
