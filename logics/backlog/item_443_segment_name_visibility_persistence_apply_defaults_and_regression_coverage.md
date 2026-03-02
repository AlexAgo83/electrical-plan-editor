## item_443_segment_name_visibility_persistence_apply_defaults_and_regression_coverage - segment name visibility persistence apply defaults and regression coverage
> From version: 0.9.18
> Status: Done
> Understanding: 100%
> Confidence: 95%
> Progress: 100%
> Complexity: Medium
> Theme: UI
> Reminder: Update status/understanding/confidence/progress and linked task references when you edit this doc.

# Problem
Without persistence and `Apply canvas defaults now` integration, the new segment-name setting will not behave like existing canvas defaults and can confuse users.

# Scope
- In:
  - include segment-name default in UI preferences payload and hydration.
  - apply restored value to runtime canvas display state.
  - include segment-name default in `Apply canvas defaults now` flow.
  - add tests for default fallback, save/restore, and apply-defaults behavior.
- Out:
  - broader preference-schema migrations unrelated to this flag.

# Acceptance criteria
- AC1: Segment-name default is persisted in UI preferences.
- AC2: Reload restores persisted segment-name visibility correctly.
- AC3: `Apply canvas defaults now` applies segment-name default to runtime display.
- AC4: Missing legacy value falls back to enabled without runtime errors.

# AC Traceability
- AC1/AC4 -> `src/app/hooks/useUiPreferences.ts` payload + normalization.
- AC2 -> `src/app/AppController.tsx` hydration restore path.
- AC3 -> `src/app/hooks/useWorkspaceHandlers.ts` apply defaults orchestration.
- AC4 -> `src/tests/app.ui.settings-canvas-render.spec.tsx` and any touched preference tests.

# Priority
- Impact: High (consistency with existing settings model).
- Urgency: Medium-High (after 441/442, before closure).

# Notes
- Risks:
  - persistence omissions can create flaky behavior across sessions.
  - apply-default mismatch can violate request AC7.
- References:
  - `logics/request/req_087_canvas_tools_option_to_hide_segment_names_independently_from_segment_lengths.md`
  - `src/app/hooks/useUiPreferences.ts`
  - `src/app/hooks/useWorkspaceHandlers.ts`
  - `src/tests/app.ui.settings-canvas-render.spec.tsx`
