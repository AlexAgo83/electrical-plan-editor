## item_508_network_summary_panel_export_pipeline_extraction_and_layer_split_phase_1 - NetworkSummaryPanel export pipeline extraction and layer split (phase 1)
> From version: 1.3.1
> Status: Done
> Understanding: 99%
> Confidence: 95%
> Progress: 100%
> Complexity: High
> Theme: Architecture / UI modularization
> Reminder: Update status/understanding/confidence/progress and linked task references when you edit this doc.

# Problem
`NetworkSummaryPanel.tsx` mixes export orchestration, rendering, and utility logic in a monolithic file, increasing review and regression complexity.

# Scope
- In:
  - extract export SVG/PNG orchestration helpers into dedicated module(s);
  - extract frame/cartouche overlay builders and style clone helpers;
  - create first rendering-layer split for segments/nodes where safe;
  - keep external props contract unchanged;
  - enforce phase-1 line budget reduction target.
- Out:
  - full callout model/layout extraction (covered by item_509).

# Acceptance criteria
- AC1: Export pipeline helpers are moved out of `NetworkSummaryPanel.tsx`.
- AC2: Segment/node rendering layer split is introduced without behavior regression.
- AC3: Panel external behavior and props contract remain unchanged.
- AC4: `NetworkSummaryPanel.tsx` line count is significantly reduced as part of phase-1 target trajectory.

# AC Traceability
- AC1 -> Export concerns are isolated.
- AC2 -> Render concerns are modularized.
- AC3 -> Integration surface remains stable.
- AC4 -> Monolith reduction objective is measurable.

# Priority
- Impact: High.
- Urgency: High.

# Notes
- Derived from `logics/request/req_104_post_release_architecture_and_runtime_hardening_for_preferences_measurement_and_controller_split.md`.
- Orchestrated by `logics/tasks/task_080_req_104_post_release_architecture_and_runtime_hardening_orchestration_and_delivery_control.md`.
- Delivered in this increment:
  - export pipeline helpers extracted into `src/app/components/network-summary/export/networkSummaryExport.ts`;
  - export SVG/PNG callback orchestration extracted into `src/app/components/network-summary/export/useNetworkSummaryExportActions.ts`;
  - segment/node render model extracted into `src/app/components/network-summary/graph/networkSummaryGraphModel.ts`;
  - segment/grid/node/label SVG layers extracted into `src/app/components/network-summary/graph/NetworkSummaryGraphLayers.tsx`;
  - quick-entity navigation strip extracted into `src/app/components/network-summary/NetworkSummaryQuickEntityNavigation.tsx`;
  - `NetworkSummaryPanel` now consumes imported export helpers/controllers (`copy styles`, `decorations`, `PNG blob`, `background fill`, export handlers);
  - `NetworkSummaryPanel.tsx` reduced from `2811` to `975` lines after export/callout/render-layer extraction increments.
- Closure status:
  - AC1 satisfied: export pipeline and export controllers extracted.
  - AC2 satisfied: segment/node/grid/label render layers extracted.
  - AC3 satisfied: external panel contract unchanged.
  - AC4 satisfied: line-budget trajectory now below phase-1 target for this panel.
- Validation evidence (latest increment):
  - `npm run -s lint` ✅
  - `npm run -s typecheck` ✅
  - `npx vitest run src/tests/app.ui.settings-canvas-callouts.spec.tsx src/tests/app.ui.network-summary-workflow-polish.spec.tsx src/tests/app.ui.settings-canvas-render.spec.tsx` ✅
