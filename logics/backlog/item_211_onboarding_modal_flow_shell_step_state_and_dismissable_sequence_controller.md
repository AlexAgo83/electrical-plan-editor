## item_211_onboarding_modal_flow_shell_step_state_and_dismissable_sequence_controller - Onboarding Modal Flow Shell, Step State, and Dismissable Sequence Controller
> From version: 0.7.3
> Understanding: 98%
> Confidence: 96%
> Progress: 0%
> Complexity: High
> Theme: Modal Flow Infrastructure for First-Time Guided Onboarding
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
The onboarding feature requires a reusable modal flow controller that supports a 5-step sequence, progress display, next-step navigation, and safe dismissal at any moment.

# Scope
- In:
  - Implement onboarding modal shell/controller state for a 5-step sequence.
  - Support progress indicator (`Step X of 5`) and `Next` navigation.
  - Support close/dismiss at any step without corrupting app state.
  - Define flow open/close APIs reusable by auto-open, Home Help relaunch, and contextual single-step modals.
  - Ensure reopening full flow resets to step 1.
  - Support single-step contextual modal mode using the same shell/controller infrastructure.
  - Ensure the shell can render the auto-open opt-out checkbox in both full-flow and single-step modes.
- Out:
  - Persisted auto-open preference wiring.
  - Step content authoring/copy.
  - Contextual single-step trigger buttons.

# Acceptance criteria
- A full onboarding modal flow can open, advance through steps, and close safely.
- Progress label and next-step action are present for sequence mode.
- Flow controller can be invoked externally (not hard-wired to one screen only).
- Shell/controller supports both full-flow and single-step modal variants.

# Priority
- Impact: High.
- Urgency: High.

# Notes
- Dependencies: `req_035`.
- Blocks: item_212, item_213, item_214, item_215, item_216, item_217, item_218, item_219.
- Related AC: AC1, AC2, AC9, AC10.
- References:
  - `logics/request/req_035_step_by_step_onboarding_modal_flow_for_first_network_creation_and_contextual_help.md`
  - `src/app/AppController.tsx`
  - `src/app/components/layout/AppShellLayout.tsx`
