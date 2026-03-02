## item_439_wide_screen_preference_persistence_restore_and_regression_coverage - wide screen preference persistence restore and regression coverage
> From version: 0.9.18
> Status: Done
> Understanding: 100%
> Confidence: 95%
> Progress: 100%
> Complexity: Medium
> Theme: UI
> Reminder: Update status/understanding/confidence/progress and linked task references when you edit this doc.

# Problem
Even with UI control and shell behavior in place, the feature is incomplete if preference persistence/restore is missing or unstable across reloads.

# Scope
- In:
  - add `wide screen` preference to UI preference payload and hydration normalization.
  - persist value in storage with safe default fallback.
  - restore value on app boot and apply shell behavior.
  - add regression tests for persist/restore and default fallback.
- Out:
  - changing storage schema version unless strictly required.
  - non-wide-screen preference refactors.

# Acceptance criteria
- AC1: `wide screen` value is saved in UI preferences storage payload.
- AC2: On reload, stored value is restored and applied to shell behavior.
- AC3: Missing/legacy value falls back to `false` safely.
- AC4: Regression tests cover default, toggle-save, and restore paths.

# AC Traceability
- AC1/AC3 -> `src/app/hooks/useUiPreferences.ts` payload + normalization.
- AC2 -> `src/app/hooks/useAppControllerPreferencesState.ts`, `src/app/AppController.tsx` hydration flow.
- AC4 -> `src/tests/app.ui.settings.spec.tsx`, targeted persistence tests if touched.

# Priority
- Impact: High (user expectation for persistent settings).
- Urgency: Medium-High (after 437/438, before closure).

# Notes
- Risks:
  - payload drift can break other preference restores.
  - hydration order issues may cause first-frame flicker.
- References:
  - `logics/request/req_086_workspace_panels_wide_screen_option_to_remove_app_max_width_cap.md`
  - `src/app/hooks/useUiPreferences.ts`
  - `src/app/hooks/useAppControllerPreferencesState.ts`
  - `src/tests/app.ui.settings.spec.tsx`
