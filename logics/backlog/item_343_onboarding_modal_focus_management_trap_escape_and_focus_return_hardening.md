## item_343_onboarding_modal_focus_management_trap_escape_and_focus_return_hardening - Onboarding modal focus management trap, Escape, and focus-return hardening
> From version: 0.9.6
> Understanding: 98%
> Confidence: 93%
> Progress: 0%
> Complexity: Medium
> Theme: Modal accessibility focus management hardening
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
The onboarding modal exposes basic dialog semantics (`role="dialog"`, `aria-modal`) but lacks explicit, testable focus-management guarantees (initial focus, containment, `Escape`, focus return), which can break keyboard and assistive-technology usability.

# Scope
- In:
  - Add deterministic initial focus behavior when the onboarding modal opens.
  - Ensure focus remains within the modal while it is open (focus trap or equivalent containment strategy).
  - Support keyboard dismissal via `Escape` (unless explicitly disabled by product policy in code/docs).
  - Restore focus to a sensible triggering/previous element when the modal closes.
  - Preserve current modal content/actions, backdrop click dismiss behavior, and existing onboarding flow logic.
  - Add/extend regression coverage for modal focus behavior where feasible.
- Out:
  - Drawer/operations panel shell focus handling (already covered elsewhere unless touched by regression).
  - Non-onboarding dialogs/modals not part of this request.

# Acceptance criteria
- Opening the onboarding modal sets focus deterministically to an intended control/element inside the modal.
- Keyboard `Tab` / `Shift+Tab` navigation stays within the modal while open in normal usage.
- `Escape` closes the onboarding modal and focus returns to a sensible previous/trigger element.
- Existing onboarding interactions (next/close/target actions/toggle) remain functional.

# Priority
- Impact: High.
- Urgency: High.

# Notes
- Dependencies: `req_060`.
- Blocks: `task_057`.
- Related AC: req_060 AC3.
- References:
  - `logics/request/req_060_accessibility_hardening_for_interactive_network_summary_modal_focus_sortable_tables_and_validation_navigation.md`
  - `src/app/components/onboarding/OnboardingModal.tsx`
  - `src/app/AppController.tsx`
  - `src/tests/app.ui.onboarding.spec.tsx`

