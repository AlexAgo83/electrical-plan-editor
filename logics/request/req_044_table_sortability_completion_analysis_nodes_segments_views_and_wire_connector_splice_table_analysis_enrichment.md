## req_044_table_sortability_completion_analysis_nodes_segments_views_and_wire_connector_splice_table_analysis_enrichment - Table Sortability Completion, Nodes/Segments Analysis Views, and Wire/Connector/Splice Table+Analysis Enrichment
> From version: 0.8.1
> Understanding: 98%
> Confidence: 95%
> Complexity: High
> Theme: Tabular UX Completion, Analysis Surface Expansion, and Wire Metadata Visibility Improvements
> Reminder: Update Understanding/Confidence and dependencies/references when you edit this doc.

# Needs
- Make **all columns of all tabular lists** sortable across the application (not only a subset of “core” columns).
- Add `manufacturerReference` visibility in `Connectors` and `Splices` tables with an abbreviated column header label.
- Add an `Analysis` version for `Nodes`, listing associated segments (including segment length).
- Add an `Analysis` version for `Segments`, listing wires that traverse each segment.
- Make `segmentId` editable (same user-facing capability as `nodeId`), using a safe rename strategy comparable to the `node ID` implementation.
- In `Wires` tables, move the `Section` column so it appears immediately before `Length`.
- In `Wires` analysis, assess and add additional useful information (minimum baseline to be defined during implementation and documented).
- In `Connectors` / `Splices` analysis, show wire color swatches next to the wire label (reusing the wire table color circle design).
- In cable callouts, display wire `section` after `length`.
- Refine `sub-network` display behavior for `(default)` values in tables and the 2D render info panel (hide noisy default labels and hide `Enable all` when no non-default sub-networks exist).

# Context
Recent deliveries introduced and/or expanded wire metadata and references:
- wire `sectionMm2` + default settings (`req_038`)
- wire colors (mono/bi-color via color catalog) (`req_039`)
- connector/splice `manufacturerReference` (`req_040`)
- wire per-side endpoint connection/seal references (`req_041`)
- filter bar standardization across multiple tables (`req_042`, phase-2 via `req_043` follow-up)

The data model now contains richer information than what several tables and analysis views currently expose. In parallel, sorting capabilities are inconsistent across tables/columns, which reduces discoverability and makes large datasets harder to inspect.

This request focuses on **surfacing and navigation quality**:
- complete sortability for tabular UIs
- better table column composition/order
- deeper analysis views for `Nodes` and `Segments`
- richer wire context in analysis/callouts
- better visual cable identification in connector/splice analysis via color swatches
- editable `segmentId` ergonomics aligned with the existing editable `nodeId` pattern
- reduced UI noise around `(default)` sub-network labels in tables and render2d controls

## Scope clarification (important)
- “All tables” means **tabular data lists/grids in workspace screens** (Modeling / Analysis / Network Scope / Validation and similar table-based panels).
- Non-tabular lists (for example checkbox lists in Settings portability panels) are out of scope unless they are rendered as actual sortable tables.
- If a panel has a table-like layout but currently lacks a stable column model, implementation may require defining one first; this must be documented.

## Recommended implementation strategy (baseline)
- Deliver in waves with checkpoint commits and targeted validations.
- Start with shared sorting infrastructure / reusable comparators and column metadata normalization.
- Then roll out per-panel sortability and new columns.
- Add `Nodes` / `Segments` analysis panels after sorting groundwork to maximize reuse.
- Finish with callout/analysis polish and regression coverage.

## Recommended UX decisions (baseline)
- `manufacturerReference` abbreviated table header:
  - recommended label: `Mfr Ref`
  - full label can remain in tooltip/title or inspector labels
- Wire color swatches in analysis (`Connectors` / `Splices`):
  - reuse the exact visual language used in wire tables (primary + optional secondary circle)
  - keep wire label text visible (do not replace text with swatches)
- Wires table column order:
  - `Section` should be placed immediately before `Length` in both Modeling and Analysis wire tables if both tables expose these columns
- Callout wire detail line:
  - append section after length (recommended formatting example: `240 mm • 0.5 mm²`)
- `Wires` analysis “add infos”:
  - minimum implementation should document exactly what was added (e.g. section, color, endpoint metadata, route details, references)
  - if multiple options exist, prefer information that improves troubleshooting and traceability without bloating the panel
- `segmentId` editability:
  - follow the same user expectations as `nodeId` (editable field in edit mode)
  - recommended implementation pattern: atomic rename action in store/reducer with reference remap, not delete/recreate
- `sub-network` default display:
  - if value is `(default)`, hide it in the table `Sub-network` column (render empty instead of literal default tag)
  - hide `(default)` from the render2d info/filter panel sub-network listing text
  - if there are no non-default sub-networks, hide the `Enable all` button in the render2d sub-network controls

## Objectives
- Provide consistent sort interactions on all tabular data surfaces.
- Expose newly stored connector/splice/wire metadata where users actually inspect lists and analysis results.
- Expand analysis capabilities to `Nodes` and `Segments` so users can inspect network relationships from more entry points.
- Improve wire readability in analysis and callouts (length + section, color swatches).
- Keep column ordering and labeling coherent across Modeling and Analysis views.
- Extend entity ID edit ergonomics by enabling safe `segmentId` editing.
- Reduce default sub-network label noise in table and render2d sub-network UI.

## Functional Scope
### A. Sortability completion for all table columns (highest priority)
- Ensure every column in every in-scope table-based panel is sortable.
- This includes columns that are currently often left unsortable:
  - derived/display columns
  - metadata columns
  - numeric columns
  - optional-value columns
  - badge-rendered/text-formatted columns (with deterministic underlying comparator logic)
- Sorting behavior requirements:
  - deterministic ascending/descending behavior
  - stable handling of empty/undefined values
  - no runtime crashes when sorting optional/mixed content
  - consistent sort indicators / interaction affordance
- If a column is intentionally unsortable for a valid reason (extremely rare), document the reason explicitly in implementation/closure notes.

### B. Connectors / Splices table enrichment (`manufacturerReference`) (high priority)
- Add a new visible column for `manufacturerReference` in:
  - `Connectors` table(s)
  - `Splices` table(s)
- Column header label should be abbreviated to keep table width reasonable.
  - recommended: `Mfr Ref`
- Column should:
  - render empty values cleanly (blank/placeholder semantics consistent with app)
  - be sortable
  - preserve existing row actions/selection/edit interactions
- If table width pressure becomes an issue, document column order/width tradeoffs made.

### C. `Nodes` Analysis view/panel (high priority)
- Add an `Analysis` surface for `Nodes` similar in spirit to existing `Connectors` / `Splices` / `Wires` analysis patterns.
- Core use case:
  - list/select nodes
  - inspect associated segments
  - show segment length for each associated segment
- Recommended baseline info in node analysis:
  - node identity (ID / label / kind)
  - associated segments list
  - per-segment length
  - total connected segment count (optional but useful)
- Table/list elements in the new panel must follow the sortability completion rule (sortable columns where applicable).

### D. `Segments` Analysis view/panel (high priority)
- Add an `Analysis` surface for `Segments`.
- Core use case:
  - list/select segments
  - inspect wires traversing the selected segment
- Recommended baseline info in segment analysis:
  - segment identity (ID, endpoints, optional sub-network tag)
  - list of traversing wires
  - useful wire identifiers (name and/or technical ID)
  - length context if helpful and low-risk
- Where wire colors are already available, surfacing them here is a plus if trivial, but the minimum required addition is the list of traversing wires.
- Table/list elements in the new panel must follow the sortability completion rule (sortable columns where applicable).

### E. Wires table column order + analysis enrichment (high priority)
- Reorder `Wires` table columns so `Section` is immediately before `Length`.
- Apply consistently to all relevant wire tables (Modeling and Analysis wire tables, where the columns are present).
- In `Wires` analysis, add additional useful information and document the final chosen scope.
  - Examples (non-prescriptive): section, colors, manufacturer-related endpoint metadata, per-side references, endpoint occupancy hints, route/segment count context
  - Avoid clutter; prefer high-value fields that support diagnostics and traceability
- Any newly surfaced wire-analysis fields should render optional values safely and remain theme-consistent.

### F. Segment ID editability (high priority)
- Enable editing of `segmentId` in the segment edit form, similar to the already delivered `nodeId` editability flow.
- Recommended implementation strategy (baseline):
  - add a dedicated atomic rename action for segments (e.g. `segment/rename`)
  - update all references that depend on segment IDs in one reducer transaction
  - avoid delete/recreate or multi-action rename flows that can break integrity, history, or selection state
- Preserve current edit/create ergonomics:
  - edit form allows changing the segment ID
  - collision/invalid-ID handling should be surfaced clearly (inline error recommended, store guard remains source of truth)
- Ensure local UI state and selection referencing the segment are remapped or safely refreshed after rename (same principle as `nodeId` rename handling).

### G. Connectors / Splices analysis wire color swatches (high priority)
- In `Connectors` and `Splices` analysis views, where wires are listed/identified:
  - add cable color swatches next to the wire label
  - reuse the design of the wire color circles already used in `Wires` table rendering
- Requirements:
  - preserve wire label text readability
  - support no-color wires gracefully (`No color` semantics / no swatch fallback)
  - support bi-color display (primary + secondary) if wire has both colors
- Visual implementation should align with existing wire table color rendering to avoid duplicate visual languages.

### H. Sub-network `(default)` display cleanup (medium-high priority)
- In table columns that display `Sub-network` values (at minimum `Segments`, and any other table where this column is present):
  - do not render the literal `(default)` value
  - render the cell as empty/blank (or equivalent no-value presentation consistent with the table design)
- In the render2d sub-network info/control panel:
  - do not display `(default)` as a listed sub-network label in the info panel area
  - preserve behavior for non-default sub-networks
- If the current network has no sub-networks other than `(default)`:
  - hide/remove the `Enable all` button from the render2d sub-network controls
  - avoid leaving awkward spacing/layout gaps
- Keep behavior deterministic when non-default sub-networks later appear (the `Enable all` button should return when relevant).

### I. Callout wire detail enrichment (`length` + `section`) (medium-high priority)
- In wire/cable callout UI (network summary callout / related cable callout surfaces), append the wire `section` after `length`.
- Formatting should remain concise and readable.
- Optional/legacy-safe behavior:
  - if `section` is absent in unexpected legacy edge-cases, do not crash; render length-only or safe fallback
- Keep callout layout stable (avoid overflow regressions where practical).

## Non-functional requirements
- Preserve existing selection, focus, row activation, and form-edit workflows while adding sortability and new columns.
- Maintain table performance and avoid expensive recomputation per render for sortable derived columns.
- Use deterministic comparator logic for formatted values (sort on normalized data, not visual label artifacts when possible).
- Keep header labels compact and readable on common widths.
- Reuse existing components/styles for wire color swatches and table cells when possible.
- Preserve theme compatibility (legacy + standalone themes) for newly added columns, badges, callout text, and analysis panels.
- Preserve data integrity and reference consistency when enabling `segmentId` rename (atomic rename + remap semantics).
- Keep `(default)` sub-network display cleanup consistent across table rendering and render2d controls (no mixed literal/hidden behavior in equivalent contexts).

## Validation and regression safety
- Recommended implementation validation per wave:
  - `npm run -s lint`
  - `npm run -s typecheck`
  - `npm run -s quality:ui-modularization`
  - targeted tests for touched tables/analysis panels
- Final closure validation (recommended):
  - `python3 logics/skills/logics-doc-linter/scripts/logics_lint.py`
  - `npm run -s quality:store-modularization`
  - `npm run -s test:ci`
  - `npm run -s build`
  - `npm run -s quality:pwa`
  - `npm run -s test:e2e`

## Acceptance criteria
- AC1: All columns in all in-scope tabular panels are sortable, with deterministic ascending/descending behavior and safe handling of empty/optional values.
- AC2: `Connectors` and `Splices` tables expose a sortable `manufacturerReference` column with an abbreviated header label (recommended `Mfr Ref`) and clean empty-value rendering.
- AC3: A `Nodes` analysis surface exists and lists associated segments for the selected node, including segment length.
- AC4: A `Segments` analysis surface exists and lists wires traversing the selected segment.
- AC5: In `Wires` tables, the `Section` column appears immediately before the `Length` column (where both columns are present).
- AC6: `segmentId` can be edited safely in the segment edit flow using a rename strategy that preserves data integrity and reference consistency (with clear collision/invalid handling).
- AC7: `Wires` analysis is enriched with additional information beyond the previous baseline, and the delivered additions are explicitly documented.
- AC8: `Connectors` / `Splices` analysis wire entries include wire color swatches reusing the wire-table visual design while preserving the wire label text.
- AC9: `(default)` sub-network is hidden in relevant `Sub-network` table cells and in the render2d sub-network info panel, and `Enable all` is hidden when no non-default sub-networks exist.
- AC10: Wire/cable callouts display wire `section` after `length` (with safe fallback behavior if section is absent).
- AC11: Regression coverage or documented targeted validation exists for sortability completion and the newly added analysis/table/callout/segment-rename/sub-network-display surfaces.

## Out of scope
- Redesigning all tables into a new table framework/component library.
- Advanced multi-column sort UX (shift-click secondary sort, saved sort presets) unless already trivial within the existing architecture.
- Mandatory export-column parity for every newly surfaced analysis field (unless implemented opportunistically and documented).
- Non-tabular settings lists/checklists.

# Backlog
- `logics/backlog/item_269_shared_table_sortability_completion_audit_and_column_comparator_rollout.md`
- `logics/backlog/item_270_connectors_splices_tables_manufacturer_reference_column_and_sortability.md`
- `logics/backlog/item_271_nodes_analysis_panel_with_associated_segments_and_length_listing.md`
- `logics/backlog/item_272_segments_analysis_panel_with_traversing_wires_listing.md`
- `logics/backlog/item_273_wires_table_column_order_section_before_length_and_analysis_info_enrichment.md`
- `logics/backlog/item_274_segment_id_editability_via_atomic_segment_rename_and_reference_remap.md`
- `logics/backlog/item_275_connectors_splices_analysis_wire_color_swatches_reusing_wire_table_design.md`
- `logics/backlog/item_276_callout_wire_length_and_section_display_enrichment.md`
- `logics/backlog/item_277_sub_network_default_display_cleanup_in_tables_and_render2d_controls.md`
- `logics/backlog/item_278_req_044_table_sortability_and_analysis_enrichment_closure_ci_build_and_ac_traceability.md`

# References
- `src/app/components/workspace/ModelingPrimaryTables.tsx`
- `src/app/components/workspace/ModelingSecondaryTables.tsx`
- `src/app/components/workspace/AnalysisConnectorWorkspacePanels.tsx`
- `src/app/components/workspace/AnalysisSpliceWorkspacePanels.tsx`
- `src/app/components/workspace/AnalysisWireWorkspacePanels.tsx`
- `src/app/components/workspace/AnalysisWorkspaceContent.tsx`
- `src/app/components/workspace/AnalysisWorkspaceContent.types.ts`
- `src/app/hooks/useEntityListModel.ts`
- `src/app/hooks/controller/useAppControllerModelingAnalysisScreenDomains.tsx`
- `src/app/lib/app-utils-networking.ts`
- `src/app/styles/tables.css`
- `src/tests/app.ui.list-ergonomics.spec.tsx`
- `src/tests/app.ui.navigation-canvas.spec.tsx`
