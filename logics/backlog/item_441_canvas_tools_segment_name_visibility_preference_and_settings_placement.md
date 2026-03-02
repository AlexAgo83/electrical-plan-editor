## item_441_canvas_tools_segment_name_visibility_preference_and_settings_placement - canvas tools segment name visibility preference and settings placement
> From version: 0.9.18
> Status: Ready
> Understanding: 100%
> Confidence: 95%
> Progress: 0%
> Complexity: Medium
> Theme: UI
> Reminder: Update status/understanding/confidence/progress and linked task references when you edit this doc.

# Problem
`req_087` requires a new setting to control segment-name visibility, positioned above `Show segment lengths by default`. Without a precise placement/wiring item, UI consistency and discoverability can regress.

# Scope
- In:
  - add `Show segment names by default` control in `Canvas tools preferences`.
  - place control directly above `Show segment lengths by default`.
  - define preference default (`true`) and wire setter.
  - pass preference through settings slice assembly.
- Out:
  - segment rendering logic changes (handled by item_442).
  - persistence/apply-defaults behavior (handled by item_443).

# Acceptance criteria
- AC1: Settings contains `Show segment names by default` above segment-length default control.
- AC2: Default value is enabled for missing preference state.
- AC3: Toggle updates controller preference state immediately.
- AC4: Existing canvas tools settings controls remain non-regressed.

# AC Traceability
- AC1 -> `src/app/components/workspace/SettingsWorkspaceContent.tsx` control order.
- AC2 -> `src/app/hooks/useAppControllerPreferencesState.ts` default contract.
- AC3 -> `src/app/hooks/controller/useAppControllerAuxScreenContentDomains.tsx` settings prefs mapping.
- AC4 -> `src/tests/app.ui.settings-canvas-render.spec.tsx`.

# Priority
- Impact: High (primary UX entrypoint).
- Urgency: High (blocks rendering and persistence items).

# Notes
- Risks:
  - wrong placement can violate explicit request wording.
  - missing preference field can create runtime no-op toggle.
- References:
  - `logics/request/req_087_canvas_tools_option_to_hide_segment_names_independently_from_segment_lengths.md`
  - `src/app/components/workspace/SettingsWorkspaceContent.tsx`
  - `src/app/hooks/useAppControllerPreferencesState.ts`
