## req_085_mobile_onboarding_and_workspace_header_compaction_for_small_screens - Mobile onboarding and workspace header compaction for small screens
> From version: 0.9.18
> Status: Draft
> Understanding: 100%
> Confidence: 98%
> Complexity: Medium
> Theme: UI
> Reminder: Update status/understanding/confidence and references when you edit this doc.

# Needs
- In mobile mode, onboarding modal `Close` must stay on the same line as the title and icon.
- In mobile mode, onboarding `Next` must stay on the same line as onboarding target actions (`Open` / `Scroll`).
- In mobile mode, the Network Scope action label `Duplicate` must become `Dup.`.
- In mobile mode, `CSV` and `Help` must stay on the same row as `Network Scope` and be right-aligned.
- In mobile mode, `CSV` and `Help` must stay on the same row as `Catalog`, `Connectors`, `Splices`, `Nodes`, `Segments`, and `Wires`, right-aligned.
- In mobile mode, `Route mode` column must be hidden.
- In mobile mode, `Occupied` column label must become `Occup.`.
- In mobile mode, in `Catalog`, column `Manufacturer ref` must become `Mnf ref`.
- In mobile mode, in `Catalog`, column `Unit price HT (DEV)` must become `Price`.
- In mobile mode, in `Catalog`, column `Connections` must become `Con.`.
- In mobile mode, in `Catalog`, button `Import CSV` must become `Import`.
- In mobile mode, columns `Reference` must become `Ref.`.
- In mobile mode, columns `Technical ID` must become `ID`.
- In mobile mode, columns `Endpoint A` / `Endpoint B` must become `End A` / `End B`.
- In mobile mode, columns `Length (mm)` must become `Len`.
- In mobile mode, columns `Section (mm2)` / `Section (mm²)` must become `Sec`.
- In mobile mode, in `Validation`, column `Severity` must be hidden.
- In mobile mode, in `Validation`, `CSV` button must stay on the same row as `Validation center`, right-aligned.

# Context
- `req_083` enabled app-wide mobile mode, but several high-frequency headers and onboarding action rows still wrap in ways that reduce readability and action discoverability.
- Current responsive rules in onboarding and shared table/header styles stack controls under mobile breakpoints, which conflicts with the desired compact one-line behavior for key controls.
- Wire and occupancy table headers still use desktop labels in narrow viewports, creating avoidable horizontal pressure.

# Objective
- Deliver a focused mobile polish pass that keeps primary action affordances visible on a single line where requested.
- Reduce horizontal pressure in dense tables through mobile-specific label/column compaction.

# Scope
- In:
  - onboarding modal mobile header/action-row compaction;
  - mobile label compaction for Network Scope `Duplicate`;
  - right-aligned single-row placement of `CSV` + `Help` with panel titles for the targeted screens;
  - mobile hiding of `Route mode` table column;
  - mobile hiding of `Severity` column in `Validation`;
  - mobile renaming of `Occupied` to `Occup.` in relevant table headers;
  - mobile label compaction in `Catalog` (`Manufacturer ref` -> `Mnf ref`, `Unit price HT (DEV)` -> `Price`, `Connections` -> `Con.`, `Import CSV` -> `Import`);
  - mobile shorthand labels for shared table headers (`Reference` -> `Ref.`, `Technical ID` -> `ID`, `Endpoint A/B` -> `End A/B`, `Length (mm)` -> `Len`, `Section (mm2|mm²)` -> `Sec`);
  - mobile header tool alignment for `Validation center` with `CSV` on the same row, right-aligned.
- Out:
  - business-logic changes for onboarding/workspace actions;
  - desktop/tablet redesign;
  - CSV payload schema changes;
  - non-targeted table copy refactors outside `Occupied`/`Route mode` mobile rules.

# Locked execution decisions
- Decision 1: Mobile behavior follows the shared narrow-screen contract baseline (`<= 900px`), with optional tighter CSS sub-breakpoints where needed for readability.
- Decision 2: Onboarding mobile layout keeps header controls and primary action row single-line for normal narrow-phone widths, without clipping.
- Decision 3: Network Scope mobile action label is `Dup.` only on mobile; desktop/tablet remains `Duplicate`.
- Decision 4: For targeted panels, `CSV` and `Help` remain visually right-aligned on the same row as the panel title in mobile mode.
- Decision 5: `Route mode` is hidden on mobile in wire tables where it is currently displayed.
- Decision 6: `Occupied` header label is shortened to `Occup.` on mobile while preserving sort/filter behavior.

# Functional behavior contract
- Onboarding modal (mobile):
  - icon/title/progress and `Close` stay on one header row;
  - target actions (`Open ...` / `Scroll ...`) and `Next` stay on one action row.
- Network Scope (mobile):
  - list action button text shows `Dup.` instead of `Duplicate`.
- Targeted workspace list headers (mobile):
  - `CSV` + `Help` stay on the same row as title for `Network Scope`, `Catalog`, `Connectors`, `Splices`, `Nodes`, `Segments`, `Wires`;
  - `CSV` stays on the same row as `Validation center` title;
  - tools stay right-aligned.
- Tables (mobile):
  - `Route mode` column is hidden where present in wire listing tables;
  - `Severity` column is hidden in `Validation` table;
  - `Occupied` header displays `Occup.` where current header is `Occupied`;
  - in `Catalog`, headers show `Mnf ref`, `Price`, and `Con.`;
  - shared headers use compact labels: `Ref.`, `ID`, `End A`, `End B`, `Len`, `Sec`.
- Catalog actions (mobile):
  - `Import CSV` button label shows `Import`.
- Desktop/tablet:
  - existing behavior and copy remain unchanged unless needed for non-breaking shared implementation.

# Acceptance criteria
- AC1: On mobile, onboarding `Close` remains on the same line as icon/title block.
- AC2: On mobile, onboarding `Next` remains on the same line as target action buttons (`Open`/`Scroll`).
- AC3: On mobile, Network Scope action label is `Dup.` and triggers the same duplicate handler/behavior as today.
- AC4: On mobile, `CSV` and `Help` are on the same row as `Network Scope` title and right-aligned.
- AC5: On mobile, `CSV` and `Help` are on the same row as titles for `Catalog`, `Connectors`, `Splices`, `Nodes`, `Segments`, and `Wires`, right-aligned.
- AC6: On mobile, `Route mode` column is hidden in affected wire tables.
- AC7: On mobile, `Occupied` header text is `Occup.` in affected connector/splice tables.
- AC8: On mobile, in `Catalog`, header labels are compacted to `Mnf ref`, `Price`, and `Con.`.
- AC9: On mobile, in `Catalog`, `Import CSV` button label is `Import` and triggers the same import handler/behavior.
- AC10: On mobile, shared table headers are compacted as follows where present: `Reference` -> `Ref.`, `Technical ID` -> `ID`, `Endpoint A/B` -> `End A/B`, `Length (mm)` -> `Len`, `Section (mm2|mm²)` -> `Sec`.
- AC11: On mobile, in `Validation`, `Severity` column is hidden.
- AC12: On mobile, in `Validation`, `CSV` remains on the same row as `Validation center` and right-aligned.
- AC13: `lint`, `typecheck`, and relevant UI tests pass after the responsive compaction changes.

# Validation and regression safety
- `npm run -s lint`
- `npm run -s typecheck`
- `npm run -s test:ci`
- targeted:
  - `src/tests/app.ui.onboarding.spec.tsx`
  - `src/tests/app.ui.networks.spec.tsx`
  - `src/tests/app.ui.list-ergonomics.spec.tsx`
  - `src/tests/app.ui.catalog.spec.tsx`
- narrow viewport checks (at least):
  - `390x844`
  - `360x800`
- `python3 logics/skills/logics-doc-linter/scripts/logics_lint.py`

# Definition of Ready (DoR)
- [x] Problem statement is explicit and user impact is clear.
- [x] Scope boundaries (in/out) are explicit.
- [x] Acceptance criteria are testable.
- [x] Dependencies and known risks are listed.

# Risks
- Shared table header responsive CSS updates can affect non-targeted panels if selectors are too broad.
- One-line mobile constraints can cause clipping in localized/future longer labels if width budgets are not protected.
- Mobile-only label changes may require test selector/name updates in existing UI tests.

# Backlog
- To create from this request:
  - `item_433_onboarding_modal_mobile_single_row_header_and_action_alignment.md`
  - `item_434_network_scope_mobile_duplicate_label_and_header_tool_alignment.md`
  - `item_435_modeling_analysis_mobile_header_tool_alignment_and_table_compaction.md`
  - `item_436_req_085_mobile_compaction_validation_matrix_and_closure_traceability.md`

# References
- `logics/request/req_083_app_wide_mobile_mode_enablement_and_removal_of_global_700px_min_width_constraint.md`
- `src/app/components/onboarding/OnboardingModal.tsx`
- `src/app/styles/onboarding.css`
- `src/app/styles/tables.css`
- `src/app/components/workspace/NetworkScopeWorkspaceContent.tsx`
- `src/app/components/workspace/ModelingCatalogListPanel.tsx`
- `src/app/components/workspace/ModelingPrimaryTables.tsx`
- `src/app/components/workspace/ModelingSecondaryTables.tsx`
- `src/app/components/workspace/AnalysisConnectorWorkspacePanels.tsx`
- `src/app/components/workspace/AnalysisSpliceWorkspacePanels.tsx`
- `src/app/components/workspace/AnalysisNodeSegmentWorkspacePanels.tsx`
- `src/app/components/workspace/AnalysisWireWorkspacePanels.tsx`
