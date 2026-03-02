## item_437_settings_workspace_panels_wide_screen_preference_control_and_state_contract - settings workspace panels wide screen preference control and state contract
> From version: 0.9.18
> Status: Done
> Understanding: 100%
> Confidence: 95%
> Progress: 100%
> Complexity: Medium
> Theme: UI
> Reminder: Update status/understanding/confidence/progress and linked task references when you edit this doc.

# Problem
`req_086` requires a user-facing `wide screen` preference under `Workspace panels layout`. Without a clear state contract and UI control wiring, behavior can drift between default values, runtime state, and persisted preferences.

# Scope
- In:
  - add the `wide screen` control in Settings under `Workspace panels layout`.
  - define preference state key and default (`false`).
  - wire state setter/getter into the settings content slice and controller preference model.
  - keep control available regardless of active top-level screen context.
- Out:
  - app-shell CSS behavior implementation (handled by item_438).
  - persistence adapter implementation details (handled by item_439).

# Acceptance criteria
- AC1: Settings renders a `wide screen` control under `Workspace panels layout`.
- AC2: Control default is off when no stored preference exists.
- AC3: Control updates controller preference state immediately when toggled.
- AC4: Control wiring is isolated to preference contract surface and does not alter unrelated settings behavior.

# AC Traceability
- AC1 -> `src/app/components/workspace/SettingsWorkspaceContent.tsx` (new control placement).
- AC2 -> `src/app/hooks/useAppControllerPreferencesState.ts` default value contract.
- AC3 -> `src/app/hooks/controller/useAppControllerAuxScreenContentDomains.tsx`, `src/app/AppController.tsx` settings prefs wiring.
- AC4 -> settings UI regression checks in `src/tests/app.ui.settings.spec.tsx`.

# Priority
- Impact: High (entrypoint for entire req_086 behavior).
- Urgency: High (blocks downstream shell and persistence items).

# Notes
- Risks:
  - introducing the control without explicit default can create inconsistent first-run behavior.
  - incomplete wiring can make UI toggle non-functional.
- References:
  - `logics/request/req_086_workspace_panels_wide_screen_option_to_remove_app_max_width_cap.md`
  - `src/app/components/workspace/SettingsWorkspaceContent.tsx`
  - `src/app/hooks/useAppControllerPreferencesState.ts`
  - `src/app/hooks/controller/useAppControllerAuxScreenContentDomains.tsx`
