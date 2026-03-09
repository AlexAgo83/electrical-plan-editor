## item_523_network_summary_export_readability_hardening_for_cartouche_metadata_and_segment_label_offsets - Network summary export readability hardening for cartouche metadata and segment label offsets
> From version: 1.3.3
> Status: Ready
> Understanding: 98%
> Confidence: 95%
> Progress: 0%
> Complexity: High
> Theme: Export / Render / Readability
> Reminder: Update status/understanding/confidence/progress and linked task references when you edit this doc.

# Problem
Export readability remains degraded in two ways:
- cartouche identity metadata such as `Author` can be truncated with ellipsis in ordinary export sizes;
- horizontal and near-horizontal segment labels remain too close to the stroke, with desired spacing not aligned between plan and exported SVG.

# Scope
- In:
  - improve export cartouche layout so ordinary identity values remain readable without premature truncation;
  - prefer wider cartouche and/or controlled metadata wrapping before using ellipsis;
  - keep SVG and PNG export behavior aligned for cartouche readability;
  - centralize or harmonize segment label-offset rules so the same geometry behavior applies to plan and export;
  - increase label distance for horizontal and near-horizontal segments using deterministic angular rules.
- Out:
  - freeform cartouche editing UI;
  - broad redesign of export frame/cartouche visuals beyond readability fixes;
  - manual label dragging/placement.

# Acceptance criteria
- AC1: Export cartouche identity metadata is not unnecessarily truncated for ordinary-length values when export size allows readable layout.
- AC2: SVG and PNG exports follow the same cartouche metadata readability behavior.
- AC3: Ellipsis remains only a fallback for genuinely constrained cases.
- AC4: On-screen plan rendering increases label distance from the stroke for horizontal and near-horizontal segments.
- AC5: Exported SVG follows the same horizontal/near-horizontal label-offset behavior as the on-screen plan.
- AC6: Near-horizontal detection is deterministic and explicit.

# AC Traceability
- AC1/AC2/AC3 -> `src/app/components/network-summary/export/networkSummaryExport.ts`.
- AC4/AC5/AC6 -> `src/app/components/network-summary/graph/networkSummaryGraphModel.ts`.

# Priority
- Impact: Medium-High.
- Urgency: Medium-High.

# Notes
- Derived from `logics/request/req_106_bom_export_wire_termination_coverage_wire_csv_termination_columns_and_horizontal_label_offset_harmonization.md`.
- Orchestrated by `logics/tasks/task_085_req_106_export_analysis_navigation_and_render_readability_orchestration_and_delivery_control.md`.
- Supplied SVG evidence:
  - `Author: Paul Mondou` exported as `Author: Paul Mond...`.
- Risks:
  - widening/wrapping cartouche metadata can alter export footprint and must stay inside safe bounds;
  - angle-based offset tuning can create visual discontinuities if transition thresholds are too abrupt.
- References:
  - `src/app/components/network-summary/export/networkSummaryExport.ts`
  - `src/app/components/network-summary/graph/networkSummaryGraphModel.ts`
  - `src/tests/app.ui.network-summary-bom-export.spec.tsx`
