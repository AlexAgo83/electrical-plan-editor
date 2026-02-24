## item_214_home_help_button_relaunches_full_onboarding_flow_independent_of_auto_open_setting - Home Help Button Relaunches Full Onboarding Flow Independent of Auto-Open Setting
> From version: 0.7.3
> Understanding: 97%
> Confidence: 95%
> Progress: 100%
> Complexity: Medium
> Theme: Manual Re-Entry Point to Guided Learning from Home Screen
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
Users need a manual way to relaunch onboarding from Home even after disabling auto-open, otherwise the opt-out setting can make onboarding inaccessible.

# Scope
- In:
  - Add a `Help` (or equivalent) button on Home screen to launch the full onboarding flow.
  - Ensure manual relaunch works even when auto-open is disabled.
  - Integrate with the shared onboarding controller APIs.
  - Keep Home screen UX coherent and non-intrusive.
- Out:
  - Contextual per-panel info buttons.
  - Auto-open persistence behavior itself.

# Acceptance criteria
- Home screen exposes a Help CTA that opens the full onboarding flow.
- Manual relaunch works regardless of auto-open opt-out state.

# Priority
- Impact: High.
- Urgency: Medium.

# Notes
- Dependencies: `req_035`, item_211, item_212, item_213.
- Blocks: item_218, item_219.
- Related AC: AC5, AC8.
- References:
  - `logics/request/req_035_step_by_step_onboarding_modal_flow_for_first_network_creation_and_contextual_help.md`
  - `src/app/components/workspace/HomeWorkspaceContent.tsx`
  - `src/app/AppController.tsx`
  - `src/tests/app.ui.home.spec.tsx`
