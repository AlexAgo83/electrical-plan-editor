## item_522_analysis_node_and_segment_go_to_action_navigation_alignment - Analysis node and segment Go to action navigation alignment
> From version: 1.3.3
> Status: Ready
> Understanding: 98%
> Confidence: 96%
> Progress: 0%
> Complexity: Medium
> Theme: Analysis / Navigation / UX consistency
> Reminder: Update status/understanding/confidence/progress and linked task references when you edit this doc.

# Problem
`Node analysis` and `Segment analysis` expose related-entity tables, but unlike other analysis surfaces they do not provide row-level `Go to` actions to open the selected segment/wire directly.

# Scope
- In:
  - add an `Actions` column to the `Node analysis` associated-segment table with an iconized `Go to` button;
  - add an `Actions` column to the `Segment analysis` traversing-wire table with an iconized `Go to` button;
  - reuse the existing `Catalog analysis` visual/action pattern:
    - `validation-actions-cell`
    - `validation-row-go-to-button button-with-icon`
    - `action-button-icon is-open`
  - on activation:
    - `Node analysis` -> open `Segment` analysis and select the targeted segment;
    - `Segment analysis` -> open `Wire` analysis and select the targeted wire;
  - disable the action safely if the referenced entity is missing.
- Out:
  - broader redesign of analysis tables;
  - new navigation concepts outside the existing `Go to` pattern.

# Acceptance criteria
- AC1: `Node analysis` associated-segment rows expose a `Go to` action in an `Actions` column.
- AC2: Activating the `Node analysis` `Go to` action opens `Segment` analysis and selects the targeted segment.
- AC3: Missing-segment edge cases disable the `Go to` action safely.
- AC4: `Segment analysis` traversing-wire rows expose a `Go to` action in an `Actions` column.
- AC5: Activating the `Segment analysis` `Go to` action opens `Wire` analysis and selects the targeted wire.
- AC6: Missing-wire edge cases disable the `Go to` action safely.
- AC7: Both tables reuse the existing iconized `Go to` button pattern already used elsewhere in analysis/catalog flows.

# AC Traceability
- AC1/AC2/AC3/AC4/AC5/AC6/AC7 -> `src/app/components/workspace/AnalysisNodeSegmentWorkspacePanels.tsx`.
- AC7 -> `src/app/components/workspace/CatalogAnalysisWorkspaceContent.tsx`.

# Priority
- Impact: Medium-High.
- Urgency: Medium-High.

# Notes
- Derived from `logics/request/req_106_bom_export_wire_termination_coverage_wire_csv_termination_columns_and_horizontal_label_offset_harmonization.md`.
- Orchestrated by `logics/tasks/task_085_req_106_export_analysis_navigation_and_render_readability_orchestration_and_delivery_control.md`.
- Risks:
  - action-column insertion can affect compact/mobile table balance if spacing is not tuned;
  - navigation state bugs can appear if selection and sub-screen switching order are not kept deterministic.
- References:
  - `src/app/components/workspace/AnalysisNodeSegmentWorkspacePanels.tsx`
  - `src/app/components/workspace/CatalogAnalysisWorkspaceContent.tsx`
  - `src/tests/app.ui.analysis-go-to-wire.spec.tsx`
