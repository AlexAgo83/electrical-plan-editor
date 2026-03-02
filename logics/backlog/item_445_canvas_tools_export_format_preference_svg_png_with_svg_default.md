## item_445_canvas_tools_export_format_preference_svg_png_with_svg_default - canvas tools export format preference svg png with svg default
> From version: 0.9.18
> Status: Ready
> Understanding: 100%
> Confidence: 95%
> Progress: 0%
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
