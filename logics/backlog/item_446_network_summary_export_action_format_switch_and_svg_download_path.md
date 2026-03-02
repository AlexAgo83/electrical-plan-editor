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
