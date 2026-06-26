## task_147_fast_element_deletion_via_keyboard_delete_backspace - Fast element deletion via keyboard (Delete/Backspace)
> From version: 1.16.10
> Schema version: 1.0
> Status: Ready
> Understanding: 90%
> Confidence: 85%
> Progress: 0%
> Complexity: Medium
> Theme: Implementation delivery
> Reminder: Update status/understanding/confidence/progress and linked request/backlog references when you edit this doc.

# Definition of Done (DoD)
- [ ] The backlog scope is implemented.
- [ ] Acceptance criteria are covered.
- [ ] Validation passes.

# Backlog
- `item_638_fast_element_deletion_via_keyboard_delete_backspace`

# Acceptance criteria
- AC1: A selected element (any `kind`) is deleted by pressing `Delete` or `Backspace`, after confirmation.
- AC2: The keystroke is ignored if no element is selected, or if focus is inside an `input/textarea/select`/contenteditable.
- AC3: Confirmation uses the existing `ConfirmDialog`; cancelling leaves the element intact.
- AC4: Deletion routes to the correct handler based on `selected.kind`, including cascade cases (connector/splice).

# Validation
- Run `python3 -m logics_manager lint --require-status`.
- Run `python3 -m logics_manager flow finish task task_147_fast_element_deletion_via_keyboard_delete_backspace.md` after implementation.

# Report
- Implementation complete.

# AI Context
- Summary: Implement fast element deletion via keyboard (delete/backspace).
- Keywords: task, implementation, backlog, runtime, python
- Use when: You need a bounded implementation task for a backlog item.
- Skip when: The work is still at the request or backlog shaping stage.

# Links
- Request: `req_152_suppr_element_clavier`
- Product brief(s): (none yet)
- Architecture decision(s): (none yet)
