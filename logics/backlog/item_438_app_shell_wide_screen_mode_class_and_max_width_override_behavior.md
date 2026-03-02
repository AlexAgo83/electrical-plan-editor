## item_438_app_shell_wide_screen_mode_class_and_max_width_override_behavior - app shell wide screen mode class and max width override behavior
> From version: 0.9.18
> Status: Done
> Understanding: 100%
> Confidence: 95%
> Progress: 100%
> Complexity: Medium
> Theme: UI
> Reminder: Update status/understanding/confidence/progress and linked task references when you edit this doc.

# Problem
The `wide screen` preference must actually change shell layout behavior. Without explicit class/style override implementation, the setting will exist but the max-width cap will remain active.

# Scope
- In:
  - derive an app-shell class/state flag from `wide screen` preference.
  - disable or override app-shell `max-width` cap when flag is enabled.
  - preserve current max-width constrained behavior when disabled.
  - ensure behavior is applied to shared shell across all top-level screens.
- Out:
  - new responsive breakpoint redesign.
  - unrelated panel-level layout changes.

# Acceptance criteria
- AC1: With `wide screen` disabled, shell keeps current `max-width` constrained layout.
- AC2: With `wide screen` enabled, shell is no longer capped by current max-width rule.
- AC3: Behavior switches live when toggling setting (no reload needed).
- AC4: Shell behavior is consistent on Home, Network scope, Modeling/Analysis, Validation, and Settings screens.

# AC Traceability
- AC1/AC2 -> `src/app/hooks/useAppControllerShellDerivedState.ts`, `src/app/styles/base/base-foundation.css`.
- AC3 -> `src/app/AppController.tsx` shell class propagation.
- AC4 -> shell-level UI checks in `src/tests/app.ui.workspace-shell-regression.spec.tsx` and settings flow tests.

# Priority
- Impact: High (core runtime effect of req_086).
- Urgency: High (depends on item_437, blocks closure item_440).

# Notes
- Risks:
  - CSS override can accidentally affect mobile/narrow layout constraints.
  - class name collisions can impact theme selectors.
- References:
  - `logics/request/req_086_workspace_panels_wide_screen_option_to_remove_app_max_width_cap.md`
  - `src/app/hooks/useAppControllerShellDerivedState.ts`
  - `src/app/styles/base/base-foundation.css`
  - `src/app/AppController.tsx`
