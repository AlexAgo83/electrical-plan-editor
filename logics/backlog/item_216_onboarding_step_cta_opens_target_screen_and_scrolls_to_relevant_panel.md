## item_216_onboarding_step_cta_opens_target_screen_and_scrolls_to_relevant_panel - Onboarding Step CTA Opens Target Screen and Scrolls to Relevant Panel
> From version: 0.7.3
> Understanding: 98%
> Confidence: 95%
> Progress: 0%
> Complexity: High
> Theme: Guided Navigation from Onboarding Steps to Working Panels
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
Onboarding is less useful if users cannot jump directly from a step to the relevant screen/panel. Each step needs a reliable CTA to navigate and scroll to the target context.

# Scope
- In:
  - Add per-step CTA logic to open the relevant screen/sub-screen.
  - Scroll to the target panel after navigation (with lazy-load/focus timing handled robustly).
  - Keep a CTA available when the user is already on the corresponding screen/context by adapting label/behavior (e.g. `Scroll to panel`).
  - Define and implement step->screen/panel mapping.
  - Preserve existing navigation/focus behavior and avoid race conditions.
  - Fail gracefully (non-blocking) if a target panel is temporarily unavailable after navigation.
- Out:
  - General-purpose global “scroll to panel” framework beyond onboarding needs.
  - New navigation paradigms unrelated to onboarding.

# Acceptance criteria
- Each onboarding step can navigate to and scroll to the intended panel context.
- CTA behavior is reliable when invoked from different screens.
- Navigation CTA does not break existing workspace navigation behavior.
- CTA remains useful when already on the target screen/context (adapted action instead of disappearing).
- CTA fails gracefully when a target panel cannot be scrolled/focused immediately.

# Priority
- Impact: High.
- Urgency: High.

# Notes
- Dependencies: `req_035`, item_211, item_212, item_215.
- Blocks: item_218, item_219.
- Related AC: AC6, AC8, AC11.
- References:
  - `logics/request/req_035_step_by_step_onboarding_modal_flow_for_first_network_creation_and_contextual_help.md`
  - `src/app/AppController.tsx`
  - `src/app/components/WorkspaceNavigation.tsx`
  - `src/tests/app.ui.navigation-canvas.spec.tsx`
