## item_445_canvas_tools_export_format_preference_svg_png_with_svg_default - canvas tools export format preference svg png with svg default
> From version: 0.9.18
> Status: Done
> Understanding: 100%
> Confidence: 95%
> Progress: 100%
> Complexity: Medium
> Theme: UI
> Reminder: Update status/understanding/confidence/progress and linked task references when you edit this doc.

# Problem
`req_088` introduces export format selection in Canvas tools. Without a dedicated preference contract item, default behavior (`SVG`) and UI wiring can be inconsistent.

# Scope
- In:
  - add export format preference control (`SVG`, `PNG`) in Canvas tools settings.
  - set default to `SVG` for missing preference values.
  - wire state into controller preferences and settings slice.
  - keep existing PNG background option visible and scoped to PNG behavior.
- Out:
  - export action implementation (handled by item_446).
  - persistence compatibility and regression hardening (handled by item_447).

# Acceptance criteria
- AC1: Settings shows export format control with exactly `SVG` and `PNG`.
- AC2: Default selected value is `SVG` when no stored preference exists.
- AC3: Changing value updates runtime preference state immediately.
- AC4: Existing settings controls remain non-regressed.

# AC Traceability
- AC1 -> `src/app/components/workspace/SettingsWorkspaceContent.tsx`.
- AC2 -> `src/app/hooks/useAppControllerPreferencesState.ts` default contract.
- AC3 -> `src/app/hooks/controller/useAppControllerAuxScreenContentDomains.tsx`, `src/app/AppController.tsx`.
- AC4 -> `src/tests/app.ui.settings-canvas-render.spec.tsx`.
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
- Impact: High (entrypoint for req_088).
- Urgency: High (blocks runtime export implementation).

# Notes
- Risks:
  - ambiguous labels can cause format confusion.
  - missing default fallback can break behavior for legacy users.
- References:
  - `logics/request/req_088_network_summary_export_quality_with_svg_default_and_png_switch_in_canvas_tools.md`
  - `src/app/components/workspace/SettingsWorkspaceContent.tsx`
  - `src/app/hooks/useAppControllerPreferencesState.ts`
