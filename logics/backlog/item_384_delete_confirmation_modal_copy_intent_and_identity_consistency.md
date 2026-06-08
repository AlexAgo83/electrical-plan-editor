## item_384_delete_confirmation_modal_copy_intent_and_identity_consistency - Delete confirmation modal copy, intent, and entity identity consistency
> From version: 0.9.14
> Status: Done
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

# AC Traceability
- request-AC1 -> This backlog slice. Evidence needed: Each delete action in UI opens a styled confirmation modal before dispatching delete mutation.
- request-AC2 -> This backlog slice. Evidence needed: Cancel always leaves state unchanged for delete operations.
- request-AC3 -> This backlog slice. Evidence needed: Confirm executes existing delete mutation flow and preserves current guard/error semantics.
- request-AC4 -> This backlog slice. Evidence needed: Delete confirmation modal content is explicit and entity-specific.
- request-AC5 -> This backlog slice. Evidence needed: No `window.confirm` remains in delete-action paths.
- request-AC1 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC2 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC3 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC4 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC5 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
