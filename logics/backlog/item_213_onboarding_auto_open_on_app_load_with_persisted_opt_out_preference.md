## item_213_onboarding_auto_open_on_app_load_with_persisted_opt_out_preference - Onboarding Auto-Open on App Load with Persisted Opt-Out Preference
> From version: 0.7.3
> Understanding: 98%
> Confidence: 96%
> Progress: 0%
> Complexity: Medium
> Theme: First-Run Guidance Automation with User-Controlled Persistence
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
The onboarding must auto-open by default on app load, but users also need a persisted opt-out control so the app does not repeatedly interrupt them after they disable it.

# Scope
- In:
  - Implement auto-open behavior on app load (default enabled).
  - Add and persist the onboarding auto-open opt-out checkbox value.
  - Ensure the checkbox state survives reloads.
  - Apply explicit behavior for existing users: auto-open enabled until they opt out.
  - Ensure disabling auto-open does not remove manual relaunch capability.
  - Reuse the same persisted preference in both full-flow and single-step onboarding modals.
- Out:
  - Home Help button relaunch wiring (handled separately).
  - Contextual single-step buttons.

# Acceptance criteria
- Onboarding auto-opens on app load by default.
- Users can disable future auto-open via a persisted checkbox.
- The persisted preference is respected after reload.
- Existing users also default to auto-open until they opt out.

# Priority
- Impact: High.
- Urgency: High.

# Notes
- Dependencies: `req_035`, item_211, item_212.
- Blocks: item_214, item_218, item_219.
- Related AC: AC3, AC8, AC10.
- References:
  - `logics/request/req_035_step_by_step_onboarding_modal_flow_for_first_network_creation_and_contextual_help.md`
  - `src/app/AppController.tsx`
  - `src/app/hooks/useUiPreferences.ts`
  - `src/tests/persistence.localStorage.spec.ts`
