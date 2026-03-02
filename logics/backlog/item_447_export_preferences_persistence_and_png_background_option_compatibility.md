## item_447_export_preferences_persistence_and_png_background_option_compatibility - export preferences persistence and png background option compatibility
> From version: 0.9.18
> Status: Ready
> Understanding: 100%
> Confidence: 95%
> Progress: 0%
> Complexity: Medium
> Theme: UI
> Reminder: Update status/understanding/confidence/progress and linked task references when you edit this doc.

# Problem
Export format preference must persist and coexist with `Include background in PNG export` behavior. Without explicit compatibility hardening, users may see inconsistent results across sessions.

# Scope
- In:
  - persist export format preference in UI preferences payload and hydration.
  - restore export format on load and apply to export action behavior.
  - ensure PNG background option remains active only for PNG export path.
  - add regression tests for persistence and compatibility.
- Out:
  - reworking PNG background rendering algorithm itself.

# Acceptance criteria
- AC1: Export format preference is saved and restored across reloads.
- AC2: Missing legacy export-format value falls back to `SVG`.
- AC3: PNG background preference affects PNG output and does not affect SVG output.
- AC4: Regression tests cover format restore + PNG background compatibility.

# AC Traceability
- AC1/AC2 -> `src/app/hooks/useUiPreferences.ts`.
- AC3 -> `src/app/components/NetworkSummaryPanel.tsx` format branch handling.
- AC4 -> `src/tests/app.ui.settings-canvas-render.spec.tsx` plus any export-specific tests.

# Priority
- Impact: High (settings correctness and user trust).
- Urgency: Medium-High (after 445/446, before closure).

# Notes
- Risks:
  - preference schema drift can regress unrelated settings.
  - compatibility bugs can create confusing export outputs.
- References:
  - `logics/request/req_088_network_summary_export_quality_with_svg_default_and_png_switch_in_canvas_tools.md`
  - `src/app/hooks/useUiPreferences.ts`
  - `src/app/components/NetworkSummaryPanel.tsx`
