## req_086_workspace_panels_wide_screen_option_to_remove_app_max_width_cap - Workspace panels wide screen option to remove app max-width cap
> From version: 0.9.18
> Status: Done
> Understanding: 100%
> Confidence: 97%
> Complexity: Medium
> Theme: UI
> Reminder: Update status/understanding/confidence and references when you edit this doc.

# Needs
- Under `Workspace panels layout`, add a `wide screen` option.
- When `wide screen` is enabled, the application-wide max-width cap is no longer applied.
- By default, `wide screen` is disabled.

# Context
- The app shell currently applies a global width cap (`max-width`) that centers and constrains the workspace on large displays.
- Existing preferences already expose `Workspace panels layout`, but there is no dedicated user-controlled toggle to opt into a full-width shell experience.
- Advanced desktop users with large monitors need a wider workspace without changing current default behavior for everyone.

# Objective
- Introduce a user preference that enables full-width rendering on demand.
- Keep the current constrained layout as the default behavior.
- Ensure the option is predictable, persisted, and reversible from Settings.

# Scope
- In:
  - add a `wide screen` preference under `Workspace panels layout` in Settings;
  - default value is `false` (disabled);
  - when enabled, app shell width is no longer capped by the current max-width rule;
  - apply this behavior consistently to the shared app shell across all top-level screens (`Home`, `Network scope`, `Modeling`, `Analysis`, `Validation`, `Settings`);
  - persist and restore preference via existing UI preferences storage flow;
  - keep existing layout behavior unchanged when disabled.
- Out:
  - redesign of workspace panel composition;
  - mobile breakpoint changes;
  - theme redesign;
  - changes to business logic unrelated to shell width behavior.

# Locked execution decisions
- Decision 1: `wide screen` is an explicit user preference and is `disabled` by default.
- Decision 2: Disabling `wide screen` preserves the current max-width constrained behavior.
- Decision 3: Enabling `wide screen` removes only the app-shell width cap, without changing other responsive rules.
- Decision 4: The option is surfaced in Settings under `Workspace panels layout` and follows existing settings persistence behavior.
- Decision 5: The wide-screen shell behavior applies globally to the shared app shell, independent of active workspace screen.

# Functional behavior contract
- Settings:
  - `Workspace panels layout` includes a `wide screen` control.
  - Default state is off for first-load users and for users without an existing stored value.
- Runtime behavior:
  - `wide screen = off`: existing shell max-width cap remains effective.
  - `wide screen = on`: shell max-width cap is not effective; app uses full available width.
  - behavior is identical regardless of current top-level screen.
- Persistence:
  - Toggling the option is persisted and restored on next app launch.

# Acceptance criteria
- AC1: A `wide screen` option is available under `Workspace panels layout` in Settings.
- AC2: Default value is disabled (`false`) when no prior preference exists.
- AC3: When disabled, current app max-width cap behavior is unchanged.
- AC4: When enabled, app-wide max-width cap is not applied.
- AC5: Toggling the option updates UI behavior immediately without requiring app reload.
- AC6: Preference persists and restores correctly across reload/relaunch.
- AC7: `lint`, `typecheck`, and relevant UI tests pass after the change.

# Validation and regression safety
- `npm run -s lint`
- `npm run -s typecheck`
- `npm run -s test:ci`
- targeted UI checks around:
  - settings preference rendering and interaction for `wide screen`
  - shell class/style behavior with preference off/on
  - persistence restore behavior after reload
- `python3 logics/skills/logics-doc-linter/scripts/logics_lint.py`

# Definition of Ready (DoR)
- [x] Problem statement is explicit and user impact is clear.
- [x] Scope boundaries (in/out) are explicit.
- [x] Acceptance criteria are testable.
- [x] Dependencies and known risks are listed.

# Risks
- Width-cap removal can expose latent spacing/overflow assumptions on ultra-wide displays.
- Existing responsive CSS might rely implicitly on constrained width and need targeted hardening.
- UI tests may need updates if they assert shell class names/styles tied to previous fixed-width behavior.

# Backlog
- To create from this request:
  - `item_437_settings_workspace_panels_wide_screen_preference_control_and_state_contract.md`
  - `item_438_app_shell_wide_screen_mode_class_and_max_width_override_behavior.md`
  - `item_439_wide_screen_preference_persistence_restore_and_regression_coverage.md`
  - `item_440_req_086_validation_matrix_and_closure_traceability.md`

# References
- `src/app/components/workspace/SettingsWorkspaceContent.tsx`
- `src/app/hooks/useUiPreferences.ts`
- `src/app/hooks/useAppControllerPreferencesState.ts`
- `src/app/hooks/useAppControllerShellDerivedState.ts`
- `src/app/styles/base/base-foundation.css`
- `src/tests/app.ui.settings.spec.tsx`
- `logics/request/req_083_app_wide_mobile_mode_enablement_and_removal_of_global_700px_min_width_constraint.md`
