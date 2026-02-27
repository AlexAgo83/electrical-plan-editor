## item_384_delete_confirmation_modal_copy_intent_and_identity_consistency - Delete confirmation modal copy, intent, and entity identity consistency
> From version: 0.9.14
> Understanding: 95%
> Confidence: 92%
> Progress: 100%
> Complexity: Medium
> Theme: Confirmation UX consistency for destructive actions
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
Even with shared confirmation infrastructure, delete prompts can drift in title/message quality and action semantics if each entity uses ad-hoc copy.

# Scope
- In:
  - Standardize delete confirmation dialog semantics (`danger` intent, `Delete`/`Cancel` labels).
  - Ensure each dialog message includes unambiguous entity identity (name/technical ID where available).
  - Align copy tone and structure across catalog/modeling/network delete actions.
  - Keep keyboard and backdrop cancel behavior consistent with existing modal policy.
- Out:
  - Localization/i18n framework changes.
  - New modal variants beyond delete-confirm use cases.

# Acceptance criteria
- Delete confirmation dialogs use consistent intent and action labels.
- Entity identity is explicit in each delete message to reduce ambiguity.
- No delete flow regresses modal accessibility and interaction behavior.

# Priority
- Impact: Medium-High.
- Urgency: Medium.

# Notes
- Dependencies: `req_074`, `item_383`.
- Blocks: `item_385`, `item_386`, `task_068`.
- Related AC: AC1, AC4.
- References:
  - `logics/request/req_074_all_delete_actions_require_styled_confirmation_modal.md`
  - `src/app/types/confirm-dialog.ts`
  - `src/app/components/dialogs/ConfirmDialog.tsx`
  - `src/app/AppController.tsx`
