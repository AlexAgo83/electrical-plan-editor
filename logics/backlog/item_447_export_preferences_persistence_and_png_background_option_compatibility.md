## item_447_export_preferences_persistence_and_png_background_option_compatibility - export preferences persistence and png background option compatibility
> From version: 0.9.18
> Status: Done
> Understanding: 100%
> Confidence: 95%
> Progress: 100%
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
