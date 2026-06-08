## item_446_network_summary_export_action_format_switch_and_svg_download_path - network summary export action format switch and svg download path
> From version: 0.9.18
> Status: Done
> Understanding: 100%
> Confidence: 95%
> Progress: 100%
> Complexity: Medium
> Theme: UI
> Reminder: Update status/understanding/confidence/progress and linked task references when you edit this doc.

# Problem
The export button currently produces PNG output. `req_088` requires a single export control that follows selected format and supports native SVG export path.

# Scope
- In:
  - implement format-aware export action in `Network summary`.
  - keep one export button/control that follows setting (`SVG` or `PNG`).
  - add direct SVG download path with correct file extension and serialized content.
  - keep PNG path functional when selected.
- Out:
  - new toolbar button proliferation.
  - advanced multi-format print/export workflows.

# Acceptance criteria
- AC1: Export action downloads `.svg` when format setting is `SVG`.
- AC2: Export action downloads `.png` when format setting is `PNG`.
- AC3: Toolbar keeps one export control, not separate SVG and PNG actions.
- AC4: SVG output keeps vector sharpness at high zoom.

# AC Traceability
- AC1/AC2 -> `src/app/components/NetworkSummaryPanel.tsx` export handlers.
- AC3 -> `src/app/components/NetworkSummaryPanel.tsx` header actions markup.
- AC4 -> targeted canvas export verification in tests/manual evidence.
- request-AC1 -> This backlog slice. Evidence needed: `Canvas tools preferences` includes an export format selector with `SVG` and `PNG`.
- request-AC2 -> This backlog slice. Evidence needed: Default export format is `SVG` when no prior preference exists.
- request-AC3 -> This backlog slice. Evidence needed: Export action produces an SVG file when `SVG` is selected.
- request-AC4 -> This backlog slice. Evidence needed: Export action produces a PNG file when `PNG` is selected.
- request-AC5 -> This backlog slice. Evidence needed: SVG export output remains visually sharp at high zoom (vector quality; no raster blur from export pipeline).
- request-AC6 -> This backlog slice. Evidence needed: Export format preference persists and restores across reload/relaunch.
- request-AC7 -> This backlog slice. Evidence needed: Existing PNG background inclusion behavior remains functional for PNG mode.
- request-AC8 -> This backlog slice. Evidence needed: `lint`, `typecheck`, and relevant UI tests pass after the change.
- request-AC1 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC2 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC3 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC4 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC5 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC6 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC7 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC8 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`

# Priority
- Impact: High (core functional behavior).
- Urgency: High (depends on item_445, blocks closure).

# Notes
- Risks:
  - SVG viewer/font handling can vary by consumer.
  - switching logic can accidentally break existing PNG workflow.
- References:
  - `logics/request/req_088_network_summary_export_quality_with_svg_default_and_png_switch_in_canvas_tools.md`
  - `src/app/components/NetworkSummaryPanel.tsx`
