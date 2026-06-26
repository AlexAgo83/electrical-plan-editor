## req_155_connector_synthesis_parity - Connector synthesis: parity with splice (add section, color, twist, tag)
> From version: 1.16.10
> Schema version: 1.0
> Status: Done
> Understanding: 95
> Confidence: 92
> Complexity: Low
> Theme: analysis
> Reminder: Update status/understanding/confidence and linked backlog/task references when you edit this doc.

# Needs
- In a connector's synthesis, get closer to the level of information available on a splice — notably by adding the wire **section**.
- If visible-column selection is available, this information should be toggleable on/off.
- Goal: more homogeneous and more usable synthesis.

# Context
- Connector synthesis today (`AnalysisConnectorWorkspacePanels.tsx`, table ~lines 757-809) shows: Wire, Technical ID, Local way, Destination, Length (mm).
- Splice synthesis (`AnalysisSpliceWorkspacePanels.tsx`, table ~lines 1019-1264) shows additionally: **Section (mm²)**, plus "Covered from splice (mm)" and "Covered from remote endpoint (mm)" — the two covered-length columns are splice-specific semantics with no connector equivalent (out of scope here).
- The wire's `sectionMm2` is a direct field on the Wire entity (`src/core/entities.ts:307`) and the full Wire object is already in the connector synthesis row-building context (`src/app/hooks/useEntityListModel.ts:79-109`) — it is simply not extracted yet.
- Row types in `src/app/types/app-controller.ts`: `ConnectorSynthesisRow` (lacks sectionMm2) vs `SpliceSynthesisRow` (has sectionMm2). Sorting via `sortByTableColumns()`; color marker via `renderWireColorPrefixMarker()` (already used in splice).

# Decisions
- Add to connector synthesis: **Section (mm²)**, **Color**, **Twist group**, **Functional tag** — wire fields already rendered elsewhere, for a genuinely homogeneous synthesis.
- Exclude the splice-only covered-length columns (no connector equivalent).
- **Independent of [[req_153_configurable_table_columns]]** (clarified by research 2026-06-26): the analysis synthesis tables (`AnalysisConnectorWorkspacePanels.tsx`) are SEPARATE components from the 5 modeling tables req_153 refactors — no shared column-id model, no shared rendering helpers. req_153 explicitly scopes out the synthesis tables. So this slice renders the new columns **unconditionally**; per-column toggling of synthesis columns is a future, separate extension, NOT a dependency here.
- The new wire fields are not yet propagated into the synthesis row: `ConnectorSynthesisRow` (`app-controller.ts:21-29`) and the builder (`useEntityListModel.ts:79-109`) carry only 7 core fields today; `sectionMm2`, `twistGroupLabel`, `functionalDomainTag` (Wire entity) must be added to both.

# Acceptance criteria
- AC1: The connector synthesis table shows a Section (mm²) column populated from `wire.sectionMm2`, plus Color, Twist group, and Functional tag columns.
- AC2: New columns are sortable (sort field type extended; `sortByTableColumns()` handles them).
- AC3: CSV export of the connector synthesis includes the new columns in matching order.
- AC4: Color rendering reuses the existing `renderWireColorPrefixMarker()` helper for consistency with other wire displays.
- AC5: The new synthesis columns render unconditionally (the analysis synthesis tables are independent of the req_153 modeling-table column model; per-synthesis-column toggling is out of scope, a separate future extension).

# Definition of Ready (DoR)
- [x] Problem statement is explicit and user impact is clear.
- [x] Scope boundaries (in/out) are explicit.
- [x] Acceptance criteria are testable.
- [x] Dependencies and known risks are listed.

# Scope
- In: extend `ConnectorSynthesisRow` + connector row builder + connector synthesis table (header/body/sort) + CSV export with section, color, twist group, functional tag.
- Out: splice-only covered-length columns; unifying connector/splice synthesis into one shared builder; the column-visibility mechanism itself (owned by req_153).

# Risks / Open questions
- No shared synthesis builder exists (connector and splice build rows separately in `useEntityListModel.ts`) — changes stay on the connector path; optional later refactor to share. (accepted)
- RESOLVED — field names: `twistGroupLabel` and `functionalDomainTag` are the correct Wire entity fields (same as the wire table); add them to `ConnectorSynthesisRow` and the row builder.
- RESOLVED — no coupling with req_153: synthesis tables are separate from the modeling tables (no shared column-id model); this slice is independent and renders columns unconditionally.

# Companion docs
- Product brief(s): (none yet)
- Architecture decision(s): (none yet)

# References
- `src/app/components/workspace/AnalysisConnectorWorkspacePanels.tsx` (connector synthesis table, sort, CSV)
- `src/app/components/workspace/AnalysisSpliceWorkspacePanels.tsx` (splice synthesis reference)
- `src/app/hooks/useEntityListModel.ts:79-109` (connector synthesis row builder)
- `src/app/types/app-controller.ts:21-42` (ConnectorSynthesisRow / SpliceSynthesisRow)
- `src/core/entities.ts:307` (Wire.sectionMm2)
- Related: [[req_153_configurable_table_columns]]

# AI Context
- Summary: Enrich connector synthesis to splice parity by adding Section/Color/Twist group/Functional tag columns (data already available), sortable and CSV-exported, toggleable once configurable columns (req_153) land.
- Keywords: connector-synthesis, splice-parity, section, sortable-columns, analysis, csv-export
- Use when: extending the connector synthesis table with wire-level columns.
- Skip when: working on splice-only covered-length data or the column-visibility engine itself.

# Backlog
- none
- `item_641_connector_synthesis_parity_with_splice_add_section_color_twist_tag`
